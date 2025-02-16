const User = require('../models/user.model');
const Item = require('../models/item.model');
const Category = require('../models/category.model');

// Get a list of all users (admin-only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, 'name email role createdAt'); // Select only necessary fields
    res.status(200).json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Delete a user (admin-only)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    // Find and delete the user
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

// Get a list of all items (admin-only)
exports.getAllItems = async (req, res) => {
  try {
    const items = await Item.find()
      .populate('postedBy', 'name email') // Populate user details
      .populate('category', 'name'); // Populate category details
    res.status(200).json({ items });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
};

// Delete an item (admin-only)
exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    // Find and delete the item
    const item = await Item.findByIdAndDelete(id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
};

// Get admin dashboard statistics
exports.getAdminDashboardStats = async (req, res) => {
  try {
    // Total number of items posted
    const totalItems = await Item.countDocuments();

    // Number of claimed vs. unclaimed items
    const claimedItems = await Item.countDocuments({ status: 'Claimed' });
    const unclaimedItems = await Item.countDocuments({ status: 'Unclaimed' });

    // Total number of users
    const totalUsers = await User.countDocuments();

    // Total number of categories
    const totalCategories = await Category.countDocuments();

    // Most active users (top 5 users who have posted the most items)
    const mostActiveUsers = await Item.aggregate([
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
    res.status(500).json({ error: 'Failed to fetch admin dashboard stats' });
  }
};