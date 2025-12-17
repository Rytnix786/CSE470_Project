// Simple email utility - logs to console since SMTP is not configured
// To enable real emails, install nodemailer and configure SMTP settings in .env

const createTransporter = () => {  
  // Always use console logging (SMTP not configured)
  return {
    sendMail: async (mailOptions) => {
      console.log('\n📧 EMAIL (Console Mode - SMTP not configured):');
      console.log('-------------------------------------------');
      console.log('To:', mailOptions.to);
      console.log('Subject:', mailOptions.subject);
      console.log('Content:', mailOptions.text || mailOptions.html);
      console.log('-------------------------------------------\n');
      return { messageId: 'console-' + Date.now() };
    },
  };
};

const transporter = createTransporter();

const sendEmail = async ({ to, subject, text, html }) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@bracu-consultation.com',
    to,
    subject,
    text,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Email error:', error.message);
    throw error;
  }
};

module.exports = { sendEmail };
