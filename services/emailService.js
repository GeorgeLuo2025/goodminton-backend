const nodemailer = require('nodemailer');

// 创建邮件传输器（使用Ethereal Email进行测试）
const createTransporter = async () => {
  // 对于测试环境，使用Ethereal Email
  if (process.env.NODE_ENV === 'development') {
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  }
  
  // 生产环境使用真实邮件服务
  return nodemailer.createTransporter({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

const sendMagicLink = async (email, token) => {
  try {
    const transporter = await createTransporter();
    const magicLink = `${process.env.CLIENT_URL}/auth/verify?token=${token}&type=email`;
    
    const mailOptions = {
      from: '"Badminton Community" <noreply@badmintoncommunity.com>',
      to: email,
      subject: 'Your Badminton Community Login Link',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2E8B57;">Welcome to Badminton Community!</h2>
          <p>Click the button below to sign in to your account:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${magicLink}" 
               style="background-color: #2E8B57; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; font-size: 16px;">
              Sign In to Badminton Community
            </a>
          </div>
          <p>This link will expire in 15 minutes.</p>
          <p>If you didn't request this login, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            Badminton Community - Connect, Play, Compete
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Preview URL: ', nodemailer.getTestMessageUrl(info));
    }
    
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send email');
  }
};

module.exports = { sendMagicLink };