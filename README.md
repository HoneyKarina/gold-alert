# Gold Alert 🔔

> 开源的智能金价预警工具 - 实时监控，异常波动自动通知

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![GitHub Sponsors](https://img.shields.io/badge/Sponsor-❤-ff69b4.svg)](https://github.com/sponsors/HoneyKarina)

## ✨ 功能特性

- 🔄 **实时监控** - 从 Kitco 获取国际金价数据
- 🚨 **智能预警** - 自定义涨跌阈值，波动异常自动通知
- 📢 **多渠道通知** - 支持飞书、Webhook、Telegram、Email、控制台输出
- 📊 **历史数据** - 记录价格变化，支持数据分析
- 🌐 **Web 界面** - 简洁美观的价格仪表盘
- ⚡ **轻量高效** - 基于 Node.js，资源占用低

## 🚀 快速开始

### 安装

```bash
# 克隆项目
git clone https://github.com/HoneyKarina/gold-alert.git

# 安装依赖
cd gold-alert
npm install
```

### 配置

```bash
# 复制配置模板
cp .env.example .env

# 编辑配置
vim .env
```

配置项说明：

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `NOTIFY_CHANNEL` | 通知渠道（console/feishu/webhook） | `console` |
| `FEISHU_USER_ID` | 飞书用户 ID（私聊通知） | - |
| `CHECK_INTERVAL` | 检查间隔（分钟） | `60` |
| `ALERT_THRESHOLD` | 价格阈值（美元） | `30` |
| `ALERT_THRESHOLD_PERCENT` | 百分比阈值 | `0.7` |

### 运行

```bash
# 启动监控服务
npm start

# 启动 Web 界面
npm run server

# 同时启动监控和 Web
npm run web
```

## 📡 API 接口

### 获取当前金价

```bash
GET /api/price
```

响应：
```json
{
  "price": 3022.50,
  "change": 28.50,
  "changePercent": 0.95,
  "timestamp": "2026-04-01T03:00:00Z",
  "source": "Kitco"
}
```

### 获取历史数据

```bash
GET /api/history?days=7
```

### 设置预警规则

```bash
POST /api/alerts
Content-Type: application/json

{
  "type": "threshold",
  "value": 50,
  "direction": "both"
}
```

## 💖 支持项目

如果这个项目对你有帮助，欢迎支持！

### GitHub Sponsors

[![Sponsor](https://img.shields.io/badge/Sponsor-❤-ff69b4.svg)](https://github.com/sponsors/HoneyKarina)

### 其他方式

- ⭐ Star 本项目
- 🐛 提交 Issue 反馈问题
- 💡 提交 PR 贡献代码
- 📢 推荐给朋友

## 🗺️ 开发路线

### v1.0 (当前)
- [x] 实时金价监控
- [x] 阈值预警
- [x] 飞书通知
- [x] Web 界面
- [x] 历史数据记录

### v1.1 (计划中)
- [ ] 邮件通知
- [ ] Telegram 通知
- [ ] 微信通知（Server酱）
- [ ] Docker 部署支持

### v1.2 (计划中)
- [ ] 技术指标分析（MA、RSI）
- [ ] 价格趋势预测
- [ ] 多贵金属支持（白银、铂金）

### v2.0 (长期)
- [ ] 交易信号生成
- [ ] 策略回测
- [ ] 多用户支持

## 🤝 贡献

欢迎贡献代码、报告问题或提出建议！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 提交 Pull Request

## 📄 开源协议

本项目基于 [MIT License](LICENSE) 开源。

---

Made with ❤️ by [Karina](https://github.com/HoneyKarina)

如果你在投资黄金，这个工具可能会帮到你 💰
