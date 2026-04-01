/**
 * 通知模块
 * 支持多种通知渠道
 */

import { Alert } from './alert-engine.js';

export type NotifyChannel = 'feishu' | 'email' | 'webhook' | 'console';

export interface NotifierConfig {
  channel: NotifyChannel;
  feishuWebhook?: string;
  feishuUserId?: string;
  emailTo?: string;
  webhookUrl?: string;
}

export class Notifier {
  private config: NotifierConfig;

  constructor(config: NotifierConfig) {
    this.config = config;
  }

  async send(alert: Alert): Promise<boolean> {
    switch (this.config.channel) {
      case 'feishu':
        return await this.sendToFeishu(alert);
      case 'email':
        return await this.sendToEmail(alert);
      case 'webhook':
        return await this.sendToWebhook(alert);
      case 'console':
      default:
        return this.sendToConsole(alert);
    }
  }

  private async sendToFeishu(alert: Alert): Promise<boolean> {
    if (!this.config.feishuUserId && !this.config.feishuWebhook) {
      console.error('Feishu 配置不完整');
      return false;
    }

    try {
      // 使用 openclaw message 命令发送
      const { execSync } = await import('child_process');

      const message = alert.message.replace(/"/g, '\\"');

      if (this.config.feishuUserId) {
        const cmd = `openclaw message send --channel feishu --target "user:${this.config.feishuUserId}" --message "${message}"`;
        execSync(cmd, { encoding: 'utf-8' });
      } else if (this.config.feishuWebhook) {
        // 使用 webhook
        const response = await fetch(this.config.feishuWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            msg_type: 'text',
            content: { text: alert.message },
          }),
        });

        if (!response.ok) {
          throw new Error(`发送失败: ${response.status}`);
        }
      }

      console.log(`✅ 预警已发送到飞书 (${alert.severity})`);
      return true;
    } catch (error) {
      console.error(`❌ 飞书发送失败: ${error}`);
      return false;
    }
  }

  private async sendToEmail(alert: Alert): Promise<boolean> {
    // TODO: 实现邮件发送
    console.log(`📧 邮件通知（待实现）: ${alert.message}`);
    return false;
  }

  private async sendToWebhook(alert: Alert): Promise<boolean> {
    if (!this.config.webhookUrl) {
      console.error('Webhook URL 未配置');
      return false;
    }

    try {
      const response = await fetch(this.config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alert),
      });

      if (!response.ok) {
        throw new Error(`发送失败: ${response.status}`);
      }

      console.log(`✅ 预警已发送到 Webhook (${alert.severity})`);
      return true;
    } catch (error) {
      console.error(`❌ Webhook 发送失败: ${error}`);
      return false;
    }
  }

  private sendToConsole(alert: Alert): boolean {
    console.log('\n' + '='.repeat(50));
    console.log(alert.message);
    console.log('='.repeat(50) + '\n');
    return true;
  }
}
