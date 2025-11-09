const Item = require('../models/item.model');
const User = require('../models/user.model');
const Conversation = require('../models/conversation.model');
const Message = require('../models/message.model');
const Notification = require('../models/notification.model');
const {
  extractPublicId,
  deleteCloudinaryImages,
} = require('../utils/cloudinaryCleanup');
const { sendEmail } = require('../utils/sendEmail');
const {
  accountDeletionWarningTemplate,
  itemDeletionWarningTemplate
} = require('../utils/emailTemplates');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Configuration for user deletion strategy
// 'inactivity' - Delete based on last login date (default)
// 'deactivation' - Delete based on when account was deactivated
const USER_DELETION_STRATEGY = process.env.USER_DELETION_STRATEGY || 'deactivation';
const INACTIVITY_DAYS = parseInt(process.env.INACTIVITY_DAYS || '60', 10);
const GRACE_PERIOD_DAYS = parseInt(process.env.GRACE_PERIOD_DAYS || '7', 10);

/**
 * Mark inactive items for deletion (soft mark)
 * Items inactive for 60 days are marked for deletion
 */
async function markInactiveItemsForDeletion() {
  try {
    const inactivityThreshold = new Date();
    inactivityThreshold.setDate(inactivityThreshold.getDate() - 60); // 60 days ago

    const inactiveItems = await Item.find({
      lastActivityDate: { $lt: inactivityThreshold },
      scheduledForDeletion: false,
      isActive: true,
    }).populate('postedBy', 'email name');

    const results = [];
    for (const item of inactiveItems) {
      item.scheduledForDeletion = true;
      item.deletionScheduledAt = new Date();
      item.deletionReason = 'inactivity';
      await item.save();

      results.push({
        itemId: item._id,
        title: item.title,
        owner: item.postedBy?.email || 'Unknown',
        lastActivityDate: item.lastActivityDate,
      });

      console.log(`✅ Marked for deletion: ${item._id} (${item.title})`);
    }

    return results;
  } catch (error) {
    console.error('Error marking items for deletion:', error);
    throw error;
  }
}

/**
 * Hard delete items after grace period (7 days)
 */
async function deleteScheduledItems() {
  try {
    const gracePeriod = new Date();
    gracePeriod.setDate(gracePeriod.getDate() - 7); // 7 days grace period

    const itemsToDelete = await Item.find({
      scheduledForDeletion: true,
      deletionScheduledAt: { $lt: gracePeriod },
    }).populate('postedBy', 'email name');

    const deletionResults = [];

    for (const item of itemsToDelete) {
      try {
        // Extract Cloudinary public ID from image URL
        const publicId = item.image ? extractPublicId(item.image) : null;

        // Delete from Cloudinary if image exists
        let cloudinaryDeleted = false;
        if (publicId) {
          const cloudinaryResults = await deleteCloudinaryImages([publicId]);
          cloudinaryDeleted = cloudinaryResults.some((r) => r.success);
          console.log(`🗑️  Cloudinary image deleted for item: ${item._id}`);
        }

        // Delete related conversations, messages, and notifications
        const relatedData = await deleteItemRelatedData(item._id);

        // Delete from database
        await Item.findByIdAndDelete(item._id);

        deletionResults.push({
          itemId: item._id,
          title: item.title,
          owner: item.postedBy?.email || 'Unknown',
          cloudinaryDeleted,
          ...relatedData,
          success: true,
        });

        console.log(`✅ Deleted item: ${item._id} (${item.title})`);
      } catch (error) {
        console.error(`❌ Failed to delete item: ${item._id}`, error);
        deletionResults.push({
          itemId: item._id,
          title: item.title,
          owner: item.postedBy?.email || 'Unknown',
          success: false,
          error: error.message,
        });
      }
    }

    return deletionResults;
  } catch (error) {
    console.error('Error deleting scheduled items:', error);
    throw error;
  }
}

/**
 * Get items scheduled for deletion (for admin dashboard)
 */
async function getScheduledDeletions() {
  try {
    return await Item.find({
      scheduledForDeletion: true,
    })
      .populate('postedBy', 'name email')
      .sort({ deletionScheduledAt: 1 });
  } catch (error) {
    console.error('Error fetching scheduled deletions:', error);
    throw error;
  }
}

/**
 * Cancel scheduled deletion (admin action)
 */
async function cancelScheduledDeletion(itemId) {
  try {
    const item = await Item.findById(itemId);
    if (!item) {
      throw new Error('Item not found');
    }

    item.scheduledForDeletion = false;
    item.deletionScheduledAt = null;
    item.deletionReason = null;
    item.lastActivityDate = new Date(); // Reset activity
    await item.save();

    console.log(`↩️  Cancelled deletion for item: ${itemId}`);
    return item;
  } catch (error) {
    console.error('Error cancelling scheduled deletion:', error);
    throw error;
  }
}

/**
 * Send warning emails for items scheduled for deletion (7 days before)
 */
async function sendItemDeletionWarnings() {
  try {
    const warningDate = new Date();
    warningDate.setDate(warningDate.getDate() - 6); // Items scheduled 6 days ago (1 day before deletion)

    const itemsNearDeletion = await Item.find({
      scheduledForDeletion: true,
      deletionScheduledAt: {
        $gte: new Date(warningDate.getTime() - 86400000), // 24 hours before
        $lte: warningDate,
      },
    }).populate('postedBy', 'name email');

    const results = [];
    for (const item of itemsNearDeletion) {
      try {
        if (item.postedBy && item.postedBy.email) {
          const daysRemaining = 7 - Math.floor(
            (new Date() - new Date(item.deletionScheduledAt)) / (1000 * 60 * 60 * 24)
          );

          const emailHtml = itemDeletionWarningTemplate(
            item.postedBy.name,
            item.title,
            Math.max(1, daysRemaining),
            FRONTEND_URL,
            item._id
          );

          await sendEmail(
            item.postedBy.email,
            '⚠️ Your Item Will Be Deleted Soon - Take Action Now',
            emailHtml
          );

          results.push({
            itemId: item._id,
            title: item.title,
            owner: item.postedBy.email,
            emailSent: true,
          });

          console.log(`📧 Deletion warning sent for item: ${item._id}`);
        }
      } catch (error) {
        console.error(`Failed to send warning for item ${item._id}:`, error);
        results.push({
          itemId: item._id,
          title: item.title,
          owner: item.postedBy?.email || 'Unknown',
          emailSent: false,
          error: error.message,
        });
      }
    }

    return results;
  } catch (error) {
    console.error('Error sending item deletion warnings:', error);
    throw error;
  }
}

/**
 * Mark inactive users for deletion based on configured strategy
 * Strategy 'inactivity': Based on last login date (60 days of no login)
 * Strategy 'deactivation': Based on when account was deactivated (60 days since deactivation)
 */
async function markInactiveUsersForDeletion() {
  try {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - INACTIVITY_DAYS);

    let query = {
      scheduledForDeletion: false,
      role: { $ne: 'admin' }, // Don't delete admin accounts
    };

    // Apply strategy-specific query conditions
    if (USER_DELETION_STRATEGY === 'deactivation') {
      // Strategy: Delete based on deactivation date
      query.isActive = false;
      query.deactivatedAt = { $lt: threshold, $ne: null };
      console.log(`🔧 [STRATEGY] Using deactivation-based deletion (${INACTIVITY_DAYS} days after deactivation)`);
    } else {
      // Strategy: Delete based on last login (default)
      query.isActive = true;
      query.lastLoginDate = { $lt: threshold };
      console.log(`🔧 [STRATEGY] Using inactivity-based deletion (${INACTIVITY_DAYS} days of no login)`);
    }

    const inactiveUsers = await User.find(query);

    const results = [];
    for (const user of inactiveUsers) {
      user.scheduledForDeletion = true;
      user.deletionScheduledAt = new Date();
      user.deletionWarningEmailSent = false;
      await user.save();

      results.push({
        userId: user._id,
        name: user.name,
        email: user.email,
        lastLoginDate: user.lastLoginDate,
        deactivatedAt: user.deactivatedAt,
        strategy: USER_DELETION_STRATEGY,
      });

      console.log(`✅ Marked user for deletion: ${user._id} (${user.email}) - Strategy: ${USER_DELETION_STRATEGY}`);
    }

    console.log(`📊 [SUMMARY] Marked ${results.length} users for deletion using ${USER_DELETION_STRATEGY} strategy`);
    return results;
  } catch (error) {
    console.error('Error marking users for deletion:', error);
    throw error;
  }
}

/**
 * Send warning emails to users scheduled for deletion
 */
async function sendUserDeletionWarnings() {
  try {
    const usersScheduled = await User.find({
      scheduledForDeletion: true,
      deletionWarningEmailSent: false,
    });

    const results = [];
    for (const user of usersScheduled) {
      try {
        const daysRemaining = 7 - Math.floor(
          (new Date() - new Date(user.deletionScheduledAt)) / (1000 * 60 * 60 * 24)
        );

        if (daysRemaining > 0 && daysRemaining <= 7) {
          const emailHtml = accountDeletionWarningTemplate(
            user.name,
            Math.max(1, daysRemaining),
            FRONTEND_URL
          );

          await sendEmail(
            user.email,
            '⚠️ Your Account Will Be Deleted Soon - Login to Prevent Deletion',
            emailHtml
          );

          user.deletionWarningEmailSent = true;
          await user.save();

          results.push({
            userId: user._id,
            email: user.email,
            daysRemaining,
            emailSent: true,
          });

          console.log(`📧 Deletion warning sent to user: ${user.email}`);
        }
      } catch (error) {
        console.error(`Failed to send warning to user ${user.email}:`, error);
        results.push({
          userId: user._id,
          email: user.email,
          emailSent: false,
          error: error.message,
        });
      }
    }

    return results;
  } catch (error) {
    console.error('Error sending user deletion warnings:', error);
    throw error;
  }
}

/**
 * Delete scheduled users and all their related data (cascading delete)
 */
async function deleteScheduledUsers() {
  try {
    const gracePeriod = new Date();
    gracePeriod.setDate(gracePeriod.getDate() - GRACE_PERIOD_DAYS);

    const usersToDelete = await User.find({
      scheduledForDeletion: true,
      deletionScheduledAt: { $lt: gracePeriod },
      role: { $ne: 'admin' }, // Extra safety: never delete admins
    });

    const deletionResults = [];

    for (const user of usersToDelete) {
      try {
        // Get all user's items for image cleanup
        const userItems = await Item.find({ postedBy: user._id });
        const imageUrls = userItems.map(item => item.image).filter(Boolean);
        const publicIds = imageUrls.map(url => extractPublicId(url)).filter(Boolean);

        // Delete Cloudinary images
        let cloudinaryDeleted = 0;
        if (publicIds.length > 0) {
          const cloudinaryResults = await deleteCloudinaryImages(publicIds);
          cloudinaryDeleted = cloudinaryResults.filter(r => r.success).length;
        }

        // Get conversation IDs before deletion
        const conversations = await Conversation.find({
          participants: user._id,
        });
        const conversationIds = conversations.map(c => c._id);

        // Delete messages in those conversations
        const messagesDeleted = await Message.deleteMany({
          conversation: { $in: conversationIds },
        });

        // Delete conversations
        const conversationsDeleted = await Conversation.deleteMany({
          participants: user._id,
        });

        // Delete notifications
        const notificationsDeleted = await Notification.deleteMany({
          $or: [{ userId: user._id }, { senderId: user._id }],
        });

        // Delete items
        const itemsDeleted = await Item.deleteMany({ postedBy: user._id });

        // Delete user
        await User.findByIdAndDelete(user._id);

        deletionResults.push({
          userId: user._id,
          email: user.email,
          name: user.name,
          itemsDeleted: itemsDeleted.deletedCount,
          conversationsDeleted: conversationsDeleted.deletedCount,
          messagesDeleted: messagesDeleted.deletedCount,
          notificationsDeleted: notificationsDeleted.deletedCount,
          cloudinaryImagesDeleted: cloudinaryDeleted,
          success: true,
        });

        console.log(`✅ Deleted user and all related data: ${user._id} (${user.email})`);
      } catch (error) {
        console.error(`❌ Failed to delete user: ${user._id}`, error);
        deletionResults.push({
          userId: user._id,
          email: user.email,
          name: user.name,
          success: false,
          error: error.message,
        });
      }
    }

    return deletionResults;
  } catch (error) {
    console.error('Error deleting scheduled users:', error);
    throw error;
  }
}

/**
 * Delete conversations and messages related to a deleted item
 */
async function deleteItemRelatedData(itemId) {
  try {
    // Find conversations about this item
    const conversations = await Conversation.find({ item: itemId });
    const conversationIds = conversations.map(c => c._id);

    // Delete messages
    const messagesDeleted = await Message.deleteMany({
      conversation: { $in: conversationIds },
    });

    // Delete conversations
    const conversationsDeleted = await Conversation.deleteMany({ item: itemId });

    // Delete notifications
    const notificationsDeleted = await Notification.deleteMany({ itemId: itemId });

    console.log(`🗑️  Deleted related data for item ${itemId}: ${conversationsDeleted.deletedCount} conversations, ${messagesDeleted.deletedCount} messages, ${notificationsDeleted.deletedCount} notifications`);

    return {
      conversationsDeleted: conversationsDeleted.deletedCount,
      messagesDeleted: messagesDeleted.deletedCount,
      notificationsDeleted: notificationsDeleted.deletedCount,
    };
  } catch (error) {
    console.error(`Error deleting related data for item ${itemId}:`, error);
    throw error;
  }
}

/**
 * Get users scheduled for deletion (for admin dashboard)
 */
async function getScheduledUserDeletions() {
  try {
    return await User.find({
      scheduledForDeletion: true,
    })
      .select('name email lastLoginDate deletionScheduledAt deletionWarningEmailSent')
      .sort({ deletionScheduledAt: 1 });
  } catch (error) {
    console.error('Error fetching scheduled user deletions:', error);
    throw error;
  }
}

/**
 * Cancel scheduled user deletion (admin or user login action)
 */
async function cancelScheduledUserDeletion(userId) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.scheduledForDeletion = false;
    user.deletionScheduledAt = null;
    user.deletionWarningEmailSent = false;
    user.lastLoginDate = new Date(); // Reset activity
    await user.save();

    console.log(`↩️  Cancelled deletion for user: ${userId} (${user.email})`);
    return user;
  } catch (error) {
    console.error('Error cancelling scheduled user deletion:', error);
    throw error;
  }
}

module.exports = {
  markInactiveItemsForDeletion,
  deleteScheduledItems,
  getScheduledDeletions,
  cancelScheduledDeletion,
  sendItemDeletionWarnings,
  markInactiveUsersForDeletion,
  sendUserDeletionWarnings,
  deleteScheduledUsers,
  deleteItemRelatedData,
  getScheduledUserDeletions,
  cancelScheduledUserDeletion,
};
