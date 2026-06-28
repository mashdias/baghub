import nodemailer from 'nodemailer';

export const sendWelcomeEmail = async (toEmail: string, name: string) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'test@example.com',
      pass: process.env.EMAIL_PASS || 'password',
    },
  });

  const htmlTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px;">
      <h2 style="color: #db2777; text-align: center;">Welcome to Bag Hub!</h2>
      <p style="color: #374151; font-size: 16px;">Hi ${name},</p>
      <p style="color: #374151; font-size: 16px;">We are thrilled to have you join the Bag Hub community. Explore our latest collection of premium, handcrafted bags designed exactly for your style.</p>
      <div style="text-align: center; margin-top: 30px;">
        <a href="http://localhost:3000" style="background-color: #db2777; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Start Shopping</a>
      </div>
      <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 40px;">&copy; ${new Date().getFullYear()} Bag Hub. All rights reserved.</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Bag Hub" <${process.env.EMAIL_USER || 'noreply@baghub.com'}>`,
      to: toEmail,
      subject: "Welcome to Bag Hub! 🎉",
      html: htmlTemplate,
    });
    console.log("Welcome email successfully sent to:", toEmail);
  } catch (error) {
    console.error("Error sending welcome email (check .env credentials):", error);
  }
};
