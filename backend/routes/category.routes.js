const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const categoryController = require('../controllers/category.controller');
const { validate } = require('../middlewares/validate.middleware');
const { addCategorySchema } = require('../schema/category.schema');

// Middleware to check admin role
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }
  next();
};

// Add a new category (admin-only)
router.post('/', authMiddleware.authenticate, isAdmin, validate(addCategorySchema), categoryController.addCategory);

// Get all categories
router.get('/', categoryController.getCategories);

module.exports = router;