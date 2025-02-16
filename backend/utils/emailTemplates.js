module.exports = {
    otpTemplate: (name, itemTitle, otp) => `
      <p>Hello ${name},</p>
      <p>An OTP has been generated for claiming your lost item titled "${itemTitle}".</p>
      <p>OTP: <strong>${otp}</strong></p>
      <p>Please use this OTP to verify the claim within 10 minutes.</p>
    `,
    claimNotificationTemplate: (name, itemTitle) => `
      <p>Hello ${name},</p>
      <p>Your lost item titled "${itemTitle}" has been claimed by another user.</p>
      <p>Thank you for using our service!</p>
    `,
};