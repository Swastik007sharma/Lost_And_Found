const mongoose = require('mongoose');
const { Schema } = mongoose;

const messageSchema = new Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation', // The conversation this message belongs to
    required: true,
    index: true, // Add index for faster queries
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // The user who sent the message
    required: true,
    index: true, // Add index for faster queries
  },
  content: {
    type: String, // The message text
    required: true,
    minlength: 1, // Minimum length for content
  },
  isRead: {
    type: Boolean,
    default: false, // Indicates if the message has been read
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true, // Automatically adds `createdAt` and `updatedAt`
});

module.exports = mongoose.model('Message', messageSchema);