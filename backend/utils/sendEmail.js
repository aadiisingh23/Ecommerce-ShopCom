import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const sendEmail = async (email, subject, message) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // App Password mapping
      },
    });

    const mailOptions = {
      from: `"ShopNest Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: message,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email successfully sent to ${email}`);
  } catch (error) {
    console.error(`Failed to send email to ${email}: ${error.message}`);
  }
};

export default sendEmail
