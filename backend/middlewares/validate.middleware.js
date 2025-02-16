const { z } = require('zod');

// Middleware to validate request body using Zod
exports.validate = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body); // Validate the request body
      next(); // Proceed to the next middleware/controller
    } catch (error) {
      const errors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      res.status(400).json({ error: 'Validation failed', details: errors });
    }
  };
};