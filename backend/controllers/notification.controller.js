const Notification = require('../models/notification.model');

// Get all notifications for the current user with pagination
exports.getNotifications = async (req, res) => {
  try {
    const { _id: userId } = req.user;
    const { page = 1, limit = 10 } = req.query; // Default to page 1 and limit 10

    // Validate page and limit
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    if (isNaN(pageNumber) || isNaN(limitNumber) || pageNumber < 1 || limitNumber < 1) {
      return res.status(400).json({ error: 'Invalid page or limit value' });
    }

    // Fetch notifications with pagination
    const options = {
      page: pageNumber,
      limit: limitNumber,
      populate: 'itemId', // Populate item details
      sort: { createdAt: -1 }, // Sort by most recent
    };

    const notifications = await Notification.paginate({ userId }, options);

    res.status(200).json({
      message: 'Notifications fetched successfully',
      notifications: notifications.docs,
      totalPages: notifications.totalPages,
      currentPage: notifications.page,
      totalResults: notifications.totalDocs,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error.message);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

// Mark a notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params; // Notification ID
    const { _id: userId } = req.user;

    // Find the notification
    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    // Ensure the notification belongs to the current user
    if (notification.userId.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'You are not authorized to perform this action' });
    }

    // Mark the notification as read
    notification.isRead = true;
    await notification.save();

    res.status(200).json({ message: 'Notification marked as read', notification });
  } catch (error) {
    console.error('Error marking notification as read:', error.message);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};