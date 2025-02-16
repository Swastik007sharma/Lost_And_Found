const Category = require('../models/category.model');

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json({ categories });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

// Add a new category
exports.addCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ error: 'Category already exists' });
    }

    const category = new Category({ name, description });
    await category.save();

    res.status(201).json({ message: 'Category added successfully', category });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add category' });
  }
};