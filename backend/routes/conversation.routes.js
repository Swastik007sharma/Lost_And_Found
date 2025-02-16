const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const conversationController = require('../controllers/conversation.controller');
const { validate } = require('../middlewares/validate.middleware');
const { createConversationSchema } = require('../schema/conversation.schema');

// Create a new conversation about an item
router.post(
  '/',
  authMiddleware.authenticate,
  validate(createConversationSchema), // Validate request body
  conversationController.createConversation
);

// Get all conversations for a specific user
router.get(
  '/:userId',
  authMiddleware.authenticate,
  conversationController.getConversations
);

module.exports = router;