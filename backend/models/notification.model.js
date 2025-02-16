const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2'); // Import pagination plugin

const { Schema } = mongoose;

const notificationSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // User receiving the notification
      required: true,
      index: true, // Add index for faster queries
    },
    message: {
      type: String, // Notification message
      required: true,
      minlength: 5, // Minimum length for message
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item', // Item related to the notification
      required: true,
      index: true, // Add index for faster queries
    },
    isRead: {
      type: Boolean,
      default: false, // Indicates if the notification has been read
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt`
  }
);

// Apply the pagination plugin
notificationSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Notification', notificationSchema);