const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const updateUserSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long').optional(),
  email: z.string().email('Invalid email format').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters long').optional(),
  // Keeper-specific fields (only allowed if role is keeper)
  location: z.string().min(2, 'Location must be at least 2 characters').optional(),
  department: z.string().min(2, 'Department must be at least 2 characters').optional(),
  description: z.string().max(500, 'Description too long').optional(),
});

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(6, 'Current password must be at least 6 characters'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

module.exports = { registerSchema, loginSchema, updateUserSchema, updatePasswordSchema };