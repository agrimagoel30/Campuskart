const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1) Create a transporter (SMTP setup)
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  // 2) Define the email options
  const mailOptions = {
    from: `CampusCart <${process.env.EMAIL_FROM}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: options.html // Optional: we can add HTML templates later
  };

  // 3) Actually send the email
  try {
    if (process.env.EMAIL_USERNAME === 'your_mailtrap_username' || !process.env.EMAIL_USERNAME) {
      console.log('\n================ DEVELOPMENT EMAIL MOCK ================');
      console.log(`To: ${options.email}`);
      console.log(`Subject: ${options.subject}`);
      console.log(`Message:\n${options.message}`);
      console.log('==========================================================\n');
      return; // Skip actual sending to prevent crash with placeholder credentials
    }
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = sendEmail;
