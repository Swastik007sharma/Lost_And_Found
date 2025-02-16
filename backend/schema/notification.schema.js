const { z } = require('zod');

// Schema for marking a notification as read
const markAsReadSchema = z.object({
  id: z.string().uuid('Invalid notification ID'), // Notification ID
});

module.exports = {
  markAsReadSchema,
};