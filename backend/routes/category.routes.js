const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const categoryController = require('../controllers/category.controller');
const { validate } = require('../middlewares/validate.middleware');
const { addCategorySchema, updateCategorySchema } = require('../schema/category.schema');
const { idSchema } = require('../schema/common.schema.js');

// Add a new category (admin-only)
router.post('/', authMiddleware.authenticate, authMiddleware.isAdmin, validate(addCategorySchema), categoryController.addCategory);

// Get all categories (public, only active categories)
router.get('/', categoryController.getCategories);

// Get all categories for admin (both active and inactive, admin-only)
router.get('/admin', authMiddleware.authenticate, authMiddleware.isAdmin, categoryController.getAllCategoriesForAdmin);

// Update a category (admin-only)
router.put('/:id', authMiddleware.authenticate, authMiddleware.isAdmin, validate(idSchema, 'params'), validate(updateCategorySchema), categoryController.updateCategory);

// Delete a category (admin-only, soft delete)
router.delete('/:id', authMiddleware.authenticate, authMiddleware.isAdmin, validate(idSchema, 'params'), categoryController.deleteCategory);

module.exports = router;