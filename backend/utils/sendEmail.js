// ========== NODEMAILER CODE (COMMENTED OUT) ==========
// const nodemailer = require('nodemailer');
// const transporter = nodemailer.createTransport({
//   service: 'Gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASSWORD,
//   },
// });
// 
// transporter.verify((error, success) => {
//   if (error) {
//     console.error('Email transporter configuration error:', error.message);
//   } else {
//     console.log('Email transporter is ready');
//   }
// });
// ========== END OF NODEMAILER CODE ==========

// ========== Resend service implementation =========
// const { Resend } = require('resend');
const he = require('he');
const {
  otpTemplate,
  claimNotificationTemplate,
  returnNotificationTemplate,
  keeperAssignedNotificationTemplate,
  passwordResetOtpTemplate,
  claimTransactionTemplate,
  accountVerificationOtpTemplate,
} = require('./emailTemplates');

// // Initialize Resend with API key from environment variable
// const resend = new Resend(process.env.RESEND_API_KEY);

// /**
//  * Send email using Resend service
//  * @param {string} to - Recipient email address
//  * @param {string} subject - Email subject
//  * @param {string} templateName - Name of the email template to use
//  * @param {Object} templateData - Data to populate the template
//  */
// const sendEmail = async (to, subject, templateName, templateData) => {
//   // Check if Resend API key is configured
//   if (!process.env.RESEND_API_KEY) {
//     throw new Error('Resend API key is missing. Please set RESEND_API_KEY in the .env file.');
//   }

//   // Escape all string values in templateData to prevent HTML injection
//   const escapedTemplateData = {};
//   if (templateData && typeof templateData === 'object') {
//     for (const key in templateData) {
//       if (Object.prototype.hasOwnProperty.call(templateData, key)) {
//         const value = templateData[key];
//         escapedTemplateData[key] = typeof value === 'string' ? he.encode(value) : value;
//       }
//     }
//   }

//   try {
//     // Generate HTML content based on template name
//     let html;
//     switch (templateName) {
//       case 'otp':
//         html = otpTemplate(escapedTemplateData.name, escapedTemplateData.itemTitle, escapedTemplateData.otp);
//         break;
//       case 'claimNotification':
//         html = claimNotificationTemplate(escapedTemplateData.name, escapedTemplateData.itemTitle);
//         break;
//       case 'returnNotification':
//         html = returnNotificationTemplate(escapedTemplateData.name, escapedTemplateData.itemTitle);
//         break;
//       case 'keeperAssignedNotification':
//         html = keeperAssignedNotificationTemplate(escapedTemplateData.name, escapedTemplateData.itemTitle, escapedTemplateData.keeperName);
//         break;
//       case 'passwordResetOtp':
//         html = passwordResetOtpTemplate(escapedTemplateData.name, escapedTemplateData.otp);
//         break;
//       case 'claimTransaction':
//         html = claimTransactionTemplate(escapedTemplateData.name, escapedTemplateData.itemTitle, escapedTemplateData.otp, escapedTemplateData.ownerName);
//         break;
//       case 'accountVerificationOtp':
//         html = accountVerificationOtpTemplate(escapedTemplateData.name, escapedTemplateData.otp);
//         break;
//       default:
//         throw new Error('Invalid email template name');
//     }

//     // Send email using Resend
//     const { data, error } = await resend.emails.send({
//       from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
//       to,
//       subject,
//       html,
//     });

//     // Check for errors from Resend API
//     if (error) {
//       console.error('Resend API error:', error);
//       throw new Error(`Failed to send email via Resend: ${error.message}`);
//     }

//     console.log(`Email sent successfully to ${to} with template ${templateName}. Email ID: ${data.id}`);
//     return data;
//   } catch (error) {
//     console.error('Error sending email:', error.message);
//     throw new Error('Failed to send email: ' + error.message);
//   }
// };

// ========== OLD NODEMAILER IMPLEMENTATION (COMMENTED OUT) ==========
// const sendEmail = async (to, subject, templateName, templateData) => {
//   if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
//     throw new Error('Email credentials are missing. Please set EMAIL_USER and EMAIL_PASSWORD in the .env file.');
//   }
//
//   const escapedTemplateData = {};
//   if (templateData && typeof templateData === 'object') {
//     for (const key in templateData) {
//       if (Object.prototype.hasOwnProperty.call(templateData, key)) {
//         const value = templateData[key];
//         escapedTemplateData[key] = typeof value === 'string' ? he.encode(value) : value;
//       }
//     }
//   }
//
//   try {
//     let html;
//     switch (templateName) {
//       case 'otp':
//         html = otpTemplate(escapedTemplateData.name, escapedTemplateData.itemTitle, escapedTemplateData.otp);
//         break;
//       case 'claimNotification':
//         html = claimNotificationTemplate(escapedTemplateData.name, escapedTemplateData.itemTitle);
//         break;
//       case 'returnNotification':
//         html = returnNotificationTemplate(escapedTemplateData.name, escapedTemplateData.itemTitle);
//         break;
//       case 'keeperAssignedNotification':
//         html = keeperAssignedNotificationTemplate(escapedTemplateData.name, escapedTemplateData.itemTitle, escapedTemplateData.keeperName);
//         break;
//       case 'passwordResetOtp':
//         html = passwordResetOtpTemplate(escapedTemplateData.name, escapedTemplateData.otp);
//         break;
//       case 'claimTransaction':
//         html = claimTransactionTemplate(escapedTemplateData.name, escapedTemplateData.itemTitle, escapedTemplateData.otp, escapedTemplateData.ownerName);
//         break;
//       case 'accountVerificationOtp':
//         html = accountVerificationOtpTemplate(escapedTemplateData.name, escapedTemplateData.otp);
//         break;
//       default:
//         throw new Error('Invalid email template name');
//     }
//
//     const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to,
//       subject,
//       html,
//     };
//
//     await transporter.sendMail(mailOptions);
//     console.log(`Email sent successfully to ${to} with template ${templateName}`);
//   } catch (error) {
//     console.error('Error sending email:', error.message);
//     if (error.message.includes('Missing credentials')) {
//       throw new Error('Failed to send email: Missing or invalid credentials. Check EMAIL_USER and EMAIL_PASSWORD in .env.');
//     }
//     throw new Error('Failed to send email: ' + error.message);
//   }
// };
// ========== END OF OLD NODEMAILER IMPLEMENTATION ==========

const axios = require('axios');

async function sendEmail(to, subject, templateName, templateData) {
  // Escape all string values in templateData to prevent HTML injection
  const escapedTemplateData = {};
  if (templateData && typeof templateData === 'object') {
    for (const key in templateData) {
      if (Object.prototype.hasOwnProperty.call(templateData, key)) {
        const value = templateData[key];
        escapedTemplateData[key] = typeof value === 'string' ? he.encode(value) : value;
      }
    }
  }

  try {
    // Generate HTML content based on template name
    let html;
    switch (templateName) {
      case 'otp':
        html = otpTemplate(escapedTemplateData.name, escapedTemplateData.itemTitle, escapedTemplateData.otp);
        break;
      case 'claimNotification':
        html = claimNotificationTemplate(escapedTemplateData.name, escapedTemplateData.itemTitle);
        break;
      case 'returnNotification':
        html = returnNotificationTemplate(escapedTemplateData.name, escapedTemplateData.itemTitle);
        break;
      case 'keeperAssignedNotification':
        html = keeperAssignedNotificationTemplate(escapedTemplateData.name, escapedTemplateData.itemTitle, escapedTemplateData.keeperName);
        break;
      case 'passwordResetOtp':
        html = passwordResetOtpTemplate(escapedTemplateData.name, escapedTemplateData.otp);
        break;
      case 'claimTransaction':
        html = claimTransactionTemplate(escapedTemplateData.name, escapedTemplateData.itemTitle, escapedTemplateData.otp, escapedTemplateData.ownerName);
        break;
      case 'accountVerificationOtp':
        html = accountVerificationOtpTemplate(escapedTemplateData.name, escapedTemplateData.otp);
        break;
      default:
        throw new Error('Invalid email template name');
    }

    // 2. Send the request
    try {
      const response = await axios.post(process.env.MAILSERVER_URL, {
        from: `CampusTrack <${process.env.EMAIL_USER}>`,
        to: to,
        subject: subject,
        html: html
      });
      if (response.status !== 200) {
        throw new Error(`Failed to send email, status code: ${response.status}`);
      }
    } catch (err) {
      console.error("Email failed", err);
      throw new Error('Failed to send email: ' + err.message);
    }

    console.log(`Email sent successfully to ${to} with template ${templateName}`);
  } catch (error) {
    console.error('Error sending email:', error.message);
    throw new Error('Failed to send email: ' + error.message);
  }
};


module.exports = sendEmail;