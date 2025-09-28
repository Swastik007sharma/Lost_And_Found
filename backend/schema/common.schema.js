const { z } = require('zod');
const { isValidObjectId } = require('mongoose');

// Schema for validating MongoDB ObjectIds in params (e.g., req.params.id)
const idSchema = z.object({
  id: z.string().refine(val => isValidObjectId(val), { message: 'Invalid ObjectId' }),
});

// Schema for validating categoryId in params (e.g., req.params.categoryId)
const categoryIdSchema = z.object({
  categoryId: z.string().refine(val => isValidObjectId(val), { message: 'Invalid category ID' }),
});

module.exports = { idSchema, categoryIdSchema };