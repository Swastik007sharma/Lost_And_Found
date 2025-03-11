const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Utility function to extract token from headers
const extractToken = (req) => {
  const authHeader = req.header('Authorization');
  
  if (!authHeader) {
    console.log('No Authorization header provided');
    return null;
  }

  // Clean the header: remove quotes and trim
  const cleanedHeader = authHeader.replace(/"/g, '').trim();

  // Check for "Bearer " prefix (case-insensitive)
  if (!cleanedHeader.toLowerCase().startsWith('bearer ')) {
    console.log('No valid Bearer prefix found');
    return null;
  }

  // Extract token after "Bearer "
  const token = cleanedHeader.split(/\s+/)[1]; // Use regex to handle multiple spaces

  if (!token || token.trim() === '' || token.split('.').length !== 3) {
    console.log(`Invalid token format: "${token}"`);
    return null;
  }

  return token;
};

// Middleware to authenticate users
exports.authenticate = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No valid token provided.', code: 'NO_TOKEN' });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded.id, isActive: true });
    if (!user) {
      return res.status(401).json({ message: 'User not found or inactive', code: 'INVALID_USER' });
    }

    req.user = { id: user._id.toString(), role: user.role };
    next();
  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired.', code: 'TOKEN_EXPIRED' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ message: 'Invalid or malformed token.', code: 'INVALID_TOKEN' });
    }
    res.status(500).json({ message: 'Authentication failed.', code: 'SERVER_ERROR' });
  }
};

// Middleware to restrict access by role
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Access denied. Requires one of: ${roles.join(', ')}`, code: 'FORBIDDEN' });
    }
    next();
  };
};

// Middleware to check if the user is an admin
exports.isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin role required.', code: 'FORBIDDEN' });
  }
  next();
};