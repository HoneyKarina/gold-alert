# Gold Alert 增强版部署指南

## 🚀 快速开始

Gold Alert 是一个智能金价预警系统，支持实时监控、多渠道通知和高级分析功能。

### 系统特性

- ✅ **实时监控**: WebSocket 实时数据流
- ✅ **多渠道通知**: 飞书、Telegram、Email、Webhook
- ✅ **智能预警**: 多种预警规则 + AI 预测
- ✅ **数据缓存**: 智能缓存机制，提高响应速度
- ✅ **API 接口**: RESTful API 供第三方集成
- ✅ **容器化**: Docker 一键部署
- ✅ **监控分析**: 完整的日志和统计功能

### 环境要求

- Node.js >= 18.0.0
- npm >= 8.0.0
- 2GB+ 内存
- 稳定的网络连接

## 📦 安装部署

### 1. 克隆仓库

```bash
git clone <your-gold-alert-repo>
cd gold-alert
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制 `.env.example` 到 `.env` 并配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# 基础配置
NODE_ENV=production
PORT=3000

# 通知配置
NOTIFY_CHANNEL=feishu
FEISHU_USER_ID=ou_your_user_id
FEISHU_WEBHOOK=your_webhook_url

# Telegram 配置（可选）
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id

# Email 配置（可选）
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# API 配置
API_KEY=your_api_key
WEBHOOK_URL=your_webhook_endpoint
```

### 4. 启动服务

#### 开发模式
```bash
npm run dev
```

#### 生产模式
```bash
npm start
```

#### 使用增强版
```bash
# 使用增强版主程序
npm run enhanced

# 或者直接运行
node src/index-enhanced.ts
```

## 🔧 配置说明

### 预警规则配置

系统支持多种预警规则，可以通过修改 `src/alert-engine-enhanced.ts` 来自定义：

```typescript
// 添加自定义规则
const rule: AlertRule = {
  id: 'custom-rule',
  name: '自定义规则',
  type: 'threshold', // threshold, percent, trend, ml, volume
  value: 50,
  direction: 'both',
  enabled: true,
  priority: 8,
  cooldown: 3600,
  actions: [
    { type: 'notify', config: { channel: 'all' } }
  ]
};

alertEngine.addRule(rule);
```

### 数据源配置

系统支持多个金价数据源，自动选择最佳数据：

- Kitco (主要数据源)
- GoldPrice.org (备用数据源)
- TradingView (备用数据源)

## 🌐 API 接口

启动服务后，可以通过以下 API 接口访问：

### 获取当前金价

```bash
curl http://localhost:3000/api/price/current
```

响应：
```json
{
  "price": 2025.50,
  "change": 15.20,
  "changePercent": 0.75,
  "timestamp": "2026-04-02T09:30:00Z",
  "source": "Kitco",
  "confidence": 0.9
}
```

### 获取历史数据

```bash
curl http://localhost:3000/api/price/history?days=7
```

### 获取统计信息

```bash
curl http://localhost:3000/api/statistics
```

### 获取预测分析

```bash
curl http://localhost:3000/api/predict
```

### 获取预警规则

```bash
curl http://localhost:3000/api/rules
```

## 📊 监控和分析

### 实时日志

系统提供详细的运行日志：

```bash
# 查看实时日志
npm run logs

# 或者直接查看日志文件
tail -f logs/gold-alert.log
```

### 统计信息

系统自动记录以下统计信息：

- 价格变化趋势
- 预警触发次数
- 系统运行状态
- 数据质量评分
- API 调用统计

### 性能监控

监控关键指标：

- 内存使用率
- CPU 使用率
- 响应时间
- 错误率
- 数据源响应时间

## 🚀 Docker 部署

### 1. 构建镜像

```bash
docker build -t gold-alert:latest .
```

### 2. 运行容器

```bash
docker run -d \
  --name gold-alert \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e FEISHU_USER_ID=your_user_id \
  -e FEISHU_WEBHOOK=your_webhook \
  gold-alert:latest
```

### 3. 使用 Docker Compose

```yaml
version: '3.8'
services:
  gold-alert:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - FEISHU_USER_ID=your_user_id
      - FEISHU_WEBHOOK=your_webhook
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

## 🔒 安全配置

### 1. API 密钥

在 `.env` 中设置 `API_KEY` 来保护 API 接口：

```bash
curl -H "Authorization: Bearer your_api_key" http://localhost:3000/api/price/current
```

### 2. 网络安全

- 使用 HTTPS（建议在生产环境）
- 配置防火墙规则
- 定期更新依赖包

### 3. 数据安全

- 定期备份数据
- 使用加密存储敏感信息
- 限制日志访问权限

## 📈 性能优化

### 1. 缓存优化

系统内置智能缓存机制，可以通过以下参数调整：

```typescript
// 缓存配置
const cacheConfig = {
  maxSize: 100,          // 最大缓存数量
  expireTime: 300000,    // 缓存过期时间（5分钟）
  cleanupInterval: 600000 // 清理间隔（10分钟）
};
```

### 2. 数据源优化

- 自动选择最快响应的数据源
- 支持并发请求多个数据源
- 智能重试机制

### 3. 资源管理

- 内存使用监控
- 自动清理过期数据
- 连接池管理

## 🐛 故障排除

### 常见问题

#### 1. 无法获取金价数据

```bash
# 检查网络连接
curl -I https://www.kitco.com/price/precious-metals/gold

# 查看详细错误日志
npm run logs
```

#### 2. 通知发送失败

```bash
# 检查配置是否正确
cat .env | grep NOTIFY_

# 测试通知
npm run test-notifications
```

#### 3. API 接口无响应

```bash
# 检查服务状态
curl http://localhost:3000/api/health

# 检查端口占用
netstat -tulpn | grep :3000
```

### 日志分析

系统提供详细的日志记录：

```bash
# 查看错误日志
grep "ERROR" logs/gold-alert.log

# 查看预警日志
grep "ALERT" logs/gold-alert.log

# 查看性能日志
grep "PERFORMANCE" logs/gold-alert.log
```

## 🔄 维护和升级

### 1. 定期维护

- 清理缓存数据
- 更新依赖包
- 备份配置文件
- 检查系统日志

### 2. 版本升级

```bash
# 备份当前版本
cp -r /path/to/gold-alert /path/to/gold-alert-backup

# 拉取最新版本
git pull origin main

# 安装新依赖
npm install

# 重启服务
pm2 restart gold-alert
```

### 3. 监控和维护脚本

创建维护脚本：

```bash
#!/bin/bash
# maintenance.sh

# 清理缓存
echo "清理缓存..."
find /var/log/gold-alert -name "*.log.*" -mtime +7 -delete

# 备份配置
echo "备份配置..."
cp /path/to/gold-alert/.env /backup/gold-alert.env.$(date +%Y%m%d)

# 检查服务状态
echo "检查服务状态..."
curl -f http://localhost:3000/api/health || echo "服务异常"
```

## 📞 技术支持

如果遇到问题，请检查：

1. 环境配置是否正确
2. 网络连接是否正常
3. 依赖包是否安装
4. 日志中的错误信息

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**部署完成！开始享受智能金价监控服务！** 🎉