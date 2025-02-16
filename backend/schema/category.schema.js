const { z } = require('zod');

// Schema for adding a new category
const addCategorySchema = z.object({
  name: z.string().min(3, 'Category name must be at least 3 characters'),
  description: z.string().optional(),
});

module.exports = { addCategorySchema };