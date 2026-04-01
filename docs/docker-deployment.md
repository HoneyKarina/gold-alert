# Docker 部署指南

## 快速开始

### 使用 Docker Compose（推荐）

```bash
# 克隆项目
git clone https://github.com/HoneyKarina/gold-alert.git
cd gold-alert

# 配置环境变量
cp .env.example .env
vim .env

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f
```

### 使用 Docker

```bash
# 构建镜像
docker build -t gold-alert .

# 运行容器
docker run -d \
  --name gold-alert \
  -p 3000:3000 \
  --env-file .env \
  gold-alert
```

## 环境变量

创建 `.env` 文件：

```bash
# 通知渠道
NOTIFY_CHANNEL=feishu

# 飞书配置
FEISHU_USER_ID=your_user_id
FEISHU_WEBHOOK_URL=https://open.feishu.cn/open-apis/bot/v2/hook/xxx

# 或 Telegram 配置
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id

# 或 Email 配置
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_TO=recipient@example.com

# 监控配置
CHECK_INTERVAL=60
ALERT_THRESHOLD=30
ALERT_THRESHOLD_PERCENT=0.7
```

## 数据持久化

容器会将数据保存在 `/app/data` 目录，可以挂载到主机：

```bash
volumes:
  - ./data:/app/data
```

## 健康检查

添加健康检查到 docker-compose.yml：

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/api/price"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

## 生产环境部署

### 使用 HTTPS

配合 Nginx 反向代理：

```yaml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./certs:/etc/nginx/certs
    depends_on:
      - gold-alert
```

### 监控和日志

```yaml
services:
  gold-alert:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

## 常见问题

### 1. 权限问题

```bash
# 给数据目录权限
chmod -R 755 data/
```

### 2. 网络问题

```bash
# 使用国内镜像
docker pull registry.cn-hangzhou.aliyuncs.com/library/node:18-alpine
```

### 3. 更新镜像

```bash
# 拉取最新代码
git pull

# 重新构建
docker-compose build

# 重启服务
docker-compose up -d
```

---

*更多信息请参考 [README](https://github.com/HoneyKarina/gold-alert#deployment)*
