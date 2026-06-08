const nodemailer = require('nodemailer');

const SMTP_HOST = (process.env.SMTP_HOST || 'smtp.ethereal.email').trim();
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = (process.env.SMTP_USER || '').trim();
const SMTP_PASS = (process.env.SMTP_PASS || '').trim();

let transportConfig = {
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // true for 465, false for other ports
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
    },
};

// If using Gmail, use service config for better compatibility and stability
if (SMTP_HOST.includes('gmail') || SMTP_USER.includes('gmail.com')) {
    transportConfig = {
        service: 'gmail',
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
        },
    };
}

const transporter = nodemailer.createTransport(transportConfig);

/**
 * Send order confirmation email
 * @param {string} to - Recipient email
 * @param {object} order - Order details
 * @param {Array} items - List of items
 */
async function sendOrderConfirmation(to, order, items) {
    if (!SMTP_USER) {
        console.log('Skipping email: SMTP credentials not provided.');
        return;
    }

    const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.name}" width="50" style="vertical-align: middle; margin-right: 10px; border-radius: 4px;">` : ''}
        ${item.name}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">₹${item.price.toFixed(2)}</td>
    </tr>
  `).join('');

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h1 style="color: #1e3a8a; text-align: center;">Order Confirmed!</h1>
      <p style="text-align: center; color: #666;">Thank you for your purchase.</p>
      
      <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Order ID:</strong> ${order.id}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        <p><strong>Total Amount:</strong> ₹${order.total.toFixed(2)}</p>
      </div>

      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #f3f4f6;">
            <th style="padding: 10px; text-align: left;">Item</th>
            <th style="padding: 10px; text-align: left;">Qty</th>
            <th style="padding: 10px; text-align: left;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div style="margin-top: 30px; text-align: center; color: #888; font-size: 12px;">
        <p>If you have any questions, reply to this email.</p>
        <p>&copy; ${new Date().getFullYear()} ShopSphere. All rights reserved.</p>
      </div>
    </div>
  `;

    try {
        const info = await transporter.sendMail({
            from: `"ShopSphere" <${SMTP_USER}>`,
            to: to,
            subject: `Order Confirmation #${order.id}`,
            html: html,
        });
        console.log('Message sent: %s', info.messageId);
    } catch (err) {
        console.error('Error sending email:', err);
    }
}

/**
 * Send seller approval email
 * @param {string} to - Recipient email
 * @param {string} sellerName - Name of the seller
 */
async function sendSellerApprovalEmail(to, sellerName) {
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h1 style="color: #10b981; text-align: center;">Congratulations, ${sellerName}!</h1>
      <p style="text-align: center; color: #666; font-size: 16px;">Your seller account has been approved.</p>
      
      <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center; border: 1px solid #bbf7d0;">
        <p style="color: #166534; font-weight: bold; font-size: 18px; margin: 0;">Welcome to the Platform</p>
        <p style="color: #4b5563; margin-top: 10px; font-size: 14px;">You can now log in to your dashboard and start listing your products.</p>
      </div>

      <div style="text-align: center; margin-top: 30px;">
         <a href="http://127.0.0.1:5173/seller/login" style="background-color: #111827; color: white; padding: 12px 25px; text-decoration: none; font-weight: bold; border-radius: 8px; font-size: 15px;">Access Dashboard</a>
      </div>

      <div style="margin-top: 40px; text-align: center; color: #888; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px;">
        <p>If you did not request this, please contact support immediately.</p>
        <p>&copy; ${new Date().getFullYear()} ShopSphere. All rights reserved.</p>
      </div>
    </div>
  `;

    try {
        const fs = require('fs');
        const path = require('path');
        const logDir = path.join(__dirname, '../../logs');
        if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
        fs.writeFileSync(path.join(logDir, 'last_approval_email.html'), html);
        console.log('Approval email saved locally to backend/logs/last_approval_email.html');
    } catch (e) {
        console.error('Failed to save email locally:', e);
    }

    if (!SMTP_USER || (SMTP_USER.includes('gmail.com') && SMTP_PASS === 'Aadhi@2002')) {
        console.log('Skipping real SMTP email sending (Credentials not setup properly). Local test copy saved.');
        return;
    }

    try {
        const info = await transporter.sendMail({
            from: `"ShopSphere" <${SMTP_USER}>`,
            to: to,
            subject: `Welcome to ShopSphere - Account Approved!`,
            html: html,
        });
        console.log('Seller Approval email sent: %s', info.messageId);
    } catch (err) {
        console.error('Error sending seller approval email:', err);
    }
}

/**
 * Send seller rejection email
 * @param {string} to - Recipient email
 * @param {string} sellerName - Name of the seller
 * @param {string} reason - Rejection reason
 */
async function sendSellerRejectionEmail(to, sellerName, reason) {
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h1 style="color: #ef4444; text-align: center;">Account Update</h1>
      <p style="color: #666; font-size: 15px;">Dear ${sellerName},</p>
      <p style="color: #666; font-size: 15px;">Thank you for your interest in joining ShopSphere. After reviewing your application, we regret to inform you that your request cannot be approved at this time.</p>
      
      <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #fecaca;">
        <p style="color: #991b1b; font-weight: bold; margin: 0 0 5px 0;">Reason for Rejection:</p>
        <p style="color: #4b5563; font-style: italic; margin: 0;">"${reason || 'The provided business details did not meet our platform criteria.'}"</p>
      </div>

      <p style="color: #666; font-size: 14px;">If you believe this was an error or if you can supply further documentation, please feel free to reach out to our partner assistance team.</p>

      <div style="margin-top: 40px; text-align: center; color: #888; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px;">
        <p>This is an automated notification. Replies are not monitored.</p>
        <p>&copy; ${new Date().getFullYear()} ShopSphere. All rights reserved.</p>
      </div>
    </div>
  `;

    try {
        const fs = require('fs');
        const path = require('path');
        const logDir = path.join(__dirname, '../../logs');
        if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
        fs.writeFileSync(path.join(logDir, 'last_rejection_email.html'), html);
        console.log('Rejection email saved locally to backend/logs/last_rejection_email.html');
    } catch (e) {
        console.error('Failed to save email locally:', e);
    }

    if (!SMTP_USER || (SMTP_USER.includes('gmail.com') && SMTP_PASS === 'Aadhi@2002')) {
        console.log('Skipping real SMTP email sending (Credentials not setup properly). Local test copy saved.');
        return;
    }

    try {
        const info = await transporter.sendMail({
            from: `"ShopSphere" <${SMTP_USER}>`,
            to: to,
            subject: `ShopSphere Seller Application Status`,
            html: html,
        });
        console.log('Seller Rejection email sent: %s', info.messageId);
    } catch (err) {
        console.error('Error sending seller rejection email:', err);
    }
}

/**
 * Send seller OTP email
 * @param {string} to - Recipient email
 * @param {string} otp - The 6-digit OTP code
 */
async function sendSellerOTPEmail(to, otp) {
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h1 style="color: #2874f0; text-align: center;">Verify Your Email</h1>
      <p style="text-align: center; color: #666; font-size: 16px;">Use the following One-Time Password (OTP) to complete your seller registration.</p>
      
      <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin: 25px 0; text-align: center; border: 1px solid #e2e8f0;">
        <p style="color: #1e3a8a; font-weight: bold; font-size: 32px; letter-spacing: 5px; margin: 0;">${otp}</p>
        <p style="color: #64748b; margin-top: 10px; font-size: 13px;">This code will expire in 10 minutes.</p>
      </div>

      <div style="margin-top: 40px; text-align: center; color: #888; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px;">
        <p>If you did not request this, please ignore this email.</p>
        <p>&copy; ${new Date().getFullYear()} ShopSphere. All rights reserved.</p>
      </div>
    </div>
  `;

    try {
        const fs = require('fs');
        const path = require('path');
        const logDir = path.join(__dirname, '../../logs');
        if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
        fs.writeFileSync(path.join(logDir, 'last_otp_email.html'), html);
        console.log('OTP email saved locally to backend/logs/last_otp_email.html');
    } catch (e) {
        console.error('Failed to save email locally:', e);
    }

    if (!SMTP_USER || (SMTP_USER.includes('gmail.com') && SMTP_PASS === 'Aadhi@2002')) {
        console.log('Skipping real SMTP OTP email sending. Local copy saved.');
        return;
    }

    try {
        await transporter.sendMail({
            from: `"ShopSphere" <${SMTP_USER}>`,
            to: to,
            subject: `${otp} is your ShopSphere Verification Code`,
            html: html,
        });
        console.log('OTP email sent successfully to %s', to);
    } catch (err) {
        console.error('Error sending OTP email:', err);
    }
}

module.exports = { sendOrderConfirmation, sendSellerApprovalEmail, sendSellerRejectionEmail, sendSellerOTPEmail };
