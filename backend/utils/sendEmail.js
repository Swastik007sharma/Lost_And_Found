const nodemailer = require('nodemailer');
const {
  otpTemplate,
  claimNotificationTemplate,
  returnNotificationTemplate,
  keeperAssignedNotificationTemplate,
  passwordResetOtpTemplate,
  claimTransactionTemplate, // New template
} = require('./emailTemplates');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error('Email transporter configuration error:', error.message);
  } else {
    console.log('Email transporter is ready');
  }
});

const sendEmail = async (to, subject, templateName, templateData) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    throw new Error('Email credentials are missing. Please set EMAIL_USER and EMAIL_PASSWORD in the .env file.');
  }

  try {
    let html;
    switch (templateName) {
      case 'otp':
        html = otpTemplate(templateData.name, templateData.itemTitle, templateData.otp);
        break;
      case 'claimNotification':
        html = claimNotificationTemplate(templateData.name, templateData.itemTitle, templateData.exchangeLocation);
        break;
      case 'returnNotification':
        html = returnNotificationTemplate(templateData.name, templateData.itemTitle);
        break;
      case 'keeperAssignedNotification':
        html = keeperAssignedNotificationTemplate(templateData.name, templateData.itemTitle, templateData.keeperName);
        break;
      case 'passwordResetOtp':
        html = passwordResetOtpTemplate(templateData.name, templateData.otp);
        break;
      case 'claimTransaction':
        html = claimTransactionTemplate(templateData.name, templateData.itemTitle, templateData.otp, templateData.ownerName);
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
    console.log(`Email sent successfully to ${to} with template ${templateName}`);
  } catch (error) {
    console.error('Error sending email:', error.message);
    if (error.message.includes('Missing credentials')) {
      throw new Error('Failed to send email: Missing or invalid credentials. Check EMAIL_USER and EMAIL_PASSWORD in .env.');
    }
    throw new Error('Failed to send email: ' + error.message);
  }
};

module.exports = sendEmail;