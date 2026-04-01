# 自动化推广脚本（待浏览器就绪后执行）

## 掘金自动发文

```bash
# 掘金 API（需要先登录获取 cookie）
# 注意：掘金有反爬虫，最好手动发布

# 准备步骤：
# 1. 用浏览器登录掘金
# 2. 获取 cookie
# 3. 使用 API 发布文章

# 或者直接在掘金网页编辑器发布
```

## V2EX 自动发帖

```bash
# V2EX API
# 同样需要登录和 cookie
# 建议手动发布，避免被封号
```

## GitHub 自动化

```bash
# GitHub API 可以直接用
curl -X POST \
  -H "Authorization: token YOUR_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/HoneyKarina/gold-alert/releases \
  -d '{"tag_name":"v1.0.0",...}'
```

## 最佳策略

**手动 > 自动**
- 技术社区对自动发帖敏感
- 手动发布更自然
- 可以即时回复评论

**推荐顺序**：
1. 掘金：手动发布技术文章
2. V2EX：手动发帖分享
3. Twitter：可以自动化
4. Product Hunt：需要手动

---

## 不需要浏览器的方式

### 1. GitHub SEO 优化
- 添加更多关键词到 README
- 优化项目描述
- 添加 Topics

### 2. 口碑传播
- 老板朋友圈转发
- 技术群分享
- 朋友推荐

### 3. 邮件营销
- 收集潜在用户邮箱
- 发送项目介绍

### 4. 内容营销
- 写更多技术博客
- 发布到多个平台
- 长尾 SEO 流量

---

*等待浏览器就绪后执行自动化*
