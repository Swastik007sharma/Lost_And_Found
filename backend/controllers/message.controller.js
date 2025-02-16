const Message = require('../models/message.model');
const Conversation = require('../models/conversation.model');
const { idSchema } = require('../schema/common.schema'); // Import common validation schema

// Get all messages in a specific conversation
exports.getMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Validate conversation ID
    idSchema.parse(id);

    // Find the conversation
    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Check if the user is a participant in the conversation
    if (!conversation.participants.includes(req.user._id)) {
      return res.status(403).json({ error: 'You are not authorized to access this conversation' });
    }

    // Fetch messages with pagination
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      populate: 'sender', // Populate sender reference
      sort: { createdAt: 1 }, // Sort messages by creation time
    };
    const messages = await Message.paginate({ conversation: id }, options); // Use mongoose-paginate-v2

    res.status(200).json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error.message);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

// Send a message in a specific conversation
exports.sendMessage = async (req, res) => {
  try {
    const { id } = req.params; // Conversation ID
    const { text } = req.body; // Message content

    // Validate conversation ID
    idSchema.parse(id);

    // Validate that the message text is provided
    if (!text || text.trim() === '') {
      return res.status(400).json({ error: 'Message text is required' });
    }

    // Find the conversation
    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Check if the user is a participant in the conversation
    if (!conversation.participants.includes(req.user._id)) {
      return res.status(403).json({ error: 'You are not authorized to send messages in this conversation' });
    }

    // Create a new message
    const newMessage = new Message({
      conversation: id,
      sender: req.user._id,
      text,
    });

    // Save the message to the database
    await newMessage.save();

    // Optionally, update the conversation's last message timestamp
    conversation.lastMessage = newMessage._id;
    await conversation.save();

    // Populate the sender field for richer response
    const populatedMessage = await Message.findById(newMessage._id).populate('sender', 'name email');

    res.status(201).json({ message: 'Message sent successfully', message: populatedMessage });
  } catch (error) {
    console.error('Error sending message:', error.message);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to send message' });
  }
};