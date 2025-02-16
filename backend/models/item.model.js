const mongoose = require('mongoose');
const { Schema } = mongoose;

const itemSchema = new Schema({
  title: {
    type: String,
    required: true,
    minlength: 3, // Minimum length for title
  },
  description: {
    type: String,
    required: true,
    minlength: 10, // Minimum length for description
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category', // Reference to the Category model
    required: true,
    index: true, // Add index for faster queries
  },
  tags: [{
    type: String, // Array of tags (keywords)
    validate: {
      validator: (tag) => typeof tag === 'string',
      message: 'Tags must be strings.',
    },
  }],
  status: {
    type: String,
    enum: ['Lost', 'Found', 'Claimed', 'Returned'], // Lifecycle stages
    required: true,
    index: true, // Add index for faster queries
  },
  location: {
    type: String,
    required: true,
    minlength: 3, // Minimum length for location
  },
  image: {
    type: String, // URL to the image (optional)
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Finder or original poster
    required: true,
    index: true, // Add index for faster queries
  },
  claimedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // User who claims the item (optional)
    index: true, // Add index for faster queries
  },
  keeper: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Keeper holding the item (optional)
    index: true, // Add index for faster queries
  },
  qrCode: {
    type: String, // Unique QR code for the item
  },
  qrCodeExpiresAt: {
    type: Date, // Expiry time for the QR code
  },
  otp: {
    type: String, // One-time password for verification
  },
  otpExpiresAt: {
    type: Date, // Expiry time for the OTP
  },
  isClaimed: {
    type: Boolean,
    default: false, // Indicates if the item has been reserved
  },
  isReturned: {
    type: Boolean,
    default: false, // Indicates if the item has been returned to the owner
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true, // Automatically adds `createdAt` and `updatedAt`
});

module.exports = mongoose.model('Item', itemSchema);