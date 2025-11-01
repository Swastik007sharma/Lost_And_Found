const User = require('../models/user.model');
const Item = require('../models/item.model');
const Conversation = require('../models/conversation.model');
const Category = require('../models/category.model');

// Helper function to get date range based on report type
const getDateRange = (reportType, customStartDate, customEndDate) => {
  const now = new Date();
  let startDate, endDate;

  switch (reportType) {
    case 'daily':
      startDate = new Date(now.setHours(0, 0, 0, 0));
      endDate = new Date(now.setHours(23, 59, 59, 999));
      break;
    case 'weekly':
      const dayOfWeek = now.getDay();
      startDate = new Date(now.setDate(now.getDate() - dayOfWeek));
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now.setDate(now.getDate() + (6 - dayOfWeek)));
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'monthly':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      break;
    case 'yearly':
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      break;
    case 'custom':
      if (!customStartDate || !customEndDate) {
        throw new Error('Custom date range requires both start and end dates');
      }
      startDate = new Date(customStartDate);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(customEndDate);
      endDate.setHours(23, 59, 59, 999);
      break;
    default:
      throw new Error('Invalid report type');
  }

  return { startDate, endDate };
};

// Generate comprehensive report
exports.generateReport = async (req, res) => {
  try {
    const { reportType, startDate: customStartDate, endDate: customEndDate } = req.query;

    if (!reportType) {
      return res.status(400).json({ message: 'Report type is required', code: 'MISSING_REPORT_TYPE' });
    }

    const { startDate, endDate } = getDateRange(reportType, customStartDate, customEndDate);

    // Fetch data within date range
    const [
      totalUsers,
      newUsers,
      totalItems,
      newItems,
      claimedItems,
      foundItems,
      lostItems,
      totalConversations,
      newConversations,
      activeKeepers,
      totalKeepers,
      itemsByCategory,
      itemsByStatus,
      usersByRole,
      dailyItemStats
    ] = await Promise.all([
      // Total users
      User.countDocuments(),

      // New users in date range
      User.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate }
      }),

      // Total items
      Item.countDocuments(),

      // New items in date range
      Item.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate }
      }),

      // Claimed items in date range
      Item.countDocuments({
        status: 'claimed',
        updatedAt: { $gte: startDate, $lte: endDate }
      }),

      // Found items
      Item.countDocuments({
        itemType: 'found',
        createdAt: { $gte: startDate, $lte: endDate }
      }),

      // Lost items
      Item.countDocuments({
        itemType: 'lost',
        createdAt: { $gte: startDate, $lte: endDate }
      }),

      // Total conversations
      Conversation.countDocuments(),

      // New conversations in date range
      Conversation.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate }
      }),

      // Active keepers
      User.countDocuments({ role: 'keeper', isActive: true }),

      // Total keepers
      User.countDocuments({ role: 'keeper' }),

      // Items by category
      Item.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'categoryInfo'
          }
        },
        {
          $unwind: '$categoryInfo'
        },
        {
          $group: {
            _id: '$categoryInfo.name',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]),

      // Items by status
      Item.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),

      // Users by role
      User.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 }
          }
        }
      ]),

      // Daily item statistics (for charts)
      Item.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              itemType: '$itemType'
            },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { '_id.date': 1 }
        }
      ])
    ]);

    const report = {
      reportType,
      dateRange: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      },
      summary: {
        totalUsers,
        newUsers,
        totalItems,
        newItems,
        claimedItems,
        foundItems,
        lostItems,
        totalConversations,
        newConversations,
        activeKeepers,
        totalKeepers
      },
      breakdown: {
        itemsByCategory,
        itemsByStatus,
        usersByRole
      },
      trends: {
        dailyItemStats
      },
      generatedAt: new Date().toISOString()
    };

    res.status(200).json({ report });
  } catch (error) {
    console.error('Error generating report:', { message: error.message, stack: error.stack });
    res.status(500).json({ message: 'Failed to generate report', code: 'SERVER_ERROR', error: error.message });
  }
};

// Get summary statistics for dashboard
exports.getReportSummary = async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [daily, weekly, monthly, yearly] = await Promise.all([
      Item.countDocuments({ createdAt: { $gte: startOfToday } }),
      Item.countDocuments({ createdAt: { $gte: startOfWeek } }),
      Item.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Item.countDocuments({ createdAt: { $gte: startOfYear } })
    ]);

    res.status(200).json({
      summary: {
        daily,
        weekly,
        monthly,
        yearly
      }
    });
  } catch (error) {
    console.error('Error fetching report summary:', error);
    res.status(500).json({ message: 'Failed to fetch report summary', code: 'SERVER_ERROR' });
  }
};

module.exports = exports;
