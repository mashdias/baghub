import nodemailer from 'nodemailer';
import dns from 'dns';

// Force Node.js to prefer IPv4 DNS resolution globally.
// This prevents ETIMEDOUT errors on ISPs that block IPv6 SMTP connections.
dns.setDefaultResultOrder('ipv4first');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Use STARTTLS on port 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export const sendWelcomeEmail = async (name: string, toEmail: string) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("Email credentials missing. Skipped sending welcome email.");
    return;
  }

  const htmlTemplate = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #f3f4f6; border-radius: 12px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #7928CA; font-size: 28px; margin: 0;">BAG HUB</h1>
      </div>
      <h2 style="color: #1f2937; text-align: center; font-weight: 600;">Welcome to Bag Hub!</h2>
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">Hi ${name},</p>
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">We are thrilled to have you join the Bag Hub community. Explore our latest collection of premium, handcrafted bags designed exactly for your unique style.</p>
      <div style="text-align: center; margin-top: 35px; margin-bottom: 35px;">
        <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/products" style="background-color: #7928CA; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Start Shopping Now</a>
      </div>
      <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
      <p style="color: #9ca3af; font-size: 13px; text-align: center; margin-top: 20px;">&copy; ${new Date().getFullYear()} Bag Hub. All rights reserved.</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Bag Hub" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: "Welcome to Bag Hub! 🎉",
      html: htmlTemplate,
    });
    console.log("Welcome email sent to:", toEmail);
  } catch (error) {
    console.error("Silent Error sending welcome email:", error);
  }
};

export const sendStandardOrderReceipt = async (
  toEmail: string, 
  orderId: string, 
  totalAmount: number,
  shippingData: { name: string; address: string; city: string; phone: string },
  items: any[]
) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("Email credentials missing. Skipped sending order confirmation email.");
    return;
  }

  const formattedOrder = orderId.split('-')[0].toUpperCase();
  
  let itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #4b5563;">
        ${item.name || 'Product'} (x${item.quantity})
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #4b5563; text-align: right; font-weight: bold;">
        Rs. ${(item.price * item.quantity).toLocaleString()}
      </td>
    </tr>
  `).join('');

  const htmlTemplate = `
    <div style="font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #7928CA; font-size: 32px; margin: 0; font-weight: 800; letter-spacing: -1px;">BAG HUB</h1>
        <p style="color: #6b7280; margin-top: 5px; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Premium Quality</p>
      </div>
      
      <div style="text-align: center; margin-bottom: 40px;">
        <div style="background-color: #fdf4ff; color: #a21caf; display: inline-block; padding: 8px 16px; border-radius: 9999px; font-weight: 700; font-size: 14px; margin-bottom: 16px;">
          Payment Successful
        </div>
        <h2 style="color: #111827; font-size: 24px; margin: 0 0 10px 0;">Thank you for your order!</h2>
        <p style="color: #4b5563; font-size: 16px; margin: 0;">Your order <strong>ORD-${formattedOrder}</strong> has been confirmed.</p>
      </div>
      
      <div style="background-color: #f9fafb; border-radius: 12px; overflow: hidden; margin-bottom: 30px;">
        <div style="padding: 20px; border-bottom: 1px solid #e5e7eb;">
          <h3 style="margin: 0; color: #374151; font-size: 16px; text-transform: uppercase; letter-spacing: 1px;">Order Summary</h3>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
          <tbody>
            ${itemsHtml}
            <tr>
              <td style="padding: 16px 12px; color: #111827; font-weight: bold; font-size: 18px;">Total Paid</td>
              <td style="padding: 16px 12px; color: #7928CA; text-align: right; font-weight: 800; font-size: 18px;">
                Rs. ${totalAmount.toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style="background-color: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 40px;">
        <h3 style="margin: 0 0 15px 0; color: #374151; font-size: 16px; text-transform: uppercase; letter-spacing: 1px;">Shipping Details</h3>
        <p style="margin: 0 0 5px 0; color: #111827; font-weight: 600;">${shippingData.name}</p>
        <p style="margin: 0 0 5px 0; color: #4b5563;">${shippingData.address}</p>
        <p style="margin: 0 0 5px 0; color: #4b5563;">${shippingData.city}</p>
        <p style="margin: 0; color: #4b5563;">📞 ${shippingData.phone}</p>
      </div>
      
      <div style="text-align: center;">
        <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard" style="background-color: #111827; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; transition: background-color 0.2s;">View Dashboard</a>
      </div>
      
      <div style="margin-top: 40px; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 30px;">
        <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">If you have any questions, simply reply to this email.</p>
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} Bag Hub. All rights reserved.</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Bag Hub Support" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `Order Receipt: ORD-${formattedOrder} ✅`,
      html: htmlTemplate,
    });
    console.log("Order receipt sent to:", toEmail);
  } catch (error) {
    console.error("Error sending order receipt:", error);
  }
};

export const sendCustomRequestReceipt = async (
  toEmail: string, 
  requestId: string, 
  quotedPrice: number,
  shippingData: { name: string; address: string; city: string; phone: string },
  customDetails: string
) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("Email credentials missing. Skipped sending custom request receipt.");
    return;
  }

  const formattedReq = requestId.split('-')[0].toUpperCase();

  const htmlTemplate = `
    <div style="font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #7928CA; font-size: 32px; margin: 0; font-weight: 800; letter-spacing: -1px;">BAG HUB</h1>
        <p style="color: #6b7280; margin-top: 5px; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Custom Studio</p>
      </div>
      
      <div style="text-align: center; margin-bottom: 40px;">
        <div style="background-color: #dcfce7; color: #15803d; display: inline-block; padding: 8px 16px; border-radius: 9999px; font-weight: 700; font-size: 14px; margin-bottom: 16px;">
          Custom Payment Successful
        </div>
        <h2 style="color: #111827; font-size: 24px; margin: 0 0 10px 0;">Production Started!</h2>
        <p style="color: #4b5563; font-size: 16px; margin: 0;">We've received payment for Custom Request <strong>REQ-${formattedReq}</strong>.</p>
      </div>
      
      <div style="background-color: #f9fafb; border-radius: 12px; overflow: hidden; margin-bottom: 30px;">
        <div style="padding: 20px; border-bottom: 1px solid #e5e7eb;">
          <h3 style="margin: 0; color: #374151; font-size: 16px; text-transform: uppercase; letter-spacing: 1px;">Request Details</h3>
        </div>
        <div style="padding: 20px;">
          <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 0; font-style: italic;">
            "${customDetails}"
          </p>
        </div>
        <table style="width: 100%; border-collapse: collapse; border-top: 1px solid #e5e7eb;">
          <tbody>
            <tr>
              <td style="padding: 16px 20px; color: #111827; font-weight: bold; font-size: 18px;">Quote Paid</td>
              <td style="padding: 16px 20px; color: #7928CA; text-align: right; font-weight: 800; font-size: 18px;">
                Rs. ${quotedPrice.toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style="background-color: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 40px;">
        <h3 style="margin: 0 0 15px 0; color: #374151; font-size: 16px; text-transform: uppercase; letter-spacing: 1px;">Shipping Details</h3>
        <p style="margin: 0 0 5px 0; color: #111827; font-weight: 600;">${shippingData.name}</p>
        <p style="margin: 0 0 5px 0; color: #4b5563;">${shippingData.address}</p>
        <p style="margin: 0 0 5px 0; color: #4b5563;">${shippingData.city}</p>
        <p style="margin: 0; color: #4b5563;">📞 ${shippingData.phone}</p>
      </div>
      
      <div style="text-align: center;">
        <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard" style="background-color: #111827; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; transition: background-color 0.2s;">Track Production</a>
      </div>
      
      <div style="margin-top: 40px; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 30px;">
        <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">Our artisans are now working on your unique piece.</p>
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} Bag Hub. All rights reserved.</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Bag Hub Custom Studio" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `Payment Received: Custom Bag REQ-${formattedReq} 🎨`,
      html: htmlTemplate,
    });
    console.log("Custom request receipt sent to:", toEmail);
  } catch (error) {
    console.error("Error sending custom request receipt:", error);
  }
};

export const sendOrderConfirmationEmail = async (
  toEmail: string,
  orderId: string,
  totalAmount: number
) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("Email credentials missing. Skipped sending order confirmation email.");
    return;
  }

  const formattedOrder = `ORD-${orderId.split('-')[0].toUpperCase()}`;

  const htmlTemplate = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #f3f4f6; border-radius: 12px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #7928CA; font-size: 28px; margin: 0;">BAG HUB</h1>
      </div>
      <h2 style="color: #1f2937; text-align: center; font-weight: 600;">Order Confirmed!</h2>
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">Hi there,</p>
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">Thank you for your purchase! We've received your order <strong>${formattedOrder}</strong>.</p>
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 25px 0;">
        <p style="margin: 0; font-size: 16px; color: #374151;"><strong>Total Amount Paid:</strong> Rs. ${totalAmount.toLocaleString()}</p>
      </div>
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">We'll notify you as soon as your order ships.</p>
      <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
      <p style="color: #9ca3af; font-size: 13px; text-align: center; margin-top: 20px;">&copy; ${new Date().getFullYear()} Bag Hub. All rights reserved.</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Bag Hub" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: "Order Confirmed: Bag Hub ✅",
      html: htmlTemplate,
    });
    console.log("Order confirmation email sent to:", toEmail);
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
  }
};

export const sendPasswordResetEmail = async (
  toEmail: string,
  resetLink: string
) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("Email credentials missing. Skipped sending password reset email.");
    return;
  }

  const htmlTemplate = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #f3f4f6; border-radius: 12px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #7928CA; font-size: 28px; margin: 0;">BAG HUB</h1>
      </div>
      <h2 style="color: #1f2937; text-align: center; font-weight: 600;">Reset Your Password</h2>
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">Hi there,</p>
      <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">You recently requested to reset your password for your Bag Hub account. Click the button below to proceed.</p>
      <div style="text-align: center; margin-top: 35px; margin-bottom: 35px;">
        <a href="${resetLink}" style="background-color: #7928CA; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Reset Password</a>
      </div>
      <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">If you did not request a password reset, please ignore this email. This link will expire in 1 hour.</p>
      <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
      <p style="color: #9ca3af; font-size: 13px; text-align: center; margin-top: 20px;">&copy; ${new Date().getFullYear()} Bag Hub. All rights reserved.</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Bag Hub Support" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: "Password Reset Request - Bag Hub 🔐",
      html: htmlTemplate,
    });
    console.log("Password reset email sent to:", toEmail);
  } catch (error) {
    console.error("Error sending password reset email:", error);
  }
};
