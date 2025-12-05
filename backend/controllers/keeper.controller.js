const User = require('../models/user.model');
const Item = require('../models/item.model');
const mongoose = require('mongoose');

// Get a list of available keepers
exports.getKeepers = async (req, res, next) => {
  try {
    const keepers = await User.find(
      { role: 'keeper', isActive: true },
      'name email createdAt location department description'
    ); // Select all relevant keeper fields
    res.status(200).json({ keepers });
  } catch (error) {
    console.error('Error fetching keepers:', error);
    res.status(500).json({ error: 'Failed to fetch keepers' });
  }
};

// Assign a found item to a keeper
exports.assignKeeper = async (req, res, next) => {
  try {
    const { id } = req.params; // Item ID
    const { keeperId } = req.body; // Keeper's user ID

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid item ID' });
    }
    if (!mongoose.Types.ObjectId.isValid(keeperId)) {
      return res.status(400).json({ error: 'Invalid keeper ID' });
    }

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
