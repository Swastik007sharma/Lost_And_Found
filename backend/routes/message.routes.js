const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const messageController = require('../controllers/message.controller');
const { validate } = require('../middlewares/validate.middleware');
const { sendMessageSchema, getMessagesSchema } = require('../schema/message.schema');

// Get all messages in a specific conversation
router.get(
  '/:id/messages',
  authMiddleware.authenticate,
  validate(getMessagesSchema, 'query'), // Validate query parameters
  messageController.getMessages
);

// Send a new message in a specific conversation
router.post(
  '/:id/messages',
  authMiddleware.authenticate,
  validate(sendMessageSchema, 'body'), // Validate request body
  messageController.sendMessage
);

module.exports = router;