const Item = require('../models/item.model');
const { idSchema } = require('../schema/common.schema'); // Import common validation schema

// Middleware to check if the user owns the item
exports.checkOwnership = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate the ID parameter
    idSchema.parse(id);

    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    if (item.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You are not authorized to perform this action' });
    }

    next();
  } catch (error) {
    console.error('Ownership Check Error:', error.message);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to check ownership' });
  }
};