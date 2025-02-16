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
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.status(201).json({
      message: 'User registered successfully',
      user: { name, email },
    });
  } catch (error) {
    console.error('Registration Error:', error.message);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to register user' });
  }
};

// Authenticate a user
exports.login = async (req, res) => {
  try {
    // Validate request body using Zod schema
    const { email, password } = loginSchema.parse(req.body);

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

    res.status(200).json({
      token,
      user: { name: user.name, email: user.email },
    });
  } catch (error) {
    console.error('Login Error:', error.message);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to login' });
  }
};