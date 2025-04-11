const socketIo = require('socket.io');
const Notification = require('../models/notification.model');
const Conversation = require('../models/conversation.model');
const sendEmail = require('./sendEmail'); // Adjust path as needed

module.exports = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: (origin, callback) => {
        const allowedOrigins = process.env.ALLOWED_ORIGINS
          ? process.env.ALLOWED_ORIGINS.split(',')
          : ['http://localhost:5173', 'http://localhost:5000', 'http://localhost:3000'];
        console.log('Requested origin:', origin, 'Allowed origins:', allowedOrigins);
        if (!origin || allowedOrigins.includes(origin)) {
          console.log('Origin allowed:', origin);
          callback(null, true);
        } else {
          console.log('Origin denied:', origin);
          callback(new Error('Not allowed by CORS'));
        }
      },
      methods: ['GET', 'POST', 'OPTIONS'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization', 'Upgrade', 'Connection'],
    },
    transports: ['websocket'],
    upgradeTimeout: 15000,
    pingTimeout: 30000,
    pingInterval: 30000,
    forceNew: true,
  });

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id, 'Transport:', socket.conn.transport.name, 'Handshake:', socket.handshake);

    const userId = socket.handshake.query.userId;

    if (userId) {
      socket.join(userId);
      console.log(`User ${userId} joined personal room`);
    } else {
      console.log('No userId provided, connection may be unstable');
    }

    socket.conn.on('upgrade', () => {
      console.log('Upgrade attempt detected for socket:', socket.id);
    });

    socket.conn.on('upgradeError', (error) => {
      console.error('Upgrade error for socket:', socket.id, 'Error:', JSON.stringify(error));
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connect error:', error.message, 'Details:', JSON.stringify(error));
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error.message, 'Details:', JSON.stringify(error));
    });

    socket.on('upgrade', (transport) => {
      console.log('Upgraded to transport:', transport.name);
    });

    socket.on('joinConversation', (conversationId) => {
      socket.join(conversationId);
      console.log(`User ${userId} joined conversation: ${conversationId}`);
    });

    socket.on('leaveConversation', (conversationId) => {
      socket.leave(conversationId);
      console.log(`User ${userId} left conversation: ${conversationId}`);
    });

    socket.on('sendMessage', async ({ conversationId, senderId, content, _id, createdAt }) => {
      try {
        if (!_id) {
          console.warn('No _id provided in sendMessage, message not saved via socket');
          return socket.emit('errorMessage', 'Message not saved, please use API');
        }

        // Broadcast the message (already saved by API)
        const message = {
          _id,
          conversation: conversationId,
          sender: senderId,
          content,
          createdAt,
          isRead: false,
          isActive: true,
        };
        io.to(conversationId).emit('receiveMessage', message);

        // Fetch conversation details
        const conversation = await Conversation.findById(conversationId).populate('item participants', 'name email');
        if (!conversation) {
          console.warn('Conversation not found for notification');
          return;
        }

        // Assume sender is the claimant for simplicity (adjust logic if claimant is tracked differently)
        const claimant = conversation.participants.find(p => p._id.toString() === senderId);
        if (!claimant) {
          console.warn('Claimant not found in participants');
          return;
        }

        // Send email to claimant
        const exchangeLocation = 'Your exchange location here'; // Replace with dynamic data if available
        await sendEmail(
          claimant.email,
          'Claim Notification',
          'claimNotification',
          {
            name: claimant.name,
            itemTitle: conversation.item ? conversation.item.title : 'Unknown Item',
            exchangeLocation,
          }
        );

        // Send notification to claimant
        const notificationData = {
          userId: claimant._id,
          message: `Your claim for ${conversation.item ? conversation.item.title : 'an item'} has been noted. Exchange at ${exchangeLocation}.`,
          type: 'conversation',
          isRead: false,
        };
        if (conversation.item) {
          notificationData.itemId = conversation.item._id;
        }

        const notification = new Notification(notificationData);
        await notification.save();
        io.to(claimant._id.toString()).emit('newNotification', notification);

        // Notify other participants (optional)
        const recipients = conversation.participants.filter(p => p._id.toString() !== senderId);
        for (const recipient of recipients) {
          const recipientNotification = new Notification({
            userId: recipient._id,
            message: `A new message from ${claimant.name} in conversation ${conversationId}`,
            type: 'conversation',
            isRead: false,
            itemId: conversation.item ? conversation.item._id : undefined,
          });
          await recipientNotification.save();
          io.to(recipient._id.toString()).emit('newNotification', recipientNotification);
        }
      } catch (error) {
        console.error('Error in sendMessage:', error.message, error.stack);
        socket.emit('errorMessage', 'Failed to process message, email, or notification');
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('Client disconnected:', socket.id, 'Reason:', reason, 'Transport:', socket.conn.transport.name, 'Details:', socket.conn.transport ? socket.conn.transport.socket._events : 'No transport events');
    });
  });

  io.on('error', (err) => {
    console.error('Socket.IO server error:', err.message, 'Details:', JSON.stringify(err));
  });

  return io;
};