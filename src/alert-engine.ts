/**
 * 预警引擎
 * 检测金价异常波动
 */

import { PriceRecord } from './price-store.js';

export interface AlertRule {
  type: 'threshold' | 'percent' | 'trend';
  value: number;
  direction: 'up' | 'down' | 'both';
  enabled: boolean;
}

export interface Alert {
  rule: AlertRule;
  currentPrice: PriceRecord;
  previousPrice: PriceRecord;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: Date;
}

export class AlertEngine {
  private rules: AlertRule[] = [];

  constructor(defaultRules?: AlertRule[]) {
    if (defaultRules) {
      this.rules = defaultRules;
    } else {
      // 默认规则
      this.rules = [
        {
          type: 'threshold',
          value: 50, // 涨跌超过 $50
          direction: 'both',
          enabled: true,
        },
        {
          type: 'percent',
          value: 1, // 涨跌超过 1%
          direction: 'both',
          enabled: true,
        },
      ];
    }
  }

  addRule(rule: AlertRule) {
    this.rules.push(rule);
  }

  removeRule(index: number) {
    this.rules.splice(index, 1);
  }

  check(current: PriceRecord, previous: PriceRecord): Alert[] {
    const alerts: Alert[] = [];

    for (const rule of this.rules) {
      if (!rule.enabled) continue;

      const alert = this.checkRule(rule, current, previous);
      if (alert) {
        alerts.push(alert);
      }
    }

    return alerts;
  }

  private checkRule(
    rule: AlertRule,
    current: PriceRecord,
    previous: PriceRecord
  ): Alert | null {
    const priceDiff = current.price - previous.price;
    const percentDiff = (priceDiff / previous.price) * 100;

    let triggered = false;
    let severity: 'info' | 'warning' | 'critical' = 'info';

    switch (rule.type) {
      case 'threshold':
        if (Math.abs(priceDiff) >= rule.value) {
          triggered = true;
          severity = Math.abs(priceDiff) >= rule.value * 2 ? 'critical' : 'warning';
        }
        break;

      case 'percent':
        if (Math.abs(percentDiff) >= rule.value) {
          triggered = true;
          severity = Math.abs(percentDiff) >= rule.value * 2 ? 'critical' : 'warning';
        }
        break;

      case 'trend':
        // TODO: 实现趋势分析
        break;
    }

    // 检查方向
    if (triggered) {
      if (rule.direction === 'up' && priceDiff < 0) triggered = false;
      if (rule.direction === 'down' && priceDiff > 0) triggered = false;
    }

    if (!triggered) return null;

    const direction = priceDiff > 0 ? '📈 上涨' : '📉 下跌';
    const change = priceDiff > 0 ? `+${priceDiff.toFixed(2)}` : priceDiff.toFixed(2);

    const message = `🚨 金价预警！

${direction} $${Math.abs(priceDiff).toFixed(2)} (${percentDiff > 0 ? '+' : ''}${percentDiff.toFixed(2)}%)

当前价格: $${current.price.toFixed(2)}
前一价格: $${previous.price.toFixed(2)}

时间: ${current.timestamp.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}
来源: ${current.source}

预警类型: ${rule.type === 'threshold' ? '绝对值阈值' : '百分比阈值'}
严重程度: ${severity === 'critical' ? '🔴 严重' : severity === 'warning' ? '🟡 警告' : '🟢 提示'}`;

    return {
      rule,
      currentPrice: current,
      previousPrice: previous,
      message,
      severity,
      timestamp: new Date(),
    };
  }

  getRules(): AlertRule[] {
    return [...this.rules];
  }
}
