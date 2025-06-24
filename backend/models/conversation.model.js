const mongoose = require('mongoose');
const { Schema } = mongoose;
const mongoosePaginate = require('mongoose-paginate-v2');

const conversationSchema = new Schema({
  item: {
    type: Schema.Types.ObjectId,
    ref: 'Item',
    required: [true, 'An item is required for the conversation'],
    index: true,
  },
  participants: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    required: [true, 'Participants are required'],
    validate: [
      {
        validator: (arr) => Array.isArray(arr) && arr.length === 2,
        msg: 'Participants must be an array with exactly two participants',
      },
      {
        validator: (arr) => new Set(arr).size === arr.length,
        msg: 'Participants must be unique',
      },
      {
        validator: (arr) => arr.every(id => mongoose.Types.ObjectId.isValid(id)),
        msg: 'All participants must be valid ObjectIds',
      },
    ],
  },
  lastMessage: {
    type: Schema.Types.ObjectId,
    ref: 'Message',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Pre-save hook to ensure participants is valid and sorted
conversationSchema.pre('save', function(next) {
  if (!Array.isArray(this.participants)) {
    return next(new Error('Participants must be an array'));
  }
  if (this.participants.length !== 2) {
    return next(new Error('Participants must have exactly two entries'));
  }
  this.participants = this.participants.sort();
  next();
});

conversationSchema.plugin(mongoosePaginate);
conversationSchema.index({ item: 1, "participants.0": 1, "participants.1": 1 }, { unique: true });

module.exports = mongoose.model('Conversation', conversationSchema);