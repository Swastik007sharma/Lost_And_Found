const User = require('../models/user.model');
const Item = require('../models/item.model');

// Get a list of available keepers
exports.getKeepers = async (req, res) => {
  try {
    const keepers = await User.find({ role: 'keeper' }, 'name email createdAt'); // Select only necessary fields
    res.status(200).json({ keepers });
  } catch (error) {
    console.error('Error fetching keepers:', error);
    res.status(500).json({ error: 'Failed to fetch keepers' });
  }
};

// Assign a found item to a keeper
exports.assignKeeper = async (req, res) => {
  try {
    const { id } = req.params; // Item ID
    const { keeperId } = req.body; // Keeper's user ID

    // Find the item
    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Find the keeper
    const keeper = await User.findById(keeperId);
    if (!keeper || keeper.role !== 'keeper') {
      return res.status(400).json({ error: 'Invalid or unauthorized keeper' });
    }

    // Assign the keeper to the item
    item.keeper = keeperId;
    await item.save();

    res.status(200).json({ message: 'Item assigned to keeper successfully', item });
  } catch (error) {
    console.error('Error assigning keeper:', error);
    res.status(500).json({ error: 'Failed to assign keeper' });
  }
};

// Search for items with optional filters
exports.searchItems = async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc', search = '', status } = req.query;
    const skip = (page - 1) * limit;

    // Build the aggregation pipeline
    const pipeline = [];

    // Lookup to join with Category collection
    pipeline.push({
      $lookup: {
        from: 'categories', // Must match the collection name in MongoDB
        localField: 'category',
        foreignField: '_id',
        as: 'categoryData',
      },
    });

    // Unwind the categoryData array (since it’s a single reference)
    pipeline.push({
      $unwind: '$categoryData',
    });

    // Lookup to join with User collection for postedBy
    pipeline.push({
      $lookup: {
        from: 'users',
        localField: 'postedBy',
        foreignField: '_id',
        as: 'postedByData',
      },
    });

    // Unwind postedByData
    pipeline.push({
      $unwind: '$postedByData',
    });

    // Match stage for all conditions, including isActive: true and status
    const matchConditions = { isActive: true };
    if (status && status !== 'All' && ['Lost', 'Found', 'Claimed', 'Returned'].includes(status)) {
      matchConditions.status = status;
    }
    if (search) {
      matchConditions.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { 'categoryData.name': { $regex: search, $options: 'i' } },
      ];
    }
    pipeline.push({
      $match: matchConditions,
    });

    // Project to shape the output
    pipeline.push({
      $project: {
        id: '$_id',
        title: 1,
        description: 1,
        category: { id: '$categoryData._id', name: '$categoryData.name' },
        tags: 1,
        status: 1,
        location: 1,
        image: 1,
        postedBy: { id: '$postedByData._id', name: '$postedByData.name', email: '$postedByData.email' },
        isActive: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    });

    // Sort stage
    pipeline.push({
      $sort: { [sortBy]: order === 'asc' ? 1 : -1 },
    });

    // Pagination stages
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: parseInt(limit, 10) });

    // Execute the aggregation
    const items = await Item.aggregate(pipeline);

    // Get total count for pagination
    const totalResultsPipeline = pipeline.slice(0, pipeline.length - 2); // Remove skip and limit
    const totalResultsAgg = await Item.aggregate([...totalResultsPipeline, { $count: 'total' }]);
    const totalResults = totalResultsAgg.length > 0 ? totalResultsAgg[0].total : 0;
    const totalPages = Math.ceil(totalResults / limit);

    res.status(200).json({
      message: 'Items fetched successfully',
      items,
      pagination: {
        currentPage: parseInt(page, 10),
        totalPages,
        totalResults,
      },
    });
  } catch (error) {
    console.error('Error searching items:', error.message);
    res.status(500).json({ error: 'Failed to search items' });
  }
};