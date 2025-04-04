const User = require('../models/user.model');
const Item = require('../models/item.model');
const Category = require('../models/category.model');
const Conversation = require('../models/conversation.model');
const Message = require('../models/message.model');

// Get a list of all users (admin-only)
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query; // Added pagination
    const users = await User.find({ isActive: true }, 'name email role createdAt') // Select only necessary fields
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await User.countDocuments({ isActive: true });
    res.status(200).json({ 
      message: 'Users fetched successfully',
      users,
      pagination: { currentPage: parseInt(page), totalPages: Math.ceil(total / limit), total } 
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users', code: 'SERVER_ERROR' });
  }
};

// Get a single user by ID (admin-only)
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id, 'name email role createdAt').lean(); // Select only necessary fields
    if (!user) {
      return res.status(404).json({ message: 'User not found', code: 'NOT_FOUND' });
    }
    res.status(200).json({ 
      message: 'User fetched successfully',
      user 
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Failed to fetch user', code: 'SERVER_ERROR' });
  }
};

// Get all items posted or claimed by a user (admin-only)
exports.getUserItems = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query; // Added pagination

    // Check if the user exists and is active
    const user = await User.findOne({ _id: id, isActive: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found or inactive', code: 'NOT_FOUND' });
    }

    // Fetch items where the user is either the poster (postedBy) or the claimer (claimedBy)
    const items = await Item.find({
      $or: [
        { postedBy: id },
        { claimedBy: id }
      ],
      isActive: true
    })
      .populate('postedBy', 'name email') // Populate user details for postedBy
      .populate('claimedBy', 'name email') // Populate user details for claimedBy
      .populate('category', 'name') // Populate category details
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Item.countDocuments({
      $or: [
        { postedBy: id },
        { claimedBy: id }
      ],
      isActive: true
    });

    res.status(200).json({
      message: 'User items fetched successfully',
      items,
      pagination: { currentPage: parseInt(page), totalPages: Math.ceil(total / limit), total }
    });
  } catch (error) {
    console.error('Error fetching user items:', error);
    res.status(500).json({ message: 'Failed to fetch user items', code: 'SERVER_ERROR' });
  }
};

// Delete a user (admin-only)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    // Find and update the user to inactive instead of deleting
    const user = await User.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found', code: 'NOT_FOUND' });
    }
    // Optionally handle items posted by this user
    await Item.updateMany({ postedBy: id }, { postedBy: null });
    res.status(200).json({ message: 'User deactivated successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Failed to deactivate user', code: 'SERVER_ERROR' });
  }
};

// Get a list of all items (admin-only)
exports.getAllItems = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query; // Added pagination
    const items = await Item.find({ isActive: true })
      .populate('postedBy', 'name email') // Populate user details
      .populate('category', 'name') // Populate category details
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Item.countDocuments({ isActive: true });
    res.status(200).json({ 
      message: 'Items fetched successfully',
      items,
      pagination: { currentPage: parseInt(page), totalPages: Math.ceil(total / limit), total } 
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ message: 'Failed to fetch items', code: 'SERVER_ERROR' });
  }
};

// Get a single item by ID (admin-only)
exports.getItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Item.findOne({ _id: id, isActive: true })
      .populate('postedBy', 'name email') // Populate user details
      .populate('category', 'name') // Populate category details
      .lean(); // Convert to plain JavaScript object
    if (!item) {
      return res.status(404).json({ message: 'Item not found', code: 'NOT_FOUND' });
    }
    res.status(200).json({ 
      message: 'Item fetched successfully',
      item 
    });
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ message: 'Failed to fetch item', code: 'SERVER_ERROR' });
  }
};

// Delete an item (admin-only)
exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    // Find and update the item to inactive instead of deleting
    const item = await Item.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!item) {
      return res.status(404).json({ message: 'Item not found', code: 'NOT_FOUND' });
    }
    res.status(200).json({ message: 'Item deactivated successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ message: 'Failed to deactivate item', code: 'SERVER_ERROR' });
  }
};

// Get admin dashboard statistics
exports.getAdminDashboardStats = async (req, res) => {
  try {
    // Total number of items posted
    const totalItems = await Item.countDocuments({ isActive: true });

    // Number of claimed vs. unclaimed items
    const claimedItems = await Item.countDocuments({ isClaimed: true, isActive: true });
    const unclaimedItems = await Item.countDocuments({ isClaimed: false, isActive: true });

    // Total number of users
    const totalUsers = await User.countDocuments({ isActive: true });

    // Total number of categories
    const totalCategories = await Category.countDocuments();

    // Most active users (top 5 users who have posted the most items)
    const mostActiveUsers = await Item.aggregate([
      { $match: { isActive: true } }, // Filter active items
      { $group: { _id: '$postedBy', count: { $sum: 1 } } }, // Group by user ID and count items
      { $sort: { count: -1 } }, // Sort by count in descending order
      { $limit: 5 }, // Limit to top 5 users
      {
        $lookup: {
          from: 'users', // Join with the User collection
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      { $unwind: '$userDetails' }, // Flatten the userDetails array
      {
        $project: {
          _id: 0,
          userId: '$_id',
          name: '$userDetails.name',
          email: '$userDetails.email',
          itemCount: '$count',
        },
      },
    ]);

    // Return the statistics
    res.status(200).json({
      message: 'Admin dashboard stats fetched successfully',
      stats: {
        totalItems,
        claimedItems,
        unclaimedItems,
        totalUsers,
        totalCategories,
        mostActiveUsers,
      },
    });
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error.message);
    res.status(500).json({ message: 'Failed to fetch admin dashboard stats', code: 'SERVER_ERROR' });
  }
};

// Get conversations and messages (admin-only)
exports.getConversationsAndMessages = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query; // Added pagination

    // Fetch all active conversations with populated participants, item, and lastMessage details
    const conversations = await Conversation.find({ isActive: true })
      .populate('participants', 'name email') // Populate user details for participants
      .populate('item', 'title status') // Populate item details
      .populate('lastMessage', 'content sender createdAt isRead') // Populate last message details
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Fetch all active messages for the retrieved conversation IDs, sorted by creation time
    const conversationIds = conversations.map(conv => conv._id);
    const messages = await Message.find({ conversation: { $in: conversationIds }, isActive: true })
      .populate('sender', 'name email') // Populate sender details
      .sort({ createdAt: -1 }); // Sort by creation time descending (matches index)

    // Group messages by conversation
    const conversationsWithMessages = conversations.map(conv => ({
      ...conv.toObject(),
      messages: messages.filter(msg => msg.conversation.toString() === conv._id.toString()),
    }));

    const total = await Conversation.countDocuments({ isActive: true });
    res.status(200).json({
      message: 'Conversations and messages fetched successfully',
      conversations: conversationsWithMessages,
      pagination: { currentPage: parseInt(page), totalPages: Math.ceil(total / limit), total },
    });
  } catch (error) {
    console.error('Error fetching conversations and messages:', error);
    res.status(500).json({ message: 'Failed to fetch conversations and messages', code: 'SERVER_ERROR' });
  }
};