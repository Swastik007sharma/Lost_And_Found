const { z } = require('zod');

const createItemSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters'),
  description: z.string().trim().min(10, 'Description must be at least 10 characters'),
  category: z.string().trim().min(1, 'Category name is required'),
  subCategory: z.string().trim().min(1, 'Sub Category name is required'),
  tags: z.array(z.string()).optional(),
  status: z.enum(['Lost', 'Found', 'Claimed', 'Returned'], 'Status must be "Lost", "Found", "Claimed", or "Returned"'),
  location: z.string().trim().min(3, 'Location must be at least 3 characters'),
  image: z.url('Image must be a valid URL').optional(),
});

const updateItemSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').optional(),
  description: z.string().trim().min(10, 'Description must be at least 10 characters').optional(),
  category: z.string().trim().min(1, 'Category name is required').optional(),
  subCategory: z.string().trim().min(1, 'Sub Category name is required').optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['Lost', 'Found', 'Claimed', 'Returned']).optional(),
  location: z.string().trim().min(3, 'Location must be at least 3 characters').optional(),
  image: z.url('Image must be a valid URL').optional(),
});

module.exports = { createItemSchema, updateItemSchema };