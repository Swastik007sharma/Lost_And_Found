const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { registerSchema, loginSchema } = require('../schema/auth.schema'); // Import Zod schemas

// Register a new user
exports.register = async (req, res) => {
  try {
    // Validate request body using Zod schema
    const { name, email, password } = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists', code: 'USER_EXISTS' });
    }

    // Create the user (password hashing handled by pre-save hook in user.model.js)
    const user = new User({ name, email, password });
    await user.save();

    // Generate JWT token immediately upon registration
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: user._id, name, email, role: user.role },
      authorization: `Bearer ${token}`, // Updated to include "Bearer "
    });
  } catch (error) {
    console.error('Registration Error:', error.message);
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Validation failed', code: 'VALIDATION_ERROR', details: error.errors });
    }
    res.status(500).json({ message: 'Failed to register user', code: 'SERVER_ERROR' });
  }
};

// Authenticate a user
exports.login = async (req, res) => {
  try {
    // Validate request body using Zod schema
    const { email, password } = loginSchema.parse(req.body);

    // Find the user by email
    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials or user inactive', code: 'INVALID_CREDENTIALS' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

    res.status(200).json({
      message: 'Login successful',
      authorization: `Bearer ${token}`, // Updated to include "Bearer "
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error('Login Error:', error.message);
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Validation failed', code: 'VALIDATION_ERROR', details: error.errors });
    }
    res.status(500).json({ message: 'Failed to login', code: 'SERVER_ERROR' });
  }
};