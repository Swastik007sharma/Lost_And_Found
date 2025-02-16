const nodemailer = require('nodemailer');
const { otpTemplate, claimNotificationTemplate } = require('./emailTemplates');

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'Gmail', // Replace with your email service (e.g., Gmail, SendGrid)
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASSWORD, // Your email password or app-specific password
  },
});

// Function to send an email
const sendEmail = async (to, subject, templateName, templateData) => {
  try {
    let html;
    switch (templateName) {
      case 'otp':
        html = otpTemplate(templateData.name, templateData.itemTitle, templateData.otp);
        break;
      case 'claimNotification':
        html = claimNotificationTemplate(templateData.name, templateData.itemTitle);
        break;
      default:
        throw new Error('Invalid email template name');
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error.message);
    throw new Error('Failed to send email');
  }
};

module.exports = sendEmail;