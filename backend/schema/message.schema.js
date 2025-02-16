const { z } = require('zod');

// Schema for sending a message
const sendMessageSchema = z.object({
  conversation: z.string().uuid('Invalid conversation ID'), // Reference to the Conversation model
  sender: z.string().uuid('Invalid sender ID'), // Reference to the User model
  content: z.string().min(1, 'Message content cannot be empty'),
});

module.exports = {
  sendMessageSchema,
};