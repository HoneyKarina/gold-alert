/**
 * Gold Alert - 智能金价预警系统
 * 主入口
 */

import cron from 'node-cron';
import { fetchGoldPrice } from './price-fetcher.js';
import { PriceStore } from './price-store.js';
import { AlertEngine } from './alert-engine.js';
import { Notifier, NotifyChannel } from './notifier.js';

class GoldAlertSystem {
  private store: PriceStore;
  private alertEngine: AlertEngine;
  private notifier: Notifier;
  private isRunning = false;

  constructor() {
    this.store = new PriceStore();

    // 预警规则：涨跌超过 $30 或 0.7%
    this.alertEngine = new AlertEngine([
      {
        type: 'threshold',
        value: 30,
        direction: 'both',
        enabled: true,
      },
      {
        type: 'percent',
        value: 0.7,
        direction: 'both',
        enabled: true,
      },
    ]);

    // 通知配置（发送给 Chris）
    this.notifier = new Notifier({
      channel: (process.env.NOTIFY_CHANNEL as NotifyChannel) || 'console',
      feishuUserId: process.env.FEISHU_USER_ID || 'ou_7906034b55b5ad3f2d2be2043acd312a',
      feishuWebhook: process.env.FEISHU_WEBHOOK,
    });
  }

  async start() {
    console.log('🚀 Gold Alert 系统启动...');
    console.log('💰 监控对象: 国际金价 (XAU/USD)');
    console.log('⏰ 检查间隔: 每小时');
    console.log('📢 通知渠道: 飞书');
    console.log('');

    // 加载历史数据
    await this.store.load();
    const history = await this.store.getLatestPrices(1);
    console.log(`📊 已加载历史数据`);

    // 立即执行一次
    await this.check();

    // 定时任务：每小时执行
    cron.schedule('0 * * * *', async () => {
      await this.check();
    });

    console.log('✅ 定时任务已启动');
    console.log(' 按 Ctrl+C 停止');
  }

  private async check() {
    if (this.isRunning) {
      console.log('⏳ 上次检查还在进行中，跳过');
      return;
    }

    this.isRunning = true;

    try {
      console.log(`\n[${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}] 开始检查金价...`);

      // 1. 获取最新价格
      const price = await fetchGoldPrice();
      console.log(`💰 当前金价: $${price.price.toFixed(2)} (${price.change >= 0 ? '+' : ''}${price.change.toFixed(2)})`);

      // 2. 保存价格
      const record = await this.store.addPrice(price);
      console.log(`💾 价格已保存 (ID: ${record.id})`);

      // 3. 获取上一次价格并检测预警
      const prices = await this.store.getLatestPrices(2);
      if (prices.length >= 2) {
        const previous = prices[0];
        const current = prices[1];

        const alerts = this.alertEngine.check(current, previous);

        if (alerts.length > 0) {
          console.log(`🚨 检测到 ${alerts.length} 个预警！`);

          for (const alert of alerts) {
            await this.notifier.send(alert);
          }
        } else {
          console.log('✅ 金价波动正常，无预警');
        }
      } else {
        console.log('📝 数据不足，跳过预警检测（需要至少 2 条记录）');
      }
    } catch (error) {
      console.error('❌ 检查失败:', error);
    } finally {
      this.isRunning = false;
    }
  }
}

// 启动系统
const system = new GoldAlertSystem();
system.start().catch(console.error);
