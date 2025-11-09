const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'keeper', 'admin'],
    default: 'user',
  },
  // Keeper-specific fields
  location: {
    type: String,
    trim: true,
    default: '',
  },
  department: {
    type: String,
    trim: true,
    default: '',
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  deactivatedAt: {
    type: Date,
    default: null,
    index: true,
  },
  resetPasswordOtp: {
    type: String,
    default: null, // Stores the OTP for password reset
  },
  resetPasswordOtpExpiresAt: {
    type: Date,
    default: null, // Stores the expiration time of the OTP
  },
  lastLoginDate: {
    type: Date,
    default: Date.now,
    index: true,
  },
  scheduledForDeletion: {
    type: Boolean,
    default: false,
    index: true,
  },
  deletionScheduledAt: {
    type: Date,
    default: null,
  },
  deletionWarningEmailSent: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save middleware to hash password and track deactivation
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  // Track when user is deactivated
  if (this.isModified('isActive')) {
    if (this.isActive === false && !this.deactivatedAt) {
      this.deactivatedAt = new Date();
    } else if (this.isActive === true) {
      this.deactivatedAt = null; // Reset if reactivated
    }
  }

  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('User', userSchema);