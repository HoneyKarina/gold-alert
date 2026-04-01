# Telegram Bot 通知功能设计

## 功能描述

通过 Telegram Bot 发送金价预警通知，用户只需关注 Bot 即可收到提醒。

## 技术方案

### 1. 创建 Telegram Bot

1. 在 Telegram 中找到 @BotFather
2. 发送 `/newbot`
3. 按提示设置 Bot 名称
4. 获得 Bot Token

### 2. 代码实现

```typescript
import axios from 'axios';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

export async function sendTelegramNotification(
  chatId: string,
  message: string
) {
  await axios.post(`${TELEGRAM_API}/sendMessage`, {
    chat_id: chatId,
    text: message,
    parse_mode: 'HTML'
  });
}

// 处理用户命令
export async function handleUpdate(update: any) {
  const message = update.message;
  const chatId = message.chat.id;
  const text = message.text;

  if (text === '/start') {
    await sendTelegramNotification(
      chatId,
      'Welcome to Gold Alert! 🔔\n\n' +
      'Use /subscribe to get price alerts.\n' +
      'Use /price to check current gold price.\n' +
      'Use /alert <price> to set a custom alert.'
    );
  }

  if (text === '/price') {
    const price = await fetchGoldPrice();
    await sendTelegramNotification(
      chatId,
      `Current Gold Price: <b>$${price.price}</b>\n` +
      `Change: ${price.change >= 0 ? '↑' : '↓'} ${Math.abs(price.changePercent).toFixed(2)}%`
    );
  }

  if (text.startsWith('/alert')) {
    const targetPrice = parseFloat(text.split(' ')[1]);
    // 保存用户的预警设置
    await saveUserAlert(chatId, targetPrice);
    await sendTelegramNotification(
      chatId,
      `✅ Alert set for $${targetPrice}`
    );
  }
}
```

### 3. Webhook 设置

```bash
# 设置 Webhook
curl -X POST "https://api.telegram.org/bot${TOKEN}/setWebhook" \
  -d "url=https://your-domain.com/api/telegram/webhook"
```

### 4. 配置项

```bash
# .env
TELEGRAM_ENABLED=true
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_WEBHOOK_URL=https://your-domain.com/api/telegram/webhook
```

## 功能列表

### 用户命令

- `/start` - 开始使用，显示帮助
- `/price` - 查询当前金价
- `/alert <price>` - 设置价格预警
- `/alerts` - 查看我的预警
- `/clear` - 清除所有预警
- `/settings` - 设置通知频率

### 管理员命令

- `/broadcast <message>` - 广播消息给所有用户
- `/stats` - 查看用户统计

## 数据库设计

```typescript
// 用户表
interface TelegramUser {
  chatId: string;
  username?: string;
  createdAt: Date;
  alerts: Alert[];
}

// 预警表
interface Alert {
  id: string;
  chatId: string;
  type: 'above' | 'below';
  targetPrice: number;
  createdAt: Date;
  triggered: boolean;
}
```

## 实现步骤

### Phase 1: 基本功能
- [ ] 创建 Telegram Bot
- [ ] 实现 `/start` 和 `/price` 命令
- [ ] 设置 Webhook

### Phase 2: 预警功能
- [ ] 实现 `/alert` 命令
- [ ] 存储用户预警设置
- [ ] 定时检查并触发预警

### Phase 3: 高级功能
- [ ] 多语言支持
- [ ] 内联按钮交互
- [ ] 价格图表发送

## 优势

- ✅ 用户基数大（Telegram 月活 8 亿）
- ✅ 无需安装（关注 Bot 即可）
- ✅ 实时性好（推送通知）
- ✅ 跨平台（iOS/Android/Desktop）
- ✅ 开发简单（API 友好）

## 推广策略

1. **Bot 目录** - 提交到 Telegram Bot 目录
2. **社区分享** - 在 Telegram 群分享
3. **SEO** - Bot 名称包含关键词
4. **口碑** - 用户推荐用户

## 变现点

- **Free**: 基本价格查询 + 1 个预警
- **Premium ($4.9/mo)**:
  - 无限预警
  - 更高频率通知
  - 价格图表
  - 多贵金属支持

---

*待实现*
