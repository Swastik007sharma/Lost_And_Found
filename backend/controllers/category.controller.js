const Category = require('../models/category.model');
const { categorySchema } = require('../schema/category.schema'); // Assuming this exists or will be created

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const categories = await Category.find({ isActive: true }) // Assuming isActive is added
      .sort({ name: 1 }) // Alphabetical order
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Category.countDocuments({ isActive: true });
    res.status(200).json({ categories, total, page, limit });
  } catch (error) {
    console.error('Error fetching categories:', { message: error.message, stack: error.stack });
    res.status(500).json({ message: 'Failed to fetch categories', code: 'FETCH_ERROR' });
  }
};

// Add a new category
exports.addCategory = async (req, res) => {
  try {
    // Check if user is authorized (e.g., admin or keeper)
    if (!['admin', 'keeper'].includes(req.user?.role)) {
      return res.status(403).json({ message: 'Unauthorized to add category', code: 'FORBIDDEN' });
    }

    // Validate request body using Zod schema
    const { name, description } = categorySchema.parse(req.body);

    const existingCategory = await Category.findOne({ name: name.toLowerCase() });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category already exists', code: 'CATEGORY_EXISTS' });
    }

    const category = new Category({ 
      name, 
      description, 
      isPredefined: false // Explicitly user-added
    });
    await category.save();

    res.status(201).json({ message: 'Category added successfully', category });
  } catch (error) {
    console.error('Error adding category:', { message: error.message, stack: error.stack });
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Validation failed', code: 'VALIDATION_ERROR', details: error.errors });
    }
    res.status(500).json({ message: 'Failed to add category', code: 'SERVER_ERROR' });
  }
};

module.exports = exports;