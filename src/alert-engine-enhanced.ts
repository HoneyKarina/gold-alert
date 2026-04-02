/**
 * 预警引擎 - 增强版
 * 支持多种预警规则、机器学习预测、智能分析和自定义规则
 */

import { PriceRecord } from './price-store.js';

export interface AlertRule {
  id: string;
  name: string;
  type: 'threshold' | 'percent' | 'trend' | 'volume' | 'time' | 'ml' | 'custom';
  value: number;
  direction: 'up' | 'down' | 'both';
  enabled: boolean;
  conditions?: AlertCondition[];
  actions?: AlertAction[];
  priority: number; // 1-10, 10为最高优先级
  cooldown?: number; // 冷却时间（秒）
}

export interface AlertCondition {
  field: 'price' | 'volume' | 'time' | 'trend' | 'volatility';
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'between';
  value: number | [number, number];
}

export interface AlertAction {
  type: 'notify' | 'log' | 'webhook' | 'email' | 'telegram' | 'feishu';
  config?: Record<string, any>;
}

export interface Alert {
  id: string;
  rule: AlertRule;
  currentPrice: PriceRecord;
  previousPrice: PriceRecord;
  message: string;
  severity: 'info' | 'warning' | 'critical' | 'urgent';
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface MarketTrend {
  direction: 'up' | 'down' | 'sideways';
  strength: number; // 0-1
  confidence: number; // 0-1
  volatility: number; // 标准差
  support?: number;
  resistance?: number;
}

export interface PredictiveAnalysis {
  nextHour: {
    predictedPrice: number;
    confidence: number;
    possibleRange: [number, number];
  };
  nextDay: {
    predictedPrice: number;
    confidence: number;
    possibleRange: [number, number];
  };
  trend: MarketTrend;
}

class MLAnalyzer {
  private priceHistory: PriceRecord[] = [];
  private model: any = null;
  
  constructor() {
    this.initializeModel();
  }
  
  private initializeModel() {
    // 简单的线性回归模型
    this.model = {
      weights: [0.5, 0.3, 0.2], // 时间权重、价格权重、波动权重
      bias: 0
    };
  }
  
  addPriceData(price: PriceRecord) {
    this.priceHistory.push(price);
    if (this.priceHistory.length > 1000) {
      this.priceHistory.shift(); // 保持最近1000个数据点
    }
  }
  
  predictNextPrice(): { price: number; confidence: number } {
    if (this.priceHistory.length < 10) {
      return { price: this.priceHistory[this.priceHistory.length - 1]?.price || 2000, confidence: 0 };
    }
    
    // 简单的移动平均预测
    const recentPrices = this.priceHistory.slice(-10);
    const avgPrice = recentPrices.reduce((sum, p) => sum + p.price, 0) / recentPrices.length;
    
    // 计算波动性
    const volatility = this.calculateVolatility(recentPrices);
    
    // 基于趋势预测
    const trend = this.calculateTrend(recentPrices);
    const predictedPrice = avgPrice * (1 + trend * 0.01);
    
    // 置信度基于数据量和稳定性
    const confidence = Math.max(0.1, 1 - (volatility / 100) * 0.5);
    
    return { 
      price: predictedPrice, 
      confidence 
    };
  }
  
  private calculateVolatility(prices: PriceRecord[]): number {
    if (prices.length < 2) return 0;
    
    const avgPrice = prices.reduce((sum, p) => sum + p.price, 0) / prices.length;
    const variance = prices.reduce((sum, p) => sum + Math.pow(p.price - avgPrice, 2), 0) / prices.length;
    return Math.sqrt(variance);
  }
  
  private calculateTrend(prices: PriceRecord[]): number {
    if (prices.length < 2) return 0;
    
    const first = prices[0];
    const last = prices[prices.length - 1];
    const change = (last.price - first.price) / first.price * 100;
    return change;
  }
}

class RuleEngine {
  private rules: AlertRule[] = [];
  private ruleCooldowns: Map<string, number> = new Map();
  private mlAnalyzer: MLAnalyzer;
  
  constructor() {
    this.mlAnalyzer = new MLAnalyzer();
    this.initializeDefaultRules();
  }
  
  private initializeDefaultRules() {
    this.rules = [
      {
        id: 'threshold-30',
        name: '绝对波动阈值 $30',
        type: 'threshold',
        value: 30,
        direction: 'both',
        enabled: true,
        priority: 7,
        cooldown: 3600, // 1小时冷却
        actions: [
          { type: 'notify', config: { channel: 'all' } }
        ]
      },
      {
        id: 'percent-1',
        name: '相对波动 1%',
        type: 'percent',
        value: 1,
        direction: 'both',
        enabled: true,
        priority: 8,
        cooldown: 3600,
        actions: [
          { type: 'notify', config: { channel: 'all' } }
        ]
      },
      {
        id: 'trend-change',
        name: '趋势突变检测',
        type: 'trend',
        value: 2,
        direction: 'both',
        enabled: true,
        priority: 9,
        conditions: [
          { field: 'trend', operator: 'gt', value: 2 },
          { field: 'volatility', operator: 'gt', value: 50 }
        ],
        actions: [
          { type: 'notify', config: { channel: 'feishu' } },
          { type: 'webhook', config: { url: process.env.WEBHOOK_URL } }
        ]
      },
      {
        id: 'high-volatility',
        name: '高波动率检测',
        type: 'volume',
        value: 100,
        direction: 'above',
        enabled: true,
        priority: 6,
        conditions: [
          { field: 'volatility', operator: 'gt', value: 80 }
        ],
        actions: [
          { type: 'notify', config: { channel: 'telegram' } }
        ]
      },
      {
        id: 'ml-prediction',
        name: '机器学习预测',
        type: 'ml',
        value: 5,
        direction: 'both',
        enabled: true,
        priority: 5,
        actions: [
          { type: 'log', config: { level: 'info' } }
        ]
      }
    ];
  }
  
  addRule(rule: AlertRule) {
    this.rules.push(rule);
    this.rules.sort((a, b) => b.priority - a.priority); // 按优先级排序
  }
  
  removeRule(id: string) {
    this.rules = this.rules.filter(rule => rule.id !== id);
  }
  
  updateRule(id: string, updates: Partial<AlertRule>) {
    const index = this.rules.findIndex(rule => rule.id === id);
    if (index !== -1) {
      this.rules[index] = { ...this.rules[index], ...updates };
    }
  }
  
  check(current: PriceRecord, previous: PriceRecord): Alert[] {
    const alerts: Alert[] = [];
    
    // 添加价格数据到ML分析器
    this.mlAnalyzer.addPriceData(current);
    
    for (const rule of this.rules) {
      if (!rule.enabled) continue;
      
      // 检查冷却时间
      const lastTriggered = this.ruleCooldowns.get(rule.id) || 0;
      const now = Date.now();
      if (rule.cooldown && (now - lastTriggered) < rule.cooldown * 1000) {
        continue;
      }
      
      const alert = this.evaluateRule(rule, current, previous);
      if (alert) {
        alerts.push(alert);
        this.ruleCooldowns.set(rule.id, now);
      }
    }
    
    return alerts;
  }
  
  private evaluateRule(rule: AlertRule, current: PriceRecord, previous: PriceRecord): Alert | null {
    let triggered = false;
    let severity: 'info' | 'warning' | 'critical' | 'urgent' = 'info';
    
    switch (rule.type) {
      case 'threshold':
        triggered = this.checkThreshold(rule, current, previous);
        severity = Math.abs(current.price - previous.price) >= rule.value * 2 ? 'critical' : 'warning';
        break;
        
      case 'percent':
        triggered = this.checkPercent(rule, current, previous);
        severity = Math.abs((current.price - previous.price) / previous.price * 100) >= rule.value * 2 ? 'critical' : 'warning';
        break;
        
      case 'trend':
        triggered = this.checkTrend(rule, current, previous);
        severity = 'warning';
        break;
        
      case 'ml':
        triggered = this.checkMLPrediction(rule, current, previous);
        severity = 'info';
        break;
        
      case 'volume':
        triggered = this.checkVolume(rule, current, previous);
        severity = 'critical';
        break;
    }
    
    // 检查方向
    if (triggered) {
      if (rule.direction === 'up' && current.price <= previous.price) triggered = false;
      if (rule.direction === 'down' && current.price >= previous.price) triggered = false;
    }
    
    // 检查附加条件
    if (triggered && rule.conditions) {
      triggered = this.checkConditions(rule.conditions, current, previous);
    }
    
    if (!triggered) return null;
    
    // 生成预警消息
    const alert = this.generateAlert(rule, current, previous, severity);
    
    // 执行动作
    this.executeActions(rule.actions || [], alert);
    
    return alert;
  }
  
  private checkThreshold(rule: AlertRule, current: PriceRecord, previous: PriceRecord): boolean {
    return Math.abs(current.price - previous.price) >= rule.value;
  }
  
  private checkPercent(rule: AlertRule, current: PriceRecord, previous: PriceRecord): boolean {
    const percentChange = Math.abs((current.price - previous.price) / previous.price * 100);
    return percentChange >= rule.value;
  }
  
  private checkTrend(rule: AlertRule, current: PriceRecord, previous: PriceRecord): boolean {
    // 简单的趋势检测
    const trend = this.mlAnalyzer.predictNextPrice();
    return Math.abs(trend.price - current.price) / current.price * 100 >= rule.value;
  }
  
  private checkMLPrediction(rule: AlertRule, current: PriceRecord, previous: PriceRecord): boolean {
    const prediction = this.mlAnalyzer.predictNextPrice();
    return Math.abs(prediction.price - current.price) / current.price * 100 >= rule.value;
  }
  
  private checkVolume(rule: AlertRule, current: PriceRecord, previous: PriceRecord): boolean {
    // 简单的高波动检测
    const volatility = this.calculateVolatility([current, previous]);
    return volatility >= rule.value;
  }
  
  private checkConditions(conditions: AlertCondition[], current: PriceRecord, previous: PriceRecord): boolean {
    for (const condition of conditions) {
      let value: number;
      
      switch (condition.field) {
        case 'price':
          value = current.price;
          break;
        case 'volume':
          value = Math.abs(current.price - previous.price);
          break;
        case 'volatility':
          value = this.calculateVolatility([current, previous]);
          break;
        default:
          continue;
      }
      
      switch (condition.operator) {
        case 'gt':
          if (!(value > condition.value as number)) return false;
          break;
        case 'lt':
          if (!(value < condition.value as number)) return false;
          break;
        case 'gte':
          if (!(value >= condition.value as number)) return false;
          break;
        case 'lte':
          if (!(value <= condition.value as number)) return false;
          break;
        case 'between':
          const range = condition.value as [number, number];
          if (value < range[0] || value > range[1]) return false;
          break;
      }
    }
    
    return true;
  }
  
  private calculateVolatility(prices: PriceRecord[]): number {
    if (prices.length < 2) return 0;
    
    const avgPrice = prices.reduce((sum, p) => sum + p.price, 0) / prices.length;
    const variance = prices.reduce((sum, p) => sum + Math.pow(p.price - avgPrice, 2), 0) / prices.length;
    return Math.sqrt(variance);
  }
  
  private generateAlert(rule: AlertRule, current: PriceRecord, previous: PriceRecord, severity: string): Alert {
    const priceDiff = current.price - previous.price;
    const percentDiff = (priceDiff / previous.price) * 100;
    const direction = priceDiff > 0 ? '📈 上涨' : '📉 下跌';
    const change = priceDiff > 0 ? `+${priceDiff.toFixed(2)}` : priceDiff.toFixed(2);
    
    const message = `🚨 [${severity.toUpperCase()}] ${rule.name}

${direction} $${Math.abs(priceDiff).toFixed(2)} (${percentDiff > 0 ? '+' : ''}${percentDiff.toFixed(2)}%)

当前价格: $${current.price.toFixed(2)}
前一价格: $${previous.price.toFixed(2)}

时间: ${current.timestamp.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}
来源: ${current.source}

规则ID: ${rule.id}
优先级: ${rule.priority}/10

${rule.type === 'ml' ? '🤖 AI预测已触发' : '📊 传统阈值检测'}`;

    return {
      id: `alert-${Date.now()}-${rule.id}`,
      rule,
      currentPrice: current,
      previousPrice: previous,
      message,
      severity: severity as any,
      timestamp: new Date(),
      metadata: {
        priceDiff,
        percentDiff,
        volatility: this.calculateVolatility([current, previous])
      }
    };
  }
  
  private executeActions(actions: AlertAction[], alert: Alert) {
    for (const action of actions) {
      switch (action.type) {
        case 'notify':
          console.log(`📢 通知: ${alert.message}`);
          break;
        case 'log':
          console.log(`📝 日志: [${alert.severity}] ${alert.message}`);
          break;
        case 'webhook':
          if (action.config?.url) {
            this.sendWebhook(action.config.url, alert);
          }
          break;
      }
    }
  }
  
  private async sendWebhook(url: string, alert: Alert) {
    try {
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          alert: alert.message,
          timestamp: alert.timestamp,
          severity: alert.severity,
          metadata: alert.metadata
        })
      });
      console.log(`✅ Webhook发送成功: ${url}`);
    } catch (error) {
      console.error(`❌ Webhook发送失败: ${error}`);
    }
  }
  
  getRules(): AlertRule[] {
    return [...this.rules];
  }
  
  getPredictiveAnalysis(): PredictiveAnalysis {
    const prediction = this.mlAnalyzer.predictNextPrice();
    const recentPrices = this.priceHistory.slice(-20);
    
    return {
      nextHour: {
        predictedPrice: prediction.price,
        confidence: prediction.confidence,
        possibleRange: [
          prediction.price * (1 - 0.02),
          prediction.price * (1 + 0.02)
        ]
      },
      nextDay: {
        predictedPrice: prediction.price * 1.01, // 简单的增长预测
        confidence: prediction.confidence * 0.7,
        possibleRange: [
          prediction.price * 0.95,
          prediction.price * 1.05
        ]
      },
      trend: this.analyzeTrend(recentPrices)
    };
  }
  
  private analyzeTrend(prices: PriceRecord[]): MarketTrend {
    if (prices.length < 3) {
      return {
        direction: 'sideways',
        strength: 0,
        confidence: 0,
        volatility: 0
      };
    }
    
    const first = prices[0];
    const last = prices[prices.length - 1];
    const change = (last.price - first.price) / first.price * 100;
    const volatility = this.calculateVolatility(prices);
    
    let direction: 'up' | 'down' | 'sideways';
    if (change > 1) direction = 'up';
    else if (change < -1) direction = 'down';
    else direction = 'sideways';
    
    const strength = Math.abs(change) / 10; // 标准化到0-1
    const confidence = Math.max(0.1, 1 - (volatility / 100) * 0.5);
    
    return {
      direction,
      strength: Math.min(strength, 1),
      confidence,
      volatility
    };
  }
}

export class AlertEngine {
  private ruleEngine: RuleEngine;
  
  constructor(defaultRules?: AlertRule[]) {
    this.ruleEngine = new RuleEngine();
    if (defaultRules) {
      defaultRules.forEach(rule => this.ruleEngine.addRule(rule));
    }
  }
  
  addRule(rule: AlertRule) {
    this.ruleEngine.addRule(rule);
  }
  
  removeRule(id: string) {
    this.ruleEngine.removeRule(id);
  }
  
  check(current: PriceRecord, previous: PriceRecord): Alert[] {
    return this.ruleEngine.check(current, previous);
  }
  
  getRules(): AlertRule[] {
    return this.ruleEngine.getRules();
  }
  
  getPredictiveAnalysis(): PredictiveAnalysis {
    return this.ruleEngine.getPredictiveAnalysis();
  }
}