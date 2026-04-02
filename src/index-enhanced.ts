/**
 * Gold Alert - 智能金价预警系统
 * 增强版主入口 - 添加了API服务器、更好的日志记录和错误处理
 */

import cron from 'node-cron';
import { fetchGoldPrice } from './price-fetcher.js';
import { PriceStore } from './price-store.js';
import { AlertEngine } from './alert-engine.js';
import { Notifier, NotifyChannel } from './notifier.js';
import { createServer } from './server.js';

class GoldAlertSystem {
  private store: PriceStore;
  private alertEngine: AlertEngine;
  private notifier: Notifier;
  private isRunning = false;
  private startTime: Date;
  private errorCount = 0;
  private maxErrors = 10;

  constructor() {
    this.startTime = new Date();
    this.store = new PriceStore();

    // 增强的预警规则：多种触发条件
    this.alertEngine = new AlertEngine([
      {
        type: 'threshold',
        value: 30,
        direction: 'both',
        enabled: true,
        name: '绝对波动阈值',
      },
      {
        type: 'percent',
        value: 0.7,
        direction: 'both',
        enabled: true,
        name: '相对波动百分比',
      },
      {
        type: 'volume',
        value: 1000,
        direction: 'above',
        enabled: true,
        name: '高交易量',
      },
      {
        type: 'time',
        value: 24,
        direction: 'within',
        enabled: true,
        name: '24小时大波动',
      }
    ]);

    // 通知配置
    this.notifier = new Notifier({
      channel: (process.env.NOTIFY_CHANNEL as NotifyChannel) || 'console',
      feishuUserId: process.env.FEISHU_USER_ID || 'ou_7906034b55b5ad3f2d2be2043acd312a',
      feishuWebhook: process.env.FEISHU_WEBHOOK,
      telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
      telegramChatId: process.env.TELEGRAM_CHAT_ID,
      email: {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      },
    });

    // 设置错误处理
    this.setupErrorHandling();
  }

  private setupErrorHandling() {
    process.on('uncaughtException', (error) => {
      console.error('💥 未捕获的异常:', error);
      this.errorCount++;
      if (this.errorCount >= this.maxErrors) {
        console.error('❌ 错误次数过多，系统将停止');
        this.shutdown();
      }
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('💔 未处理的Promise拒绝:', reason);
      this.errorCount++;
      if (this.errorCount >= this.maxErrors) {
        console.error('❌ 错误次数过多，系统将停止');
        this.shutdown();
      }
    });
  }

  async start() {
    console.log('🚀 Gold Alert 增强版系统启动...');
    console.log('💰 监控对象: 国际金价 (XAU/USD)');
    console.log('⏰ 检查间隔: 每小时');
    console.log('📢 通知渠道: 飞书/Telegram/Email');
    console.log('🌐 API服务器: http://localhost:3000');
    console.log('');

    // 显示系统信息
    this.showSystemInfo();

    // 加载历史数据
    await this.store.load();
    const history = await this.store.getLatestPrices(10);
    console.log(`📊 已加载 ${history.length} 条历史数据`);

    // 立即执行一次
    await this.check();

    // 定时任务：每小时执行
    const job = cron.schedule('0 * * * *', async () => {
      await this.check();
    }, {
      scheduled: true,
      timezone: 'Asia/Shanghai'
    });

    // 启动API服务器
    const server = createServer(this.store, this.alertEngine);
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log(`✅ API服务器启动成功，端口: ${PORT}`);
      console.log(`📡 访问地址: http://localhost:${PORT}`);
    });

    process.on('SIGINT', () => {
      console.log('\n🛑 收到停止信号...');
      this.shutdown();
      job.stop();
      server.close(() => {
        console.log('✅ 系统已完全停止');
        process.exit(0);
      });
    });
  }

  private showSystemInfo() {
    const uptime = Math.floor((Date.now() - this.startTime.getTime()) / 1000);
    console.log('🔧 系统配置:');
    console.log(`   - 启动时间: ${this.startTime.toLocaleString('zh-CN')}`);
    console.log(`   - 运行时长: ${this.formatUptime(uptime)}`);
    console.log(`   - 最大错误数: ${this.maxErrors}`);
    console.log(`   - 当前错误数: ${this.errorCount}`);
    console.log(`   - 时区: Asia/Shanghai`);
    console.log('');
  }

  private formatUptime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  }

  private async check() {
    if (this.isRunning) {
      console.log('⏳ 上次检查还在进行中，跳过');
      return;
    }

    this.isRunning = true;

    try {
      const timestamp = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
      console.log(`\n[${timestamp}] 🔄 开始检查金价...`);

      // 1. 获取最新价格
      console.log('📡 正在获取金价数据...');
      const price = await fetchGoldPrice();
      console.log(`💰 当前金价: $${price.price.toFixed(2)} (${price.change >= 0 ? '+' : ''}${price.change.toFixed(2)})`);

      // 2. 保存价格
      const record = await this.store.addPrice(price);
      console.log(`💾 价格已保存 (ID: ${record.id}, 时间: ${new Date(record.timestamp).toLocaleString('zh-CN')})`);

      // 3. 获取上一次价格并检测预警
      const prices = await this.store.getLatestPrices(2);
      if (prices.length >= 2) {
        const previous = prices[0];
        const current = prices[1];

        // 计算更多指标
        const priceChange = current.price - previous.price;
        const percentChange = (priceChange / previous.price) * 100;
        
        console.log(`📊 波动分析: 绝对变化 $${priceChange.toFixed(2)}, 百分比变化 ${percentChange.toFixed(2)}%`);

        const alerts = this.alertEngine.check(current, previous);

        if (alerts.length > 0) {
          console.log(`🚨 检测到 ${alerts.length} 个预警！`);

          for (const alert of alerts) {
            console.log(`📤 发送预警: ${alert.message}`);
            await this.notifier.send(alert);
          }
        } else {
          console.log('✅ 金价波动正常，无预警');
        }
      } else {
        console.log('📝 数据不足，跳过预警检测（需要至少 2 条记录）');
      }

      // 4. 生成系统状态报告
      this.generateStatusReport();

    } catch (error) {
      this.errorCount++;
      console.error('❌ 检查失败:', error);
      
      // 发送错误通知
      if (this.errorCount <= this.maxErrors) {
        await this.notifier.send({
          type: 'error',
          message: `Gold Alert系统错误: ${error}`,
          timestamp: new Date(),
          severity: 'high'
        });
      }
    } finally {
      this.isRunning = false;
    }
  }

  private async generateStatusReport() {
    try {
      const stats = await this.store.getStatistics();
      const timestamp = new Date().toLocaleString('zh-CN');
      
      console.log(`\n📈 系统状态报告 (${timestamp}):`);
      console.log(`   - 总记录数: ${stats.totalRecords}`);
      console.log(`   - 最高价: $${stats.maxPrice.toFixed(2)}`);
      console.log(`   - 最低价: $${stats.minPrice.toFixed(2)}`);
      console.log(`   - 平均价: $${stats.avgPrice.toFixed(2)}`);
      console.log(`   - 错误次数: ${this.errorCount}`);
      console.log('');
    } catch (error) {
      console.error('❌ 生成状态报告失败:', error);
    }
  }

  async shutdown() {
    console.log('🛑 正在关闭系统...');
    
    // 保存最后的统计数据
    try {
      await this.store.save();
      console.log('💾 数据已保存');
    } catch (error) {
      console.error('❌ 保存数据失败:', error);
    }

    console.log('👋 系统已安全关闭');
  }
}

// 启动系统
const system = new GoldAlertSystem();
system.start().catch(console.error);