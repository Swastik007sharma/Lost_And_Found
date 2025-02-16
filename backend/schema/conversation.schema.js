const { z } = require('zod');

// Schema for creating a conversation
const createConversationSchema = z.object({
  item: z.string().uuid('Invalid item ID'), // Reference to the Item model
  participants: z.array(z.string().uuid('Invalid participant ID')).min(2, 'A conversation must have at least two participants'),
});

module.exports = {
  createConversationSchema,
};