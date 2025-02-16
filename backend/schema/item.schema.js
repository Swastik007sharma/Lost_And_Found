const { z } = require('zod');

// Schema for creating an item
const createItemSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().uuid('Category ID must be a valid UUID'),
  tags: z.array(z.string()).optional(),
  status: z.enum(['Lost', 'Found'], 'Status must be either "Lost" or "Found"'),
  location: z.string().min(3, 'Location must be at least 3 characters'),
  image: z.string().url('Image must be a valid URL').optional(),
});

// Schema for updating an item
const updateItemSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').optional(),
  description: z.string().min(10, 'Description must be at least 10 characters').optional(),
  category: z.string().uuid('Category ID must be a valid UUID').optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['Lost', 'Found', 'Claimed', 'Returned']).optional(),
  location: z.string().min(3, 'Location must be at least 3 characters').optional(),
  image: z.string().url('Image must be a valid URL').optional(),
});

module.exports = { createItemSchema, updateItemSchema };

