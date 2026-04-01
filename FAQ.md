# 常见问题（FAQ）

## 一般问题

### Q: Gold Alert 是什么？

A: Gold Alert 是一个开源的黄金价格监控工具，可以实时追踪金价变化，并通过多种渠道（飞书、Telegram、Email）发送预警通知。

### Q: Gold Alert 是免费的吗？

A: 是的！Gold Alert 采用 MIT 协议开源，完全免费。你可以自由使用、修改和分发。

### Q: 支持哪些通知渠道？

A: 目前支持：
- ✅ 飞书（Feishu）
- ✅ Webhook
- ✅ 控制台输出
- 🚧 Telegram（即将支持）
- 🚧 Email（即将支持）

### Q: 数据源是什么？

A: 使用 Kitco（国际知名贵金属交易平台）的公开数据，免费、可靠、准确。

---

## 安装与配置

### Q: 环境要求是什么？

A:
- Node.js 18+
- npm 或 yarn
- Git

### Q: 如何安装？

A:
```bash
git clone https://github.com/HoneyKarina/gold-alert.git
cd gold-alert
npm install
cp .env.example .env
# 编辑 .env 配置
npm start
```

### Q: 如何配置飞书通知？

A:
1. 获取飞书 User ID（在飞书中查看个人资料）
2. 配置环境变量：
   ```bash
   NOTIFY_CHANNEL=feishu
   FEISHU_USER_ID=your_user_id
   ```
3. 重启服务

### Q: 如何配置 Telegram 通知？

A: 参考 [Telegram 配置指南](./docs/telegram-setup.md)

---

## 使用问题

### Q: 如何设置价格预警？

A: 通过环境变量配置：
```bash
# 绝对值阈值（美元）
ALERT_THRESHOLD=30

# 百分比阈值
ALERT_THRESHOLD_PERCENT=0.7
```

当金价变化超过阈值时，自动发送通知。

### Q: 检查频率可以调整吗？

A: 可以！通过 `CHECK_INTERVAL` 配置：
```bash
# 每 60 分钟检查一次
CHECK_INTERVAL=60

# 每 30 分钟检查一次
CHECK_INTERVAL=30
```

### Q: 如何查看历史数据？

A: 访问 API 端点：
```bash
curl http://localhost:3000/api/history?days=7
```

### Q: 可以监控其他贵金属吗？

A: 目前只支持黄金（Gold），但计划添加：
- 白银（Silver）
- 铂金（Platinum）
- 钯金（Palladium）

欢迎[创建 Feature Request](https://github.com/HoneyKarina/gold-alert/issues/new)！

---

## 部署问题

### Q: 如何部署到生产环境？

A: 推荐使用 Docker：
```bash
docker-compose up -d
```

详见 [部署指南](./docs/deployment-guide.md)

### Q: 如何部署到云平台？

A: 支持多种云平台：
- Railway（推荐）
- Render
- Heroku
- Fly.io
- VPS

详见 [部署指南](./docs/deployment-guide.md)

### Q: 需要公网 IP 吗？

A:
- **基本功能**: 不需要（定时检查 + 通知）
- **Web 界面**: 需要（如果要从外网访问）
- **Telegram Webhook**: 需要（或使用轮询模式）

### Q: 如何配置 HTTPS？

A: 使用 Nginx + Let's Encrypt：
```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com
```

详见 [部署指南](./docs/deployment-guide.md)

---

## 技术问题

### Q: 为什么选择 Node.js？

A:
- ✅ 跨平台
- ✅ 生态丰富
- ✅ 易于部署
- ✅ 开发效率高

### Q: 数据更新频率是多少？

A: 默认 60 分钟，可自定义。建议：
- **开发环境**: 5-10 分钟
- **生产环境**: 30-60 分钟

过于频繁可能被 API 限流。

### Q: 如何处理 API 超时？

A: 内置了重试机制（3次）和缓存（5分钟），自动处理网络问题。

### Q: 支持高并发吗？

A: 支持基本并发，但建议：
- 使用缓存
- 负载均衡（如果用户量大）
- 数据库存储（如果需要持久化）

---

## 故障排查

### Q: 服务启动失败？

A: 检查：
1. Node.js 版本（需要 18+）
2. 依赖是否安装（`npm install`）
3. 端口是否占用（3000）
4. 环境变量是否配置

### Q: 没有收到通知？

A: 检查：
1. `NOTIFY_CHANNEL` 是否正确
2. 对应渠道的配置是否正确
3. 查看日志是否有错误
4. 网络是否通畅

### Q: 价格数据不准确？

A: 可能原因：
1. API 缓存未更新（等待 5 分钟）
2. 数据源问题（Kitco 可能故障）
3. 网络问题

解决：重启服务或等待下次更新。

### Q: 内存占用过高？

A:
- 减少检查频率
- 清理历史数据
- 使用更小的缓存

---

## 贡献相关

### Q: 如何贡献代码？

A: 详见 [贡献指南](./CONTRIBUTING.md)

### Q: 如何报告 Bug？

A: [创建 Issue](https://github.com/HoneyKarina/gold-alert/issues/new?template=bug_report.md)

### Q: 如何提出新功能？

A: [创建 Feature Request](https://github.com/HoneyKarina/gold-alert/issues/new?template=feature_request.md)

### Q: 有奖励吗？

A:
- ⭐ GitHub Star（免费！）
- 🍴 Fork and contribute
- 💖 [Sponsor](https://github.com/sponsors/HoneyKarina)（支持开发）

---

## 其他问题

### Q: 作者为什么要做这个项目？

A:
- 自己需要金价监控工具
- 学习独立开发
- 探索开源变现
- 帮助其他人

### Q: 有商业计划吗？

A: 有考虑 Premium 版本：
- Email + Telegram 通知
- 价格预测
- 高级分析
- 优先支持

但核心功能永远免费！

### Q: 如何联系作者？

A:
- GitHub: [@HoneyKarina](https://github.com/HoneyKarina)
- Email: honeykarina@outlook.com
- GitHub Issues: 技术问题

### Q: 有社区吗？

A:
- GitHub Discussions（即将开放）
- Telegram Group（计划中）
- Discord（计划中）

---

## 没有找到答案？

- [搜索 Issues](https://github.com/HoneyKarina/gold-alert/issues)
- [创建新 Issue](https://github.com/HoneyKarina/gold-alert/issues/new)
- [查看文档](./docs/)

---

*最后更新: 2026-04-01*
