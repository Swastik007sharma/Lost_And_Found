module.exports = {
  // Template for OTP email notification
  otpTemplate: (name, itemTitle, otp) => `
    <p>Hello ${name},</p>
    <p>An OTP has been generated for claiming your lost item titled "${itemTitle}".</p>
    <p>OTP: <strong>${otp}</strong></p>
    <p>Please use this OTP to verify the claim within 10 minutes.</p>
  `,
  // Template for claim notification email
  claimNotificationTemplate: (name, itemTitle) => `
    <p>Hello ${name},</p>
    <p>Your lost item titled "${itemTitle}" has been claimed by another user.</p>
    <p>Thank you for using our service!</p>
  `,
  // Template for return notification email
  returnNotificationTemplate: (name, itemTitle) => `
    <p>Hello ${name},</p>
    <p>Your item "${itemTitle}" has been marked as returned.</p>
    <p>Thank you for using our service!</p>
  `,
  // Template for keeper assignment notification email
  keeperAssignedNotificationTemplate: (name, itemTitle, keeperName) => `
    <p>Hello ${name},</p>
    <p>A keeper (${keeperName}) has been assigned to your item "${itemTitle}".</p>
    <p>They will help manage the item until it's claimed or returned.</p>
  `,
};