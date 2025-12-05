const User = require('../models/user.model');
const Item = require('../models/item.model');
const Category = require('../models/category.model');
const Conversation = require('../models/conversation.model');
const Message = require('../models/message.model');

// Get a list of all users (admin-only)
exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', sortBy = 'createdAt', order = 'desc', isActive } = req.query;
    const skip = (page - 1) * limit;

    // Build the aggregation pipeline
    const pipeline = [];
    const matchConditions = {};

    // Filter by active/inactive status if provided
    if (isActive !== undefined && isActive !== '') {
      matchConditions.isActive = isActive === 'true';
    }

    if (search) {
      matchConditions.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { role: { $regex: search, $options: 'i' } },
      ];
    }

    pipeline.push({ $match: matchConditions });
    pipeline.push({ $project: { name: 1, email: 1, role: 1, createdAt: 1, isActive: 1 } });
    pipeline.push({ $sort: { [sortBy]: order === 'asc' ? 1 : -1 } });
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: parseInt(limit, 10) });

    const users = await User.aggregate(pipeline);
    const total = await User.countDocuments(matchConditions);

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

// Toggle user activation status (admin-only)
exports.toggleUserActivation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, [{ $set: { isActive: { $eq: [false, '$isActive'] } } }], { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found', code: 'NOT_FOUND' });
    }
    res.status(200).json({ message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`, user });
  } catch (error) {
    console.error('Error toggling user activation:', error);
    res.status(500).json({ message: 'Failed to toggle user activation', code: 'SERVER_ERROR' });
  }
};

// Get a single user by ID (admin-only)
exports.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id, 'name email role createdAt isActive profileImage location department description').lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found', code: 'NOT_FOUND' });
    }
    res.status(200).json({ message: 'User fetched successfully', user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Failed to fetch user', code: 'SERVER_ERROR' });
  }
};

// Get all items posted or claimed by a user (admin-only)
exports.getUserItems = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const user = await User.findOne({ _id: id, isActive: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found or inactive', code: 'NOT_FOUND' });
    }

    const items = await Item.find({
      $or: [{ postedBy: id }, { claimedBy: id }],
      isActive: true
    })
      .populate('postedBy', 'name email')
      .populate('claimedBy', 'name email')
      .populate('category', 'name')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Item.countDocuments({
      $or: [{ postedBy: id }, { claimedBy: id }],
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

// Delete a user (admin-only) - Kept as is for now
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found', code: 'NOT_FOUND' });
    }
    await Item.updateMany({ postedBy: id }, { postedBy: null });
    res.status(200).json({ message: 'User deactivated successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Failed to deactivate user', code: 'SERVER_ERROR' });
  }
};

// Get a list of all items (admin-only)
// Get all items (with optional filters) - Updated to include extra details
exports.getItems = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc', search = '' } = req.query;

    // Build query for filtering items
    const query = { isActive: true }; // Only active items (adjust based on admin needs)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    // Fetch paginated and sorted items
    const items = await Item.find(query)
      .populate('postedBy', 'name email') // Populate poster details
      .populate('category', 'name') // Populate category details
      .populate('keeper', 'name') // Populate keeper details
      .populate('claimedBy', 'name') // Populate claimant details
      .sort({ [sortBy]: order === 'asc' ? 1 : -1 }) // Sort by field and order
      .limit(parseInt(limit)) // Limit results per page
      .skip((parseInt(page) - 1) * parseInt(limit)); // Skip items for pagination

    // Count total items for pagination metadata
    const totalItems = await Item.countDocuments(query);

    // Transform items to include keeperId, keeperName, claimedById, and claimedByName
    const transformedItems = items.map(item => ({
      ...item.toObject(),
      keeperId: item.keeper ? item.keeper._id : null,
      keeperName: item.keeper ? item.keeper.name : null,
      claimedById: item.claimedBy ? item.claimedBy._id : null,
      claimedByName: item.claimedBy ? item.claimedBy.name : null,
    }));

    res.status(200).json({
      message: 'Items fetched successfully',
      items: transformedItems,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalItems / parseInt(limit)),
        totalResults: totalItems,
      },
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ message: 'Failed to fetch items', code: 'SERVER_ERROR' });
  }
};

// New route handler for /admin/items (can reuse getItems logic or add admin-specific filters)
exports.getAllItems = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc', search = '' } = req.query;

    // Build query for filtering items (admin might see all items, including inactive)
    const query = {}; // No isActive filter for admin (adjust based on requirements)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    // Fetch paginated and sorted items
    const items = await Item.find(query)
      .populate('postedBy', 'name email') // Populate poster details
      .populate('category', 'name') // Populate category details
      .populate('keeper', 'name') // Populate keeper details
      .populate('claimedBy', 'name') // Populate claimant details
      .sort({ [sortBy]: order === 'asc' ? 1 : -1 }) // Sort by field and order
      .limit(parseInt(limit)) // Limit results per page
      .skip((parseInt(page) - 1) * parseInt(limit)); // Skip items for pagination

    // Count total items for pagination metadata
    const totalItems = await Item.countDocuments(query);

    // Transform items to include keeperId, keeperName, claimedById, and claimedByName
    const transformedItems = items.map(item => ({
      ...item.toObject(),
      keeperId: item.keeper ? item.keeper._id : null,
      keeperName: item.keeper ? item.keeper.name : null,
      claimedById: item.claimedBy ? item.claimedBy._id : null,
      claimedByName: item.claimedBy ? item.claimedBy.name : null,
    }));

    res.status(200).json({
      message: 'Items fetched successfully',
      items: transformedItems,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalItems / parseInt(limit)),
        totalResults: totalItems,
      },
    });
  } catch (error) {
    console.error('Error fetching all items:', error);
    res.status(500).json({ message: 'Failed to fetch items', code: 'SERVER_ERROR' });
  }
};

// Toggle item activation status (admin-only)
exports.toggleItemActivation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await Item.findByIdAndUpdate(id, [{ $set: { isActive: { $eq: [false, '$isActive'] } } }], { new: true });
    if (!item) {
      return res.status(404).json({ message: 'Item not found', code: 'NOT_FOUND' });
    }
    res.status(200).json({ message: `Item ${item.isActive ? 'activated' : 'deactivated'} successfully`, item });
  } catch (error) {
    console.error('Error toggling item activation:', error);
    res.status(500).json({ message: 'Failed to toggle item activation', code: 'SERVER_ERROR' });
  }
};

// Get a single item by ID (admin-only)
exports.getItemById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await Item.findOne({ _id: id, isActive: true })
      .populate('postedBy', 'name email')
      .populate('category', 'name')
      .lean();
    if (!item) {
      return res.status(404).json({ message: 'Item not found', code: 'NOT_FOUND' });
    }
    res.status(200).json({ message: 'Item fetched successfully', item });
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ message: 'Failed to fetch item', code: 'SERVER_ERROR' });
  }
};

// Delete an item (admin-only) - Kept as is for now
exports.deleteItem = async (req, res, next) => {
  try {
    const { id } = req.params;
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
exports.getAdminDashboardStats = async (req, res, next) => {
  try {
    const totalItems = await Item.countDocuments({ isActive: true });
    const claimedItems = await Item.countDocuments({ isClaimed: true, isActive: true });
    const unclaimedItems = await Item.countDocuments({ isClaimed: false, isActive: true });
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalCategories = await Category.countDocuments();

    const mostActiveUsers = await Item.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$postedBy', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      { $unwind: '$userDetails' },
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
exports.getConversationsAndMessages = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sortOrder = 'desc' } = req.query;
    const sortValue = sortOrder === 'asc' ? 1 : -1;

    const conversations = await Conversation.find({ isActive: true })
      .populate('participants', 'name email')
      .populate('item', 'title status')
      .populate('lastMessage', 'content sender createdAt isRead')
      .sort({ createdAt: sortValue })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const conversationIds = conversations.map(conv => conv._id);
    const messages = await Message.find({ conversation: { $in: conversationIds }, isActive: true })
      .populate('sender', 'name email')
      .sort({ createdAt: -1 });

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

// ========================
// Cleanup/Deletion Methods
// ========================

const cleanupService = require('../services/cleanupService');

/**
 * Get items scheduled for deletion
 */
exports.getScheduledDeletions = async (req, res, next) => {
  try {
    const items = await cleanupService.getScheduledDeletions();
    res.status(200).json({
      success: true,
      message: 'Scheduled deletions fetched successfully',
      items,
      count: items.length
    });
  } catch (error) {
    console.error('Error fetching scheduled deletions:', error);
    res.status(500).json({
      message: 'Failed to fetch scheduled deletions',
      code: 'SERVER_ERROR',
      error: error.message,
    });
  }
};

/**
 * Cancel scheduled deletion for an item
 */
exports.cancelScheduledDeletion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await cleanupService.cancelScheduledDeletion(id);
    res.status(200).json({
      success: true,
      message: 'Deletion cancelled successfully',
      item
    });
  } catch (error) {
    console.error('Error cancelling deletion:', error);
    res.status(500).json({
      message: error.message || 'Failed to cancel deletion',
      code: 'SERVER_ERROR',
      error: error.message
    });
  }
};

/**
 * Manual trigger for cleanup (testing purposes)
 */
exports.triggerCleanup = async (req, res, next) => {
  try {
    console.log('🔧 Manual cleanup triggered by admin');
    const markResults = await cleanupService.markInactiveItemsForDeletion();
    const deleteResults = await cleanupService.deleteScheduledItems();

    res.status(200).json({
      success: true,
      message: 'Cleanup executed successfully',
      marked: markResults.length,
      deleted: deleteResults.filter((r) => r.success).length,
      failed: deleteResults.filter((r) => !r.success).length,
      details: {
        markedItems: markResults,
        deletedItems: deleteResults,
      }
    });
  } catch (error) {
    console.error('Error triggering cleanup:', error);
    res.status(500).json({
      message: 'Cleanup failed',
      code: 'SERVER_ERROR',
      error: error.message
    });
  }
};

/**
 * Get users scheduled for deletion
 */
exports.getScheduledUserDeletions = async (req, res, next) => {
  try {
    const users = await cleanupService.getScheduledUserDeletions();
    res.status(200).json({
      success: true,
      message: 'Scheduled user deletions fetched successfully',
      users,
      count: users.length
    });
  } catch (error) {
    console.error('Error fetching scheduled user deletions:', error);
    res.status(500).json({
      message: 'Failed to fetch scheduled user deletions',
      code: 'SERVER_ERROR',
      error: error.message,
    });
  }
};

/**
 * Cancel scheduled deletion for a user
 */
exports.cancelScheduledUserDeletion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await cleanupService.cancelScheduledUserDeletion(id);
    res.status(200).json({
      success: true,
      message: 'User deletion cancelled successfully',
      user
    });
  } catch (error) {
    console.error('Error cancelling user deletion:', error);
    res.status(500).json({
      message: error.message || 'Failed to cancel user deletion',
      code: 'SERVER_ERROR',
      error: error.message
    });
  }
};

/**
 * Get cleanup configuration
 */
exports.getCleanupConfig = async (req, res, next) => {
  try {
    const config = {
      userDeletionStrategy: process.env.USER_DELETION_STRATEGY || 'deactivation',
      inactivityDays: parseInt(process.env.INACTIVITY_DAYS || '60', 10),
      gracePeriodDays: parseInt(process.env.GRACE_PERIOD_DAYS || '7', 10),
      strategies: {
        inactivity: {
          name: 'Inactivity-Based',
          description: 'Delete users after specified days of no login activity',
          criteria: 'Based on lastLoginDate field',
        },
        deactivation: {
          name: 'Deactivation-Based',
          description: 'Delete users after specified days since account was deactivated (isActive = false)',
          criteria: 'Based on deactivatedAt field (when isActive changed to false)',
        },
      },
    };

    res.status(200).json({
      success: true,
      message: 'Cleanup configuration fetched successfully',
      config
    });
  } catch (error) {
    console.error('Error fetching cleanup config:', error);
    res.status(500).json({
      message: 'Failed to fetch cleanup configuration',
      code: 'SERVER_ERROR',
      error: error.message,
    });
  }
};

/**
 * Update cleanup configuration
 */
exports.updateCleanupConfig = async (req, res, next) => {
  try {
    const { userDeletionStrategy, inactivityDays, gracePeriodDays } = req.body;

    // Validate strategy
    if (userDeletionStrategy && !['inactivity', 'deactivation'].includes(userDeletionStrategy)) {
      return res.status(400).json({
        message: 'Invalid user deletion strategy. Must be "inactivity" or "deactivation"',
        code: 'INVALID_STRATEGY',
      });
    }

    // Validate days
    if (inactivityDays && (inactivityDays < 1 || inactivityDays > 365)) {
      return res.status(400).json({
        message: 'Inactivity days must be between 1 and 365',
        code: 'INVALID_DAYS',
      });
    }

    if (gracePeriodDays && (gracePeriodDays < 1 || gracePeriodDays > 30)) {
      return res.status(400).json({
        message: 'Grace period days must be between 1 and 30',
        code: 'INVALID_DAYS',
      });
    }

    // Note: In production, these would be stored in a database
    // For now, we'll inform the admin to update the .env file
    const updatedConfig = {
      userDeletionStrategy: userDeletionStrategy || process.env.USER_DELETION_STRATEGY || 'deactivation',
      inactivityDays: inactivityDays || parseInt(process.env.INACTIVITY_DAYS || '60', 10),
      gracePeriodDays: gracePeriodDays || parseInt(process.env.GRACE_PERIOD_DAYS || '7', 10),
    };

    res.status(200).json({
      success: true,
      message: 'Configuration update requested. Please update the following in your .env file and restart the server:',
      envUpdates: {
        USER_DELETION_STRATEGY: updatedConfig.userDeletionStrategy,
        INACTIVITY_DAYS: updatedConfig.inactivityDays,
        GRACE_PERIOD_DAYS: updatedConfig.gracePeriodDays,
      },
      note: 'Server restart required for changes to take effect'
    });
  } catch (error) {
    console.error('Error updating cleanup config:', error);
    res.status(500).json({
      message: 'Failed to update cleanup configuration',
      code: 'SERVER_ERROR',
      error: error.message,
    });
  }
};

// Get report of items scheduled for deletion
exports.getScheduledItemsReport = async (req, res, next) => {
  try {
    const scheduledItems = await Item.find({
      scheduledForDeletion: true,
      deletionScheduledAt: { $exists: true }
    })
      .populate('postedBy', 'name email')
      .populate('category', 'name')
      .populate('subCategory', 'name')
      .select('title description status location deletionScheduledAt deletionWarningEmailSent lastActivityDate createdAt images')
      .sort({ deletionScheduledAt: 1 });

    const GRACE_PERIOD_DAYS = parseInt(process.env.GRACE_PERIOD_DAYS || '7', 10);

    const report = scheduledItems.map(item => {
      const scheduledDate = new Date(item.deletionScheduledAt);
      const deletionDate = new Date(scheduledDate);
      deletionDate.setDate(deletionDate.getDate() + GRACE_PERIOD_DAYS);

      const daysUntilDeletion = Math.ceil((deletionDate - new Date()) / (1000 * 60 * 60 * 24));

      return {
        itemId: item._id,
        title: item.title,
        description: item.description,
        status: item.status,
        location: item.location,
        category: item.category?.name,
        subCategory: item.subCategory?.name,
        postedBy: item.postedBy ? {
          id: item.postedBy._id,
          name: item.postedBy.name,
          email: item.postedBy.email
        } : null,
        images: item.images?.length || 0,
        lastActivityDate: item.lastActivityDate,
        scheduledDate: scheduledDate,
        estimatedDeletionDate: deletionDate,
        daysUntilDeletion,
        warningEmailSent: item.deletionWarningEmailSent,
        createdAt: item.createdAt
      };
    });

    res.status(200).json({
      success: true,
      message: 'Scheduled items report fetched successfully',
      count: report.length,
      gracePeriodDays: GRACE_PERIOD_DAYS,
      items: report
    });
  } catch (error) {
    console.error('Error fetching scheduled items report:', error);
    res.status(500).json({
      message: 'Failed to fetch scheduled items report',
      code: 'SERVER_ERROR',
      error: error.message
    });
  }
};

// Get report of users scheduled for deletion
exports.getScheduledUsersReport = async (req, res, next) => {
  try {
    const scheduledUsers = await User.find({
      scheduledForDeletion: true,
      deletionScheduledAt: { $exists: true },
      role: { $ne: 'admin' } // Exclude admins from deletion reports
    })
      .select('name email role isActive lastLoginDate deactivatedAt deletionScheduledAt deletionWarningEmailSent createdAt')
      .sort({ deletionScheduledAt: 1 });

    const GRACE_PERIOD_DAYS = parseInt(process.env.GRACE_PERIOD_DAYS || '7', 10);
    const USER_DELETION_STRATEGY = process.env.USER_DELETION_STRATEGY || 'deactivation';

    const report = await Promise.all(scheduledUsers.map(async (user) => {
      const scheduledDate = new Date(user.deletionScheduledAt);
      const deletionDate = new Date(scheduledDate);
      deletionDate.setDate(deletionDate.getDate() + GRACE_PERIOD_DAYS);

      const daysUntilDeletion = Math.ceil((deletionDate - new Date()) / (1000 * 60 * 60 * 24));

      // Count user's items
      const itemCount = await Item.countDocuments({ postedBy: user._id });

      return {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        strategy: USER_DELETION_STRATEGY,
        lastLoginDate: user.lastLoginDate,
        deactivatedAt: user.deactivatedAt,
        scheduledDate: scheduledDate,
        estimatedDeletionDate: deletionDate,
        daysUntilDeletion,
        warningEmailSent: user.deletionWarningEmailSent,
        itemsCount: itemCount,
        createdAt: user.createdAt
      };
    }));

    res.status(200).json({
      success: true,
      message: 'Scheduled users report fetched successfully',
      count: report.length,
      gracePeriodDays: GRACE_PERIOD_DAYS,
      deletionStrategy: USER_DELETION_STRATEGY,
      users: report
    });
  } catch (error) {
    console.error('Error fetching scheduled users report:', error);
    res.status(500).json({
      message: 'Failed to fetch scheduled users report',
      code: 'SERVER_ERROR',
      error: error.message
    });
  }
};

// Get report of successfully deleted data (from logs/tracking)
exports.getDeletionSuccessReport = async (req, res, next) => {
  try {
    const { days = 30, type = 'all' } = req.query; // type: 'all', 'items', 'users'

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days, 10));

    // Since we don't have a deletion log table, we'll track items and users that no longer exist
    // For a production system, you'd want to create a DeletionLog model

    // Count recently deleted items (items marked for deletion but no longer exist)
    const totalItems = await Item.countDocuments({ isActive: false });

    // Count inactive users (users who were deactivated/deleted)
    const totalUsers = await User.countDocuments({
      isActive: false,
      role: { $ne: 'admin' }
    });

    // Get some statistics
    const itemStats = await Item.aggregate([
      {
        $match: {
          isActive: false,
          updatedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const userStats = await User.aggregate([
      {
        $match: {
          isActive: false,
          role: { $ne: 'admin' },
          updatedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // For real deletion tracking, we'd need to implement a DeletionLog model
    // This is a simplified version showing deactivated/soft-deleted items
    const report = {
      period: {
        days: parseInt(days, 10),
        startDate,
        endDate: new Date()
      },
      summary: {
        totalInactiveItems: totalItems,
        totalInactiveUsers: totalUsers,
      },
      itemStats: itemStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      userStats: userStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      note: 'This report shows deactivated/soft-deleted records. For detailed deletion logs, implement a DeletionLog model.'
    };

    res.status(200).json({
      success: true,
      message: 'Deletion success report fetched successfully',
      report
    });
  } catch (error) {
    console.error('Error fetching deletion success report:', error);
    res.status(500).json({
      message: 'Failed to fetch deletion success report',
      code: 'SERVER_ERROR',
      error: error.message
    });
  }
};
