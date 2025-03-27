const { z } = require('zod');
const { isValidObjectId } = require('mongoose');

const createConversationSchema = z.object({
  item: z.string().refine(val => isValidObjectId(val), { message: 'Invalid item ID' }),
  participants: z.array(z.string().refine(val => isValidObjectId(val), { message: 'Invalid participant ID' })).min(2, 'A conversation must have at least two participants'),
});

module.exports = { createConversationSchema };