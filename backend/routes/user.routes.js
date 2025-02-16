const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const userController = require('../controllers/user.controller');
const { validate } = require('../middlewares/validate.middleware');
const { updateUserSchema } = require('../schema/user.schema');

// Get current user's profile
router.get(
  '/me',
  authMiddleware.authenticate,
  userController.getProfile
);

// Update current user's profile
router.put(
  '/me',
  authMiddleware.authenticate,
  validate(updateUserSchema), // Validate request body
  userController.updateProfile
);

// Delete current user's account
router.delete(
  '/me',
  authMiddleware.authenticate,
  userController.deleteAccount
);

module.exports = router;