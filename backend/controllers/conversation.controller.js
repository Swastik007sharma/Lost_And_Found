const Conversation = require('../models/conversation.model');
const { createConversationSchema } = require('../schema/conversation.schema.js'); // Import Zod schema

// Create a new conversation about an item
exports.createConversation = async (req, res) => {
  try {
    // Validate request body using Zod schema
    const { itemId, participants } = createConversationSchema.parse(req.body);

    // Check if the item exists
    const Item = require('../models/item.model');
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Check if all participants exist
    const User = require('../models/user.model');
    const validParticipants = await User.find({ _id: { $in: participants } });
    if (validParticipants.length !== participants.length) {
      return res.status(400).json({ error: 'One or more participants are invalid' });
    }

    // Create the conversation
    const conversation = new Conversation({
      item: itemId,
      participants,
    });

    await conversation.save();
    res.status(201).json({ message: 'Conversation created successfully', conversation });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
};

// Get all conversations for a specific user
exports.getConversations = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Validate userId
    const User = require('../models/user.model');
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Fetch conversations with pagination
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      populate: ['item', 'participants'], // Populate references
    };

    const conversations = await Conversation.paginate({ participants: userId }, options); // Use mongoose-paginate-v2
    res.status(200).json({ conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
};