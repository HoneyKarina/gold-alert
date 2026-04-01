# 掘金文章 - 完整版

## 标题选项：

**版本 A**（推荐）：
> 开源了一个金价监控工具，想试试 GitHub Sponsors

**版本 B**：
> 做了个 Gold Alert：实时金价预警工具（开源免费）

**版本 C**：
> 从 0 到 1：我如何开发一个金价预警工具

---

## 正文（版本 C - 技术向）

### 前言

最近黄金价格波动很大，经常错过最佳买入/卖出时机。作为一个开发者，我的第一反应是：**能不能写个程序自动监控？**

于是就有了 **Gold Alert**。

本文分享一下我从想法到上线的完整过程，希望对想做独立产品的朋友有帮助。

---

## 一、需求分析

一个金价预警工具，核心功能其实很简单：

1. **获取金价** - 定时从某个数据源拉取价格
2. **判断预警** - 根据规则判断是否需要提醒
3. **发送通知** - 通过某个渠道告诉我

简单吧？但要把这些做好，还是需要一些思考的。

---

## 二、技术选型

### 2.1 数据源

找了几个金价数据源：

| 数据源 | 优点 | 缺点 |
|--------|------|------|
| **Kitco** | 国际知名，数据可靠 | 解析复杂 |
| Gold.org | 官方数据 | 更新慢 |
| 交易所 API | 实时 | 可能收费 |

最终选择 **Kitco**，免费、稳定、数据准确。

### 2.2 技术栈

```json
{
  "runtime": "Node.js 18+",
  "language": "TypeScript",
  "framework": "Express",
  "http": "Axios"
}
```

为什么选 Node.js？
- 熟悉，开发快
- 生态好，包多
- 部署简单

---

## 三、核心实现

### 3.1 获取金价

```typescript
// src/price-fetcher.ts
import axios from 'axios';

export async function fetchGoldPrice(): Promise<PriceData> {
  const response = await axios.get(
    'https://www.kitconet.com/charts/plots/cgiData.txt'
  );
  
  // 解析固定宽度文本
  const lines = response.data.split('\n');
  const priceLine = lines.find((line: string) => 
    line.includes('GOLD')
  );
  
  // 提取价格...
  return {
    price: extractPrice(priceLine),
    timestamp: new Date(),
    source: 'Kitco'
  };
}
```

看起来简单，但实际有坑：
- 数据格式复杂（固定宽度文本）
- 需要缓存避免频繁请求
- 错误处理很重要

### 3.2 预警引擎

```typescript
// src/alert-engine.ts
export function checkAlerts(
  currentPrice: number,
  previousPrice: number,
  rules: AlertRule[]
): Alert[] {
  const alerts: Alert[] = [];
  
  for (const rule of rules) {
    const change = currentPrice - previousPrice;
    const changePercent = (change / previousPrice) * 100;
    
    // 绝对值阈值
    if (rule.type === 'threshold') {
      if (Math.abs(change) >= rule.value) {
        alerts.push({
          rule,
          message: `金价变动 $${Math.abs(change).toFixed(2)}`
        });
      }
    }
    
    // 百分比阈值
    if (rule.type === 'percent') {
      if (Math.abs(changePercent) >= rule.value) {
        alerts.push({
          rule,
          message: `金价变动 ${changePercent.toFixed(2)}%`
        });
      }
    }
  }
  
  return alerts;
}
```

关键是**灵活的规则配置**，让用户可以自定义。

### 3.3 通知系统

我选择了 **飞书**，因为：
- 有现成的 Webhook API
- 私聊机器人体验好
- 支持富文本消息

```typescript
// src/notifiers/feishu.ts
export async function sendFeishuNotification(
  message: string
): Promise<void> {
  await axios.post(FEISHU_WEBHOOK, {
    msg_type: 'text',
    content: { text: message }
  });
}
```

### 3.4 Web 界面

用 Express + 静态文件：

```typescript
// src/server.ts
import express from 'express';

const app = express();

// 静态文件
app.use(express.static('public'));

// API
app.get('/api/price', async (req, res) => {
  const price = await fetchGoldPrice();
  res.json(price);
});

app.listen(3000);
```

---

## 四、遇到的坑

### 4.1 数据源不稳定

Kitco 偶尔会超时，所以：
- 添加了缓存（5分钟有效）
- 实现了重试机制（3次）
- 记录了历史数据

```typescript
const cache = new Map<string, CachedData>();

async function fetchWithCache(): Promise<PriceData> {
  const cached = cache.get('gold');
  if (cached && !isExpired(cached)) {
    return cached.data;
  }
  
  // 重试逻辑
  for (let i = 0; i < 3; i++) {
    try {
      const data = await fetchGoldPrice();
      cache.set('gold', { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      if (i === 2) throw error;
      await sleep(1000 * (i + 1));
    }
  }
}
```

### 4.2 时区问题

金价是国际市场，有夏令时：
- 统一用 UTC 时间存储
- 显示时转换为用户时区
- 使用 dayjs 处理

### 4.3 并发请求

如果多个用户同时请求：
- 使用单例模式避免重复请求
- 缓存有效期内的数据直接返回
- 添加请求队列

---

## 五、项目结构

```
gold-alert/
├── src/
│   ├── price-fetcher.ts    # 获取金价
│   ├── alert-engine.ts     # 预警引擎
│   ├── notifiers/          # 通知系统
│   │   ├── feishu.ts
│   │   └── webhook.ts
│   ├── server.ts           # Web 服务器
│   └── index.ts            # 主入口
├── public/                 # Web 界面
│   └── index.html
├── .env.example           # 配置模板
├── README.md              # 文档
└── package.json
```

---

## 六、开源

项目已在 GitHub 开源：
https://github.com/HoneyKarina/gold-alert

**MIT 协议**，欢迎：
- ⭐ Star
- 🍴 Fork
- 💖 Sponsor

---

## 七、经验总结

### 7.1 先做最小可用版本

不要一开始就追求完美：
- 第一版只有基本功能
- 先上线，再迭代
- 用户反馈比猜测重要

### 7.2 选熟悉的技术

快速迭代最重要：
- 不用最新框架
- 选最熟悉的
- 遇到问题容易解决

### 7.3 开源分享

帮助他人，也帮助自己：
- 获取用户反馈
- 建立个人品牌
- 可能获得赞助

### 7.4 持续迭代

根据反馈改进：
- 添加用户要求的功能
- 修复发现的问题
- 优化用户体验

---

## 八、下一步

计划添加的功能：
- [ ] Email 通知
- [ ] Telegram Bot
- [ ] Docker 部署
- [ ] 价格预测（AI）
- [ ] 多贵金属支持（白银、铂金）

---

## 九、最后

如果你也想做独立产品，我的建议：

1. **从自己的需求出发** - 自己想要的东西最有动力做
2. **快速上线** - 完成比完美重要
3. **开源分享** - 获取反馈，建立影响力
4. **持续迭代** - 根据用户反馈改进

希望这篇文章对你有帮助！

**GitHub**: https://github.com/HoneyKarina/gold-alert

**联系方式**: GitHub Issues

---

*如果觉得有用，欢迎 Star ⭐ 或者 Sponsor 💖*

---

## 标签

`Node.js` `TypeScript` `开源` `金价` `监控` `预警` `工具` `独立开发`
