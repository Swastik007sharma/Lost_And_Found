const mongoose = require('mongoose');
const { Schema } = mongoose;

const conversationSchema = new Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item', // The item being discussed
    required: true,
    index: true, // Add index for faster queries
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Users involved in the conversation
    required: true,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true, // Automatically adds `createdAt` and `updatedAt`
});

// Validate that there are at least two participants
conversationSchema.path('participants').validate((participants) => {
  return participants.length >= 2;
}, 'A conversation must have at least two participants.');

module.exports = mongoose.model('Conversation', conversationSchema);