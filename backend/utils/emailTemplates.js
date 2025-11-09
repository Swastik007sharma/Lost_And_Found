module.exports = {
  // Template for OTP email notification (for initial claim verification)
  otpTemplate: (name, itemTitle, otp) => `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #2c3e50;">Lost and Found Platform</h2>
        <p>Hello ${name},</p>
        <p>An OTP has been generated for claiming your lost item titled "<strong>${itemTitle}</strong>".</p>
        <p>Your OTP: <strong style="color: #e74c3c;">${otp}</strong></p>
        <p>Please use this OTP to verify the claim within <strong>10 minutes</strong>.</p>
        <p>If you did not request this, please contact support immediately.</p>
        <hr style="border: 1px solid #ddd;">
        <p style="font-size: 12px; color: #7f8c8d;">Lost and Found Platform © 2025</p>
      </body>
    </html>
  `,

  // Template for claim notification email (sent to the item poster)
  claimNotificationTemplate: (name, itemTitle) => `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #2c3e50;">Lost and Found Platform</h2>
        <p>Hello ${name},</p>
        <p>Your lost item titled "<strong>${itemTitle}</strong>" has been claimed by another user.</p>
        <p>Thank you for using our service! You will be notified when the transaction is completed.</p>
        <hr style="border: 1px solid #ddd;">
        <p style="font-size: 12px; color: #7f8c8d;">Lost and Found Platform © 2025</p>
      </body>
    </html>
  `,

  // Template for return notification email
  returnNotificationTemplate: (name, itemTitle) => `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #2c3e50;">Lost and Found Platform</h2>
        <p>Hello ${name},</p>
        <p>Your item "<strong>${itemTitle}</strong>" has been marked as returned.</p>
        <p>Thank you for using our service! Please contact support if you have any questions.</p>
        <hr style="border: 1px solid #ddd;">
        <p style="font-size: 12px; color: #7f8c8d;">Lost and Found Platform © 2025</p>
      </body>
    </html>
  `,

  // Template for keeper assignment notification email
  keeperAssignedNotificationTemplate: (name, itemTitle, keeperName) => `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #2c3e50;">Lost and Found Platform</h2>
        <p>Hello ${name},</p>
        <p>A keeper (<strong>${keeperName}</strong>) has been assigned to your item "<strong>${itemTitle}</strong>".</p>
        <p>They will help manage the item until it's claimed or returned. Contact them for further details.</p>
        <hr style="border: 1px solid #ddd;">
        <p style="font-size: 12px; color: #7f8c8d;">Lost and Found Platform © 2025</p>
      </body>
    </html>
  `,

  // Template for password reset OTP email
  passwordResetOtpTemplate: (name, otp) => `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #2c3e50;">Lost and Found Platform</h2>
        <p>Hello ${name},</p>
        <p>We received a request to reset your password for the Lost and Found Platform.</p>
        <p>Your OTP for password reset is: <strong style="color: #e74c3c;">${otp}</strong></p>
        <p>Please use this OTP to verify your request within <strong>10 minutes</strong>.</p>
        <p>If you did not request a password reset, please ignore this email or contact support.</p>
        <hr style="border: 1px solid #ddd;">
        <p style="font-size: 12px; color: #7f8c8d;">Lost and Found Platform © 2025</p>
      </body>
    </html>
  `,

  // Template for claim transaction verification email
  claimTransactionTemplate: (name, itemTitle, otp, ownerName) => `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #2c3e50;">Lost and Found Platform</h2>
        <p>Hello ${name},</p>
        <p>To complete the transaction of item "<strong>${itemTitle}</strong>", please verify the OTP with the owner or keeper of the item posted by <strong>${ownerName}</strong>.</p>
        <p>Your OTP: <strong style="color: #e74c3c;">${otp}</strong></p>
        <p>Please use this OTP to verify the transaction within <strong>10 minutes</strong>.</p>
        <p>If you did not initiate this claim, please contact support immediately.</p>
        <hr style="border: 1px solid #ddd;">
        <p style="font-size: 12px; color: #7f8c8d;">Lost and Found Platform © 2025</p>
      </body>
    </html>
  `,

  // Template for account verification OTP email during registration
  accountVerificationOtpTemplate: (name, otp) => `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #2c3e50;">Lost and Found Platform</h2>
        <p>Hello ${name},</p>
        <p>Thank you for registering with the Lost and Found Platform!</p>
        <p>Your OTP for account verification is: <strong style="color: #e74c3c;">${otp}</strong></p>
        <p>Please use this OTP to verify your account within <strong>10 minutes</strong>.</p>
        <p>If you did not initiate this registration, please ignore this email or contact support.</p>
        <hr style="border: 1px solid #ddd;">
        <p style="font-size: 12px; color: #7f8c8d;">Lost and Found Platform © 2025</p>
      </body>
    </html>
  `,

  // Template for account deletion warning (7 days before deletion)
  accountDeletionWarningTemplate: (name, daysRemaining, frontendUrl) => `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <h2 style="color: #e74c3c; border-bottom: 3px solid #e74c3c; padding-bottom: 10px;">⚠️ Account Deletion Warning</h2>
          <p>Hello <strong>${name}</strong>,</p>
          <p>Your account on the <strong>Lost and Found Platform</strong> has been inactive for an extended period.</p>
          <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #856404;">
              <strong>Your account will be permanently deleted in ${daysRemaining} days</strong> if you do not take action.
            </p>
          </div>
          <h3 style="color: #2c3e50;">What will be deleted?</h3>
          <ul style="line-height: 1.8;">
            <li>Your account and profile information</li>
            <li>All your posted items (lost/found)</li>
            <li>All conversations and messages</li>
            <li>All notifications</li>
          </ul>
          <h3 style="color: #27ae60;">How to prevent deletion:</h3>
          <p>Simply log in to your account to reactivate it and reset the inactivity timer.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${frontendUrl}/login" style="background-color: #27ae60; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Activate My Account
            </a>
          </div>
          <p style="color: #7f8c8d; font-size: 14px;">
            If you no longer wish to use this account, you can ignore this email and your account will be automatically deleted.
          </p>
          <hr style="border: 1px solid #ddd; margin: 20px 0;">
          <p style="font-size: 12px; color: #7f8c8d;">Lost and Found Platform © 2025</p>
        </div>
      </body>
    </html>
  `,

  // Template for item deletion warning (7 days before deletion)
  itemDeletionWarningTemplate: (name, itemTitle, daysRemaining, frontendUrl, itemId) => `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <h2 style="color: #e74c3c; border-bottom: 3px solid #e74c3c; padding-bottom: 10px;">⚠️ Item Deletion Warning</h2>
          <p>Hello <strong>${name}</strong>,</p>
          <p>Your item "<strong>${itemTitle}</strong>" has been inactive for 60 days and is scheduled for deletion.</p>
          <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #856404;">
              <strong>This item will be permanently deleted in ${daysRemaining} days</strong> if you do not take action.
            </p>
          </div>
          <h3 style="color: #27ae60;">How to prevent deletion:</h3>
          <p>View or update your item to reset the inactivity timer.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${frontendUrl}/items/${itemId}" style="background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              View My Item
            </a>
          </div>
          <p style="color: #7f8c8d; font-size: 14px;">
            If this item has been resolved or you no longer need it, you can ignore this email.
          </p>
          <hr style="border: 1px solid #ddd; margin: 20px 0;">
          <p style="font-size: 12px; color: #7f8c8d;">Lost and Found Platform © 2025</p>
        </div>
      </body>
    </html>
  `,
};