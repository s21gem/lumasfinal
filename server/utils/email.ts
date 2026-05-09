import nodemailer from 'nodemailer';

export const sendOTP = async (email: string, otp: string) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `"Lumas Creative Admin" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Admin Security OTP',
    html: `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 500px; margin: auto;">
        <h2 style="color: #22d3ee; text-align: center;">Security Verification</h2>
        <p>You have requested to change your admin credentials. Use the code below to verify your identity:</p>
        <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${otp}
        </div>
        <p style="color: #666; font-size: 12px; text-align: center;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};
