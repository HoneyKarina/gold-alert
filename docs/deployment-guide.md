# 部署指南

## 目录

1. [本地开发](#本地开发)
2. [Docker 部署](#docker-部署)
3. [云平台部署](#云平台部署)
4. [生产环境最佳实践](#生产环境最佳实践)

---

## 本地开发

### 环境要求

- Node.js 18+
- npm 或 yarn
- Git

### 快速开始

```bash
# 1. 克隆项目
git clone https://github.com/HoneyKarina/gold-alert.git
cd gold-alert

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env
vim .env

# 4. 启动开发服务器
npm run dev

# 5. 访问
# Web: http://localhost:3000
# API: http://localhost:3000/api/price
```

### 环境变量

```bash
# 通知渠道
NOTIFY_CHANNEL=console  # console/feishu/telegram/email

# 飞书配置
FEISHU_USER_ID=your_user_id
FEISHU_WEBHOOK_URL=https://open.feishu.cn/open-apis/bot/v2/hook/xxx

# Telegram 配置
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=123456789

# Email 配置
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_TO=recipient@example.com

# 监控配置
CHECK_INTERVAL=60  # 检查间隔（分钟）
ALERT_THRESHOLD=30  # 价格阈值（美元）
ALERT_THRESHOLD_PERCENT=0.7  # 百分比阈值
```

---

## Docker 部署

### 使用 Docker Compose（推荐）

```bash
# 1. 配置环境变量
cp .env.example .env
vim .env

# 2. 启动服务
docker-compose up -d

# 3. 查看日志
docker-compose logs -f

# 4. 停止服务
docker-compose down
```

### 使用 Docker

```bash
# 1. 构建镜像
docker build -t gold-alert .

# 2. 运行容器
docker run -d \
  --name gold-alert \
  -p 3000:3000 \
  --env-file .env \
  --restart unless-stopped \
  gold-alert

# 3. 查看日志
docker logs -f gold-alert

# 4. 停止容器
docker stop gold-alert
```

### Docker Compose 配置

```yaml
version: '3.8'

services:
  gold-alert:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NOTIFY_CHANNEL=${NOTIFY_CHANNEL:-console}
      - CHECK_INTERVAL=${CHECK_INTERVAL:-60}
      - ALERT_THRESHOLD=${ALERT_THRESHOLD:-30}
      - ALERT_THRESHOLD_PERCENT=${ALERT_THRESHOLD_PERCENT:-0.7}
      - FEISHU_USER_ID=${FEISHU_USER_ID}
      - FEISHU_WEBHOOK_URL=${FEISHU_WEBHOOK_URL}
      - TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
      - TELEGRAM_CHAT_ID=${TELEGRAM_CHAT_ID}
      - EMAIL_USER=${EMAIL_USER}
      - EMAIL_PASSWORD=${EMAIL_PASSWORD}
      - EMAIL_TO=${EMAIL_TO}
    volumes:
      - ./data:/app/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/price"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

---

## 云平台部署

### Railway（推荐）

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/gold-alert)

**步骤**：
1. 点击按钮或访问 Railway
2. 连接 GitHub 仓库
3. 配置环境变量
4. 部署！

**优点**：
- ✅ 免费额度充足
- ✅ 自动 HTTPS
- ✅ 自定义域名
- ✅ 简单易用

### Render

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

**步骤**：
1. 创建 Render 账号
2. 连接 GitHub 仓库
3. 配置环境变量
4. 部署！

**优点**：
- ✅ 免费层
- ✅ 自动 HTTPS
- ✅ 简单配置

### Heroku

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

**步骤**：
```bash
# 1. 安装 Heroku CLI
npm install -g heroku

# 2. 登录
heroku login

# 3. 创建应用
heroku create gold-alert

# 4. 配置环境变量
heroku config:set NOTIFY_CHANNEL=telegram
heroku config:set TELEGRAM_BOT_TOKEN=your_token
heroku config:set TELEGRAM_CHAT_ID=your_chat_id

# 5. 部署
git push heroku master

# 6. 打开
heroku open
```

### Fly.io

```bash
# 1. 安装 flyctl
curl -L https://fly.io/install.sh | sh

# 2. 登录
fly auth login

# 3. 创建应用
fly apps create gold-alert

# 4. 配置环境变量
fly secrets set TELEGRAM_BOT_TOKEN=your_token
fly secrets set TELEGRAM_CHAT_ID=your_chat_id

# 5. 部署
fly deploy
```

### VPS (Ubuntu)

```bash
# 1. SSH 登录服务器
ssh user@your-server

# 2. 安装 Docker
curl -fsSL https://get.docker.com | sh

# 3. 克隆项目
git clone https://github.com/HoneyKarina/gold-alert.git
cd gold-alert

# 4. 配置环境变量
cp .env.example .env
vim .env

# 5. 启动服务
docker-compose up -d

# 6. 配置 Nginx 反向代理（可选）
# 7. 配置 Let's Encrypt（可选）
```

---

## 生产环境最佳实践

### 1. 安全

**环境变量管理**
```bash
# 不要硬编码敏感信息
# 使用环境变量
# 使用 Docker secrets（Docker Swarm）
# 使用 Kubernetes secrets（K8s）
```

**HTTPS**
```nginx
# Nginx 配置
server {
    listen 443 ssl http2;
    server_name gold-alert.your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 2. 监控

**日志管理**
```yaml
# docker-compose.yml
services:
  gold-alert:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

**健康检查**
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/api/price"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

**监控工具**
- Prometheus + Grafana
- Uptime Robot
- Pingdom

### 3. 性能优化

**缓存**
- 使用内存缓存（Redis）
- 使用 CDN（静态文件）

**数据库**
- 使用数据库存储历史数据（PostgreSQL/MongoDB）
- 定期清理旧数据

**负载均衡**
```yaml
# docker-compose.yml
services:
  gold-alert:
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
```

### 4. 备份

**数据备份**
```bash
# 备份数据目录
tar -czf gold-alert-backup-$(date +%Y%m%d).tar.gz data/

# 定时备份（cron）
0 2 * * * cd /path/to/gold-alert && tar -czf backup-$(date +\%Y\%m\%d).tar.gz data/
```

### 5. 更新

**滚动更新**
```bash
# Docker Compose
docker-compose pull
docker-compose up -d

# Kubernetes
kubectl set image deployment/gold-alert gold-alert=gold-alert:v1.1.0
```

---

## 故障排查

### 容器无法启动

```bash
# 查看日志
docker logs gold-alert

# 检查配置
docker-compose config

# 重新构建
docker-compose build --no-cache
```

### 服务无响应

```bash
# 检查健康状态
docker inspect gold-alert | grep Health

# 检查端口占用
netstat -tlnp | grep 3000

# 重启服务
docker-compose restart
```

### 通知不工作

```bash
# 检查环境变量
docker exec gold-alert env | grep TELEGRAM

# 手动测试
curl -X POST https://api.telegram.org/bot${TOKEN}/sendMessage \
  -d "chat_id=${CHAT_ID}" \
  -d "text=Test"
```

---

## 更多资源

- [API 文档](./API.md)
- [Telegram 配置](./telegram-setup.md)
- [贡献指南](../CONTRIBUTING.md)
- [常见问题](../FAQ.md)

---

*遇到问题？[创建 Issue](https://github.com/HoneyKarina/gold-alert/issues)*
