import nodemailer from 'nodemailer';
import { PriceData } from '../price-fetcher';

export interface EmailConfig {
  user: string;
  password: string;
  to: string;
}

export async function sendEmailNotification(
  config: EmailConfig,
  priceData: PriceData,
  alertReason: string
): Promise<void> {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.user,
      pass: config.password
    }
  });

  const mailOptions = {
    from: `"Gold Alert" <${config.user}>`,
    to: config.to,
    subject: `🔔 Gold Price Alert - $${priceData.price.toFixed(2)}`,
    html: getEmailTemplate(priceData, alertReason)
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Email notification sent');
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    throw error;
  }
}

function getEmailTemplate(priceData: PriceData, alertReason: string): string {
  const change = priceData.price - (priceData.previousPrice || priceData.price);
  const changePercent = priceData.previousPrice
    ? ((change / priceData.previousPrice) * 100)
    : 0;

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f5f5f5;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 10px;
      padding: 30px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .price {
      font-size: 36px;
      font-weight: bold;
      color: #667eea;
      margin: 20px 0;
    }
    .change {
      font-size: 18px;
      padding: 10px 20px;
      border-radius: 5px;
      display: inline-block;
      margin: 10px 0;
    }
    .up {
      background-color: #d4edda;
      color: #155724;
    }
    .down {
      background-color: #f8d7da;
      color: #721c24;
    }
    .alert {
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      font-size: 14px;
      color: #666;
    }
    a {
      color: #667eea;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>🔔 Gold Price Alert</h2>

    <div class="price">$${priceData.price.toFixed(2)}</div>

    <div class="change ${change >= 0 ? 'up' : 'down'}">
      ${change >= 0 ? '↑' : '↓'} ${change >= 0 ? '+' : ''}$${Math.abs(change).toFixed(2)}
      (${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)
    </div>

    <div class="alert">
      <strong>Alert Reason:</strong><br>
      ${alertReason}
    </div>

    <p><strong>Data Source:</strong> Kitco<br>
    <strong>Last Update:</strong> ${new Date().toLocaleString('en-US', { timeZone: 'UTC' })}</p>

    <div class="footer">
      <p>Powered by <a href="https://github.com/HoneyKarina/gold-alert">Gold Alert</a> - Open Source Gold Price Monitoring</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
