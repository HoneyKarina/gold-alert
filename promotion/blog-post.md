# 从 0 到 1：我如何开发一个金价预警工具

> 这是一个关于如何快速开发一个实用工具的故事，希望对你有帮助。

## 为什么做这个工具？

最近黄金价格波动很大，经常错过最佳买入/卖出时机。作为一个开发者，我的第一反应是：**能不能写个程序自动监控？**

于是就有了 **Gold Alert**。

## 需求分析

一个金价预警工具，核心功能其实很简单：

1. **获取金价** - 定时从某个数据源拉取价格
2. **判断预警** - 根据规则判断是否需要提醒
3. **发送通知** - 通过某个渠道告诉我

简单吧？但要把这些做好，还是需要一些思考的。

## 技术选型

### 数据源

找了几个金价数据源：
- **Kitco** - 国际知名，数据可靠
- **Gold.org** - 官方数据，更新慢
- **交易所 API** - 实时但可能收费

最终选择 **Kitco**，免费、稳定、数据准确。

### 技术栈

- **Node.js** - 熟悉，生态好
- **TypeScript** - 类型安全
- **Express** - API 服务器
- **Axios** - HTTP 请求

## 核心实现

### 1. 获取金价

```typescript
// price-fetcher.ts
import axios from 'axios';

export async function fetchGoldPrice(): Promise<number> {
  const response = await axios.get('https://www.kitconet.com/charts/plots/cgiData.txt');
  const data = response.data;
  
  // 解析数据...
  return price;
}
```

看起来简单，但实际有坑：
- 数据格式复杂（固定宽度文本）
- 需要缓存避免频繁请求
- 错误处理很重要

### 2. 预警引擎

```typescript
// alert-engine.ts
export function checkAlerts(currentPrice: number, previousPrice: number): Alert[] {
  const alerts: Alert[] = [];
  
  // 检查绝对值阈值
  if (Math.abs(currentPrice - previousPrice) >= THRESHOLD) {
    alerts.push({
      type: 'threshold',
      message: `金价变动 $${Math.abs(currentPrice - previousPrice).toFixed(2)}`
    });
  }
  
  // 检查百分比阈值
  const percentChange = ((currentPrice - previousPrice) / previousPrice) * 100;
  if (Math.abs(percentChange) >= PERCENT_THRESHOLD) {
    alerts.push({
      type: 'percent',
      message: `金价变动 ${percentChange.toFixed(2)}%`
    });
  }
  
  return alerts;
}
```

关键是**灵活的规则配置**，让用户可以自定义。

### 3. 通知系统

我选择了 **飞书**，因为：
- 有现成的 Webhook API
- 私聊机器人体验好
- 支持富文本消息

```typescript
// notifier.ts
export async function sendNotification(message: string): Promise<void> {
  await axios.post(FEISHU_WEBHOOK, {
    msg_type: 'text',
    content: {
      text: message
    }
  });
}
```

### 4. Web 界面

用 Express + 静态文件，简单高效：

```typescript
// server.ts
app.use(express.static('public'));
app.get('/api/price', async (req, res) => {
  const price = await fetchGoldPrice();
  res.json({ price });
});
```

## 遇到的坑

### 1. 数据源不稳定

Kitco 偶尔会超时，所以：
- 添加了缓存
- 实现了重试机制
- 记录了历史数据

### 2. 时区问题

金价是国际市场，有夏令时：
- 统一用 UTC 时间
- 显示时转换为用户时区

### 3. 并发请求

如果多个用户同时请求：
- 使用单例模式避免重复请求
- 缓存有效期内的数据直接返回

## 项目结构

```
gold-alert/
├── src/
│   ├── price-fetcher.ts    # 获取金价
│   ├── alert-engine.ts     # 预警引擎
│   ├── notifier.ts         # 通知系统
│   ├── server.ts           # Web 服务器
│   └── index.ts            # 主入口
├── public/                 # Web 界面
├── .env.example           # 配置模板
├── README.md              # 文档
└── package.json
```

## 开源

项目已在 GitHub 开源：https://github.com/HoneyKarina/gold-alert

MIT 协议，欢迎：
- ⭐ Star
- 🍴 Fork
- 💖 Sponsor

## 经验总结

1. **先做最小可用版本** - 不要一开始就追求完美
2. **选熟悉的技术** - 快速迭代最重要
3. **开源分享** - 帮助他人，也帮助自己
4. **持续迭代** - 根据反馈改进

## 下一步

- [ ] 添加更多通知渠道（Email、Telegram）
- [ ] 增加价格预测功能
- [ ] 支持多种贵金属（白银、铂金）
- [ ] 做一个移动端 App

---

希望这篇文章对你有帮助。如果有问题，欢迎留言讨论！

**GitHub**: https://github.com/HoneyKarina/gold-alert

**联系方式**: GitHub Issues

---

*本文首发于掘金，转载请注明出处。*
