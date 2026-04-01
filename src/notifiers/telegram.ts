import axios from 'axios';

export interface TelegramConfig {
  botToken: string;
  chatId: string;
}

export async function sendTelegramNotification(
  config: TelegramConfig,
  message: string
): Promise<void> {
  const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`;

  try {
    await axios.post(url, {
      chat_id: config.chatId,
      text: message,
      parse_mode: 'HTML'
    });

    console.log('✅ Telegram notification sent');
  } catch (error) {
    console.error('❌ Failed to send Telegram notification:', error);
    throw error;
  }
}

export function formatPriceMessage(
  currentPrice: number,
  previousPrice: number,
  change: number,
  changePercent: number
): string {
  const emoji = change >= 0 ? '📈' : '📉';
  const direction = change >= 0 ? '↑' : '↓';

  return `
${emoji} <b>Gold Price Alert</b>

💰 Current Price: $${currentPrice.toFixed(2)}
${direction} Change: ${change >= 0 ? '+' : ''}$${change.toFixed(2)} (${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)

⏰ ${new Date().toLocaleString('en-US', { timeZone: 'UTC' })}

---
<a href="https://github.com/HoneyKarina/gold-alert">Gold Alert</a> | Open Source
  `.trim();
}
