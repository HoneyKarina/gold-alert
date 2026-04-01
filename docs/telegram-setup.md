# Telegram Bot 配置指南

## 快速开始

### 1. 创建 Telegram Bot

1. 在 Telegram 中搜索 `@BotFather`
2. 发送 `/newbot`
3. 按提示设置 Bot 名称：
   - Bot name: `Gold Alert Bot` (或任何你喜欢的)
   - Bot username: `YourGoldAlertBot` (必须以 Bot 结尾)
4. **保存 Bot Token** (格式: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)

### 2. 获取 Chat ID

**方法 A：使用 @userinfobot**
1. 在 Telegram 中搜索 `@userinfobot`
2. 发送任意消息
3. 它会返回你的 Chat ID

**方法 B：使用 API**
```bash
# 1. 先给你的 Bot 发一条消息
# 2. 然后访问（替换 YOUR_BOT_TOKEN）
curl https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates | jq
```

### 3. 配置环境变量

```bash
# 编辑 .env 文件
vim .env

# 添加以下配置
NOTIFY_CHANNEL=telegram
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=123456789
```

### 4. 测试 Bot

```bash
# 启动 Gold Alert
npm start

# 如果配置正确，你会收到测试通知
```

---

## Bot 命令（未来功能）

### 基础命令
- `/start` - 开始使用
- `/help` - 帮助信息
- `/price` - 查询当前金价
- `/alert <price>` - 设置价格预警

### 高级命令
- `/alerts` - 查看我的所有预警
- `/clear` - 清除所有预警
- `/settings` - 设置通知频率
- `/history` - 查看历史价格

---

## 示例代码

### 发送通知（已实现）

```typescript
import { sendTelegramNotification } from './notifiers/telegram';

await sendTelegramNotification(
  {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    chatId: process.env.TELEGRAM_CHAT_ID
  },
  '🔔 Gold Price Alert\n\nCurrent Price: $3,022.50\nChange: +0.95%'
);
```

### 接收命令（未来功能）

```typescript
import { handleUpdate } from './telegram-bot';

// Webhook endpoint
app.post('/api/telegram/webhook', async (req, res) => {
  const update = req.body;
  await handleUpdate(update);
  res.json({ ok: true });
});

// 设置 Webhook
await axios.post(
  `https://api.telegram.org/bot${TOKEN}/setWebhook`,
  { url: 'https://your-domain.com/api/telegram/webhook' }
);
```

---

## 高级配置

### Webhook vs Polling

**Webhook（推荐用于生产环境）**
- ✅ 实时接收消息
- ✅ 资源占用少
- ❌ 需要公网域名
- ❌ 需要HTTPS

**Polling（适合开发测试）**
- ✅ 不需要公网域名
- ✅ 配置简单
- ❌ 资源占用较高
- ❌ 有延迟

### Webhook 配置

```bash
# 设置 Webhook
curl -X POST "https://api.telegram.org/bot${TOKEN}/setWebhook" \
  -d "url=https://your-domain.com/api/telegram/webhook"

# 删除 Webhook（改用 Polling）
curl -X POST "https://api.telegram.org/bot${TOKEN}/deleteWebhook"
```

---

## 安全建议

### 1. 保护 Bot Token
- ❌ 不要硬编码在代码中
- ✅ 使用环境变量
- ✅ 不要提交到 Git

### 2. 验证消息来源

```typescript
// 验证消息来自 Telegram
import crypto from 'crypto';

function verifyTelegramWebhook(req: Request): boolean {
  const secret = process.env.TELEGRAM_SECRET;
  const hash = req.headers['x-telegram-bot-api-secret-token'];

  // 验证逻辑...
  return true;
}
```

### 3. 限制访问
- 只允许特定用户使用
- 添加白名单机制

---

## 故障排查

### Bot 不响应

**检查步骤**：
1. Bot Token 是否正确
2. Chat ID 是否正确
3. 是否先给 Bot 发过消息
4. 网络是否通畅（中国大陆需要代理）

**测试命令**：
```bash
# 测试 Bot Token
curl https://api.telegram.org/bot${TOKEN}/getMe

# 测试发送消息
curl -X POST https://api.telegram.org/bot${TOKEN}/sendMessage \
  -d "chat_id=${CHAT_ID}" \
  -d "text=Test message"
```

### 没有收到通知

**可能原因**：
1. `NOTIFY_CHANNEL` 未设置为 `telegram`
2. 环境变量未正确加载
3. Bot Token 或 Chat ID 错误
4. 网络问题（中国大陆）

**解决方案**：
```bash
# 检查环境变量
echo $TELEGRAM_BOT_TOKEN
echo $TELEGRAM_CHAT_ID

# 手动测试
curl -X POST https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage \
  -d "chat_id=${TELEGRAM_CHAT_ID}" \
  -d "text=Manual test"
```

---

## 示例 Bot

**完整示例**：

```typescript
import axios from 'axios';

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// 发送消息
export async function sendMessage(text: string) {
  await axios.post(
    `https://api.telegram.org/bot${TOKEN}/sendMessage`,
    {
      chat_id: CHAT_ID,
      text: text,
      parse_mode: 'HTML'
    }
  );
}

// 发送价格通知
export async function sendPriceAlert(price: number, change: number) {
  const emoji = change >= 0 ? '📈' : '📉';
  const direction = change >= 0 ? '↑' : '↓';

  await sendMessage(`
${emoji} <b>Gold Price Alert</b>

💰 Current Price: $${price.toFixed(2)}
${direction} Change: ${change >= 0 ? '+' : ''}$${change.toFixed(2)}

⏰ ${new Date().toLocaleString('en-US', { timeZone: 'UTC' })}
  `);
}

// 使用示例
sendPriceAlert(3022.50, 28.50);
```

---

## 资源

- [Telegram Bot API 文档](https://core.telegram.org/bots/api)
- [BotFather](https://t.me/botfather)
- [UserInfoBot](https://t.me/userinfobot)
- [Telegram Bot 示例代码](https://github.com/telegram-sms/huawei-remote)

---

*有问题？[创建 Issue](https://github.com/HoneyKarina/gold-alert/issues)*
