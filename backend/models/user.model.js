const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    minlength: 3, // Minimum length for name
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Validate email format
    index: true, // Add index for faster queries
  },
  password: {
    type: String,
    required: true,
    minlength: 6, // Minimum length for password
  },
  role: {
    type: String,
    enum: ['user', 'keeper', 'admin'], // User roles
    default: 'user',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true, // Automatically adds `createdAt` and `updatedAt`
});

module.exports = mongoose.model('User', userSchema);