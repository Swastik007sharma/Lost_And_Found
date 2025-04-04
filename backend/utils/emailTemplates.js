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
  // Template for password reset OTP email
  passwordResetOtpTemplate: (name, otp) => `
    <p>Hello ${name},</p>
    <p>We received a request to reset your password for the Lost and Found Platform.</p>
    <p>Your OTP for password reset is: <strong>${otp}</strong></p>
    <p>Please use this OTP to verify your request within 10 minutes.</p>
    <p>If you did not request a password reset, please ignore this email.</p>
  `,
};