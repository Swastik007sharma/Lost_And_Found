const Conversation = require('../models/conversation.model');
const { createConversationSchema } = require('../schema/conversation.schema.js'); // Import Zod schema

// Create a new conversation about an item
exports.createConversation = async (req, res) => {
  try {
    // Validate request body using Zod schema
    const { itemId, participants } = createConversationSchema.parse(req.body);

    // Check if the item exists
    const Item = require('../models/item.model');
    const item = await Item.findOne({ _id: itemId, isActive: true });
    if (!item) {
      return res.status(404).json({ message: 'Item not found', code: 'NOT_FOUND' });
    }

    // Check if all participants exist
    const User = require('../models/user.model');
    const validParticipants = await User.find({ _id: { $in: participants }, isActive: true });
    if (validParticipants.length !== participants.length) {
      return res.status(400).json({ message: 'One or more participants are invalid or inactive', code: 'INVALID_PARTICIPANTS' });
    }

    // Create the conversation
    const conversation = new Conversation({
      item: itemId,
      participants,
      isActive: true,
    });

    await conversation.save();
    res.status(201).json({ message: 'Conversation created successfully', conversation });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Validation failed', code: 'VALIDATION_ERROR', details: error.errors });
    }
    console.error('Error creating conversation:', error);
    res.status(500).json({ message: 'Failed to create conversation', code: 'SERVER_ERROR' });
  }
};

// Get all conversations for a specific user
exports.getConversations = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Validate userId
    const User = require('../models/user.model');
    const user = await User.findOne({ _id: userId, isActive: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found or inactive', code: 'NOT_FOUND' });
    }

    // Fetch conversations with pagination
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      populate: ['item', 'participants', 'lastMessage'], // Added lastMessage
      sort: { updatedAt: -1 }, // Sort by most recent update
    };

    const conversations = await Conversation.paginate({ participants: userId, isActive: true }, options); // Use mongoose-paginate-v2
    res.status(200).json({ message: 'Conversations fetched successfully', conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Failed to fetch conversations', code: 'SERVER_ERROR' });
  }
};