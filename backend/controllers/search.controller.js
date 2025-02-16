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
    const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc', search = '' } = req.query;

    // Build query for filtering items
    const query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    // Fetch paginated and sorted items
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      populate: ['postedBy', 'category'], // Populate postedBy and category references
      sort: { [sortBy]: order === 'asc' ? 1 : -1 }, // Sort by field and order
    };

    const results = await Item.paginate(query, options); // Use mongoose-paginate-v2

    res.status(200).json({
      message: 'Items fetched successfully',
      items: results.docs,
      pagination: {
        currentPage: results.page,
        totalPages: results.totalPages,
        totalResults: results.totalDocs,
      },
    });
  } catch (error) {
    console.error('Error searching items:', error.message);
    res.status(500).json({ error: 'Failed to search items' });
  }
};