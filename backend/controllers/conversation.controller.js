const Conversation = require('../models/conversation.model');
const Item = require('../models/item.model');
const User = require('../models/user.model');

exports.createConversation = async (req, res) => {
  try {
    const { itemId, participants } = req.validatedBody;
    console.log('Received request with itemId:', itemId, 'and participants:', participants);

    // Validate participants is an array
    if (!Array.isArray(participants) || participants.length !== 2) {
      return res.status(400).json({ message: 'Participants must be an array with exactly 2 entries', code: 'INVALID_PARTICIPANTS' });
    }

    // Validate item
    const item = await Item.findOne({ _id: itemId, isActive: true });
    if (!item) {
      return res.status(404).json({ message: 'Item not found', code: 'NOT_FOUND' });
    }
    console.log('Item status before conversation:', item.status);

    // Sort participants for consistency
    const sortedParticipants = [...participants].sort();
    console.log('Sorted participants:', sortedParticipants);

    // Debug: Check existing conversations for this item
    const existingConversations = await Conversation.find({ item: itemId });
    console.log('Existing conversations for item:', existingConversations);

    // Check for existing conversation (order-independent)
    console.log('Executing findOne with query:', {
      item: itemId,
      participants: { $all: sortedParticipants, $size: sortedParticipants.length },
      isActive: true,
    });
    const existingConversation = await Conversation.findOne({
      item: itemId,
      participants: { $all: sortedParticipants, $size: sortedParticipants.length },
      isActive: true,
    });
    console.log('Existing conversation check result:', existingConversation);

    if (existingConversation) {
      return res.status(200).json({
        message: 'Conversation already exists',
        conversation: existingConversation,
      });
    }

    // Create new conversation
    const conversation = new Conversation({
      item: itemId,
      participants: sortedParticipants,
      isActive: true,
    });

    await conversation.save();
    console.log('Conversation saved successfully:', conversation._id);

    // Verify item status after save
    const updatedItem = await Item.findById(itemId);
    console.log('Item status after conversation:', updatedItem.status);

    res.status(201).json({ message: 'Conversation created successfully', conversation });
  } catch (error) {
    console.error('Error creating conversation:', error.message, error.stack);
    if (error.code === 11000) {
      // Debug: Fetch potential duplicate
      const potentialDuplicate = await Conversation.find({
        item: req.validatedBody.itemId,
        participants: { $in: req.validatedBody.participants },
      });
      console.log('Potential duplicate conversations:', potentialDuplicate);
      return res.status(409).json({
        message: 'A conversation with this item and participants already exists',
        code: 'DUPLICATE_CONVERSATION',
        potentialDuplicate,
      });
    }
    res.status(500).json({ message: 'Failed to create conversation', code: 'SERVER_ERROR' });
  }
};

// Get all conversations for the authenticated user
exports.getConversations = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // Use the authenticated user's ID
    const userId = req.user.id;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is missing from authentication token', code: 'MISSING_USER_ID' });
    }

    // Validate user exists
    const user = await User.findOne({ _id: userId, isActive: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found or inactive', code: 'NOT_FOUND' });
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      populate: [
        { path: 'item', select: 'title status' },
        { path: 'participants', select: 'name email' },
        { path: 'lastMessage', select: 'content createdAt isRead' },
      ],
      sort: { updatedAt: -1 },
    };

    const conversations = await Conversation.paginate({ participants: userId, isActive: true }, options);
    res.status(200).json({
      message: 'Conversations fetched successfully',
      conversations: {
        docs: conversations.docs,
        totalDocs: conversations.totalDocs,
        limit: conversations.limit,
        page: conversations.page,
        totalPages: conversations.totalPages,
        pagingCounter: conversations.pagingCounter,
        hasPrevPage: conversations.hasPrevPage,
        hasNextPage: conversations.hasNextPage,
        prevPage: conversations.prevPage,
        nextPage: conversations.nextPage,
      },
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Failed to fetch conversations', code: 'SERVER_ERROR' });
  }
};