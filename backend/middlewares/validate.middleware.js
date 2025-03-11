const { z } = require('zod');

// Middleware to validate request data using Zod
exports.validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      // Check if schema is provided
      if (!schema) {
        console.error(`Validation Error: No schema provided for source '${source}' on route '${req.method} ${req.path}'`);
        return res.status(500).json({ 
          message: 'Server misconfiguration: Validation schema missing', 
          code: 'VALIDATION_CONFIG_ERROR',
          route: `${req.method} ${req.path}`
        });
      }

      const data = req[source]; // Dynamically select body, params, query, etc.
      if (!data) {
        return res.status(400).json({ message: `No ${source} data provided`, code: 'MISSING_DATA' });
      }

      console.log(`Validating ${source} data for ${req.method} ${req.path}:`, data); // Debug log
      const validatedData = schema.parse(data);
      req[`validated${source.charAt(0).toUpperCase() + source.slice(1)}`] = validatedData; // e.g., req.validatedBody
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.') || 'root',
          message: err.message,
        }));
        console.error(`Validation Error (${source}) on ${req.method} ${req.path}:`, { errors, rawData: req[source] });
        return res.status(400).json({ 
          message: 'Validation failed', 
          code: 'VALIDATION_ERROR', 
          details: errors,
          route: `${req.method} ${req.path}`
        });
      }
      console.error('Unexpected Validation Error:', { message: error.message, stack: error.stack });
      res.status(500).json({ message: 'Server error during validation', code: 'SERVER_ERROR' });
    }
  };
};