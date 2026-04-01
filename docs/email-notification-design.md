# Email 通知功能设计

## 功能描述

支持邮件通知金价预警，让不使用飞书的用户也能收到提醒。

## 技术方案

### 1. 使用 Nodemailer

```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

export async function sendEmailNotification(
  to: string,
  subject: string,
  message: string
) {
  await transporter.sendMail({
    from: '"Gold Alert" <gold-alert@honeykarina.dev>',
    to,
    subject,
    text: message,
    html: `<p>${message}</p>`
  });
}
```

### 2. 配置项

```bash
# .env
EMAIL_ENABLED=true
EMAIL_SERVICE=gmail  # or outlook, yahoo
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### 3. 支持的邮箱服务

- Gmail
- Outlook
- Yahoo
- 自定义 SMTP

### 4. 邮件模板

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; }
    .alert { padding: 20px; background: #f0f0f0; }
    .price { font-size: 24px; font-weight: bold; color: #667eea; }
    .change { font-size: 18px; }
    .up { color: green; }
    .down { color: red; }
  </style>
</head>
<body>
  <div class="alert">
    <h2>🔔 Gold Price Alert</h2>
    <p>Current Price: <span class="price">$3,022.50</span></p>
    <p class="change up">↑ +0.95% (+$28.50)</p>
    <p>Alert triggered at: 2026-04-01 13:30 UTC</p>
    <hr>
    <p>Powered by <a href="https://github.com/HoneyKarina/gold-alert">Gold Alert</a></p>
  </div>
</body>
</html>
```

## 实现步骤

### Phase 1: 基本功能
- [ ] 添加 nodemailer 依赖
- [ ] 实现基本邮件发送
- [ ] 添加配置支持

### Phase 2: 模板优化
- [ ] 设计漂亮的邮件模板
- [ ] 支持富文本
- [ ] 添加项目链接

### Phase 3: 高级功能
- [ ] 支持多个收件人
- [ ] 邮件发送频率限制
- [ ] 发送失败重试

## 安全考虑

1. **不要硬编码密码** - 使用环境变量
2. **使用应用专用密码** - Gmail 需要启用 2FA 并生成应用密码
3. **SMTP 安全** - 使用 TLS/SSL
4. **发送频率限制** - 避免被标记为垃圾邮件

## 用户配置

```bash
# 用户设置邮件通知
NOTIFY_CHANNEL=email
EMAIL_USER=user@example.com
EMAIL_PASSWORD=app-specific-password
EMAIL_TO=recipient@example.com
```

## 文档更新

需要在 README 中添加：
- 如何配置邮件通知
- 如何获取 Gmail 应用密码
- 常见问题解答

---

## 预期效果

- ✅ 扩大用户群体（不限于飞书用户）
- ✅ 提升产品价值
- ✅ 增加付费转化点（Premium = 多邮箱）

---

*待实现*
