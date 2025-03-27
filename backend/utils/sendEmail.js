const nodemailer = require('nodemailer');
const { otpTemplate, claimNotificationTemplate, returnNotificationTemplate, keeperAssignedNotificationTemplate } = require('./emailTemplates');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

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
      case 'returnNotification':
        html = returnNotificationTemplate(templateData.name, templateData.itemTitle);
        break;
      case 'keeperAssignedNotification':
        html = keeperAssignedNotificationTemplate(templateData.name, templateData.itemTitle, templateData.keeperName);
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