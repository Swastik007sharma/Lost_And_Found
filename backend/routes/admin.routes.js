const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const adminController = require('../controllers/admin.controller');
const { validate } = require('../middlewares/validate.middleware');
const { idSchema } = require('../schema/common.schema.js'); // Import common validation schema

// Get a list of all users (admin-only)
router.get('/users', authMiddleware.authenticate, authMiddleware.isAdmin, adminController.getAllUsers);

// Delete a user (admin-only)
router.delete('/users/:id', authMiddleware.authenticate, authMiddleware.isAdmin, validate(idSchema), adminController.deleteUser);

// Get a list of all items (admin-only)
router.get('/items', authMiddleware.authenticate, authMiddleware.isAdmin, adminController.getAllItems);

// Delete an item (admin-only)
router.delete('/items/:id', authMiddleware.authenticate, authMiddleware.isAdmin, validate(idSchema), adminController.deleteItem);

// Get admin dashboard statistics (admin-only)
router.get('/dashboard-stats', authMiddleware.authenticate, authMiddleware.isAdmin, adminController.getAdminDashboardStats);

module.exports = router;