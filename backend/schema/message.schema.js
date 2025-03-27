const { z } = require('zod');
const { isValidObjectId } = require('mongoose');

const sendMessageSchema = z.object({
  conversation: z.string().refine(val => isValidObjectId(val), { message: 'Invalid conversation ID' }),
  sender: z.string().refine(val => isValidObjectId(val), { message: 'Invalid sender ID' }),
  content: z.string().min(1, 'Message content cannot be empty'),
});

module.exports = { sendMessageSchema };