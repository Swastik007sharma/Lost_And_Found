const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const adminController = require('../controllers/admin.controller');
const { validate } = require('../middlewares/validate.middleware');
const { idSchema } = require('../schema/common.schema.js'); // Import common validation schema

// Get a list of all users (admin-only)
router.get('/users', authMiddleware.authenticate, authMiddleware.isAdmin, adminController.getAllUsers);

// Get a single user by ID (admin-only)
router.get('/users/:id', authMiddleware.authenticate, authMiddleware.isAdmin, validate(idSchema, 'params'), adminController.getUserById);

// Get all items posted or claimed by a user (admin-only)
router.get('/users/:id/items', authMiddleware.authenticate, authMiddleware.isAdmin, validate(idSchema, 'params'), adminController.getUserItems);

// Delete a user (admin-only)
router.delete('/users/:id', authMiddleware.authenticate, authMiddleware.isAdmin, validate(idSchema, 'params'), adminController.deleteUser);

// Get a list of all items (admin-only)
router.get('/items', authMiddleware.authenticate, authMiddleware.isAdmin, adminController.getAllItems);

// Get a single item by ID (admin-only)
router.get('/items/:id', authMiddleware.authenticate, authMiddleware.isAdmin, validate(idSchema, 'params'), adminController.getItemById);

// Delete an item (admin-only)
router.delete('/items/:id', authMiddleware.authenticate, authMiddleware.isAdmin, validate(idSchema, 'params'), adminController.deleteItem);

// Get admin dashboard statistics (admin-only)
router.get('/dashboard-stats', authMiddleware.authenticate, authMiddleware.isAdmin, adminController.getAdminDashboardStats);

// Get conversations and messages (admin-only)
router.get('/conversations', authMiddleware.authenticate, authMiddleware.isAdmin, adminController.getConversationsAndMessages);

module.exports = router;