// 简单测试脚本
import { fetchGoldPrice } from './src/price-fetcher.js';

console.log('测试金价获取...');

fetchGoldPrice()
  .then(price => {
    console.log('✅ 获取成功！');
    console.log(`💰 当前金价: $${price.price.toFixed(2)}`);
    console.log(`📈 涨跌: ${price.change >= 0 ? '+' : ''}${price.change.toFixed(2)} (${price.changePercent >= 0 ? '+' : ''}${price.changePercent.toFixed(2)}%)`);
    console.log(`⏰ 时间: ${price.timestamp}`);
    console.log(`📡 来源: ${price.source}`);
  })
  .catch(error => {
    console.error('❌ 获取失败:', error);
    process.exit(1);
  });
