#!/usr/bin/env npx tsx

/**
 * 简单测试 - 验证金价获取功能
 */

import * as fs from 'fs';

async function fetchGoldPrice() {
  try {
    const response = await fetch('https://www.kitco.com/price/precious-metals/gold', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const html = await response.text();

    // 从 HTML 中提取金价数据
    const priceMatch = html.match(/"symbol":"AU"[^}]*"mid":(\d+\.?\d*)/);
    const changeMatch = html.match(/"symbol":"AU"[^}]*"change":(-?\d+\.?\d*)/);
    const percentMatch = html.match(/"symbol":"AU"[^}]*"changePercentage":(-?\d+\.?\d*)/);

    if (!priceMatch) {
      throw new Error('无法从页面提取金价数据');
    }

    return {
      price: parseFloat(priceMatch[1]),
      change: parseFloat(changeMatch?.[1] || '0'),
      changePercent: parseFloat(percentMatch?.[1] || '0'),
      timestamp: new Date(),
      source: 'Kitco',
    };
  } catch (error) {
    throw new Error(`获取金价失败: ${error}`);
  }
}

console.log('🧪 测试金价获取功能...\n');

fetchGoldPrice()
  .then(price => {
    console.log('✅ 获取成功！\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`💰 当前金价: $${price.price.toFixed(2)} USD/盎司`);
    console.log(`📈 涨跌: ${price.change >= 0 ? '+' : ''}${price.change.toFixed(2)} (${price.changePercent >= 0 ? '+' : ''}${price.changePercent.toFixed(2)}%)`);
    console.log(`⏰ 时间: ${price.timestamp.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`);
    console.log(`📡 来源: ${price.source}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  })
  .catch(error => {
    console.error('❌ 获取失败:', error);
    process.exit(1);
  });
