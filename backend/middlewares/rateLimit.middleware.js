const rateLimit = require('express-rate-limit');

// Middleware to limit API requests
exports.rateLimiter = rateLimit({
  keyGenerator: (req) => req.user?.id || req.ip,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.',
});