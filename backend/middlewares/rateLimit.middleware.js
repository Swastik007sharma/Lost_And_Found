const rateLimit = require('express-rate-limit');

// General API rate limiter - applies to all routes
exports.generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10), // 100 requests per window
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers

  // Skip rate limiting for health check and static files
  skip: (req) => {
    return req.path === '/health' || req.path.startsWith('/uploads/');
  },

  // Custom handler with detailed response
  handler: (req, res) => {
    res.status(429).json({
      status: 'error',
      message: 'Too many requests from this IP, please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000), // seconds until reset
      limit: req.rateLimit.limit,
      current: req.rateLimit.current,
      remaining: 0
    });
  }
});

// Strict rate limiter for authentication endpoints (login, register, password reset)
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Only 5 attempts per window
  skipSuccessfulRequests: true, // Don't count successful requests
  message: {
    status: 'error',
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,

  handler: (req, res) => {
    res.status(429).json({
      status: 'error',
      message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000),
      limit: req.rateLimit.limit
    });
  }
});

// Stricter rate limiter for sensitive operations (OTP, claim, payment)
exports.strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Only 10 requests per window
  skipSuccessfulRequests: false,
  message: {
    status: 'error',
    message: 'Too many requests for this operation. Please try again later.',
    code: 'STRICT_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,

  handler: (req, res) => {
    res.status(429).json({
      status: 'error',
      message: 'Too many requests for this sensitive operation. Please try again later.',
      code: 'STRICT_RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000),
      limit: req.rateLimit.limit,
      current: req.rateLimit.current
    });
  }
});

// Lenient rate limiter for read-only operations
exports.readLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per window for read operations
  message: {
    status: 'error',
    message: 'Too many requests. Please slow down.',
    code: 'READ_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,

  handler: (req, res) => {
    res.status(429).json({
      status: 'error',
      message: 'Too many requests. Please slow down.',
      code: 'READ_RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000)
    });
  }
});

// Legacy export for backward compatibility (uses general limiter)
exports.rateLimiter = exports.generalLimiter;