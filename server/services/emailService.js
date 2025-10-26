import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : undefined,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: process.env.EMAIL_USER
    ? {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    : undefined
});

// verify transporter at startup (best-effort)
if (process.env.EMAIL_HOST) {
  transporter.verify()
    .then(() => console.log('Email transporter is ready'))
    .catch((err) => console.error('Email transporter verification failed:', err));
}

export const sendEmail = async ({ to, subject, html, text }) => {
  if (!process.env.EMAIL_HOST) {
    console.warn('EMAIL_HOST not configured — skipping sending email');
    return;
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    text,
    html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error('Failed to send email', err);
    throw err;
  }
};

export default { sendEmail };
