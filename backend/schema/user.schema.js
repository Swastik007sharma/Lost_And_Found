const { z } = require('zod');

// Schema for registering a new user
const registerUserSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

// Schema for updating a user's profile
const updateUserSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long').optional(),
  email: z.string().email('Invalid email format').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters long').optional(),
});

module.exports = {
  registerUserSchema,
  updateUserSchema,
};