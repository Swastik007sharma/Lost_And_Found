const Message = require('../models/message.model');
const Conversation = require('../models/conversation.model');
const { idSchema } = require('../schema/common.schema');

exports.getMessages = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Raw params id:', id, typeof id); // Debug log

    // Validate the id string directly using the inner schema
    const validatedId = idSchema.shape.id.parse(id);
    console.log('Validated id:', validatedId, typeof validatedId); // Debug log

    const { page, limit } = req.validatedQuery; // Access validated query params

    const conversation = await Conversation.findById(validatedId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    console.log('Current user ID:', req.user.id, typeof req.user.id); // Debug log
    console.log('Conversation participants:', conversation.participants); // Debug log

    if (!conversation.participants.includes(req.user.id)) {
      return res.status(403).json({ error: 'You are not authorized to access this conversation' });
    }

    const options = {
      page,
      limit,
      populate: 'sender',
      sort: { createdAt: 1 },
    };
    const messages = await Message.paginate({ conversation: validatedId }, options);

    res.status(200).json({ messages: messages.docs });
  } catch (error) {
    console.error('Error fetching messages:', error.message);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Received request body:', req.body, typeof req.body);

    const { content } = req.validatedBody;

    // Validate the id string directly using the inner schema
    const validatedId = idSchema.shape.id.parse(id);
    console.log('Validated id:', validatedId, typeof validatedId);

    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const conversation = await Conversation.findById(validatedId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    console.log('Current user ID:', req.user.id, typeof req.user.id); // Debug log
    console.log('Conversation participants:', conversation.participants); // Debug log

    if (!conversation.participants.includes(req.user.id)) {
      return res.status(403).json({ error: 'You are not authorized to send messages in this conversation' });
    }

    const newMessage = new Message({
      conversation: validatedId,
      sender: req.user.id,
      content,
    });

    await newMessage.save();

    console.log('New message saved:', newMessage);
    conversation.lastMessage = newMessage._id;
    await conversation.save();

    const populatedMessage = await Message.findById(newMessage._id).populate('sender', 'name email');

    res.status(201).json({ message: 'Message sent successfully', message: populatedMessage });
  } catch (error) {
    console.error('Error sending message:', error.message);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to send message', details: error.message });
  }
};