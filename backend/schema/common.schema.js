const { z } = require('zod');

// Schema for validating UUIDs
const idSchema = z.string().uuid('Invalid ID format');

module.exports = {
  idSchema,
};