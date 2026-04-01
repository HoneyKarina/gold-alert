# 贡献指南

感谢你考虑为 Gold Alert 做贡献！🎉

---

## 🌟 贡献方式

### 报告 Bug

如果你发现了 bug，请[创建 Issue](https://github.com/HoneyKarina/gold-alert/issues/new?template=bug_report.md)，包括：

- 详细描述问题
- 复现步骤
- 预期行为
- 实际行为
- 截图（如果适用）
- 环境信息（OS、Node.js 版本等）

### 提出新功能

如果你有新功能的想法，请[创建 Feature Request](https://github.com/HoneyKarina/gold-alert/issues/new?template=feature_request.md)，包括：

- 功能描述
- 使用场景
- 预期效果
- 可能的实现方式（可选）

### 改进文档

文档改进也是重要的贡献！

- 修正拼写错误
- 改进说明
- 添加示例
- 翻译文档

### 提交代码

#### 开发环境设置

```bash
# 1. Fork 本仓库
# 2. 克隆你的 fork
git clone https://github.com/YOUR_USERNAME/gold-alert.git
cd gold-alert

# 3. 安装依赖
npm install

# 4. 创建分支
git checkout -b feature/your-feature-name

# 5. 进行修改
# ...

# 6. 运行测试
npm test

# 7. 提交代码
git add .
git commit -m "feat: add some feature"

# 8. 推送到 fork
git push origin feature/your-feature-name

# 9. 创建 Pull Request
```

#### 代码规范

- 使用 TypeScript
- 遵循 ESLint 规则
- 添加类型注解
- 编写注释
- 更新文档

#### Commit 规范

使用 [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` 新功能
- `fix:` 修复 bug
- `docs:` 文档更新
- `style:` 代码格式（不影响功能）
- `refactor:` 代码重构
- `test:` 测试相关
- `chore:` 构建配置等

示例：
```
feat: add Telegram bot support
fix: handle API timeout correctly
docs: update deployment guide
```

#### Pull Request 规范

- 关联相关 Issue
- 描述改动内容
- 说明测试方法
- 更新相关文档
- 添加截图（如果适用）

---

## 🎯 优先级任务

### 高优先级

- [ ] Telegram Bot 集成
- [ ] Email 通知支持
- [ ] Docker 镜像优化
- [ ] 价格图表功能
- [ ] 单元测试覆盖

### 中优先级

- [ ] 多贵金属支持（白银、铂金）
- [ ] 价格预测（AI）
- [ ] 移动端优化
- [ ] 国际化（i18n）
- [ ] 性能优化

### 低优先级

- [ ] 移动 App
- [ ] 浏览器扩展
- [ ] 桌面应用
- [ ] 社区功能

---

## 📝 代码风格

### TypeScript

```typescript
// ✅ 好的例子
interface PriceData {
  price: number;
  timestamp: Date;
  source: string;
}

export async function fetchGoldPrice(): Promise<PriceData> {
  // 实现...
}

// ❌ 不好的例子
export function fetchPrice() {
  // 缺少类型注解
}
```

### 命名规范

- **文件名**: kebab-case (`price-fetcher.ts`)
- **类名**: PascalCase (`AlertEngine`)
- **函数/变量**: camelCase (`fetchGoldPrice`)
- **常量**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **接口**: PascalCase + 前缀 (`PriceData`)

---

## 🧪 测试

### 运行测试

```bash
# 运行所有测试
npm test

# 运行特定测试
npm test -- price-fetcher.test.ts

# 测试覆盖率
npm run test:coverage
```

### 编写测试

```typescript
import { fetchGoldPrice } from '../src/price-fetcher';

describe('fetchGoldPrice', () => {
  it('should return price data', async () => {
    const data = await fetchGoldPrice();

    expect(data).toBeDefined();
    expect(data.price).toBeGreaterThan(0);
    expect(data.source).toBe('Kitco');
  });
});
```

---

## 📚 文档

### 文档结构

```
docs/
├── API.md              # API 文档
├── deployment-guide.md # 部署指南
├── telegram-setup.md   # Telegram 配置
└── ...                 # 其他文档
```

### 文档规范

- 使用 Markdown 格式
- 添加目录（长文档）
- 使用代码块
- 添加示例
- 包含截图（如果适用）

---

## 🤝 社区准则

### 行为准则

- 尊重他人
- 建设性反馈
- 包容性语言
- 专注问题本身

### 沟通渠道

- GitHub Issues: Bug 报告、功能请求
- GitHub Discussions: 一般讨论、问答
- Pull Requests: 代码贡献

---

## 📄 许可证

通过贡献代码，你同意你的代码将按照 [MIT License](../LICENSE) 发布。

---

## 🙏 感谢

感谢所有贡献者！

<a href="https://github.com/HoneyKarina/gold-alert/graphs/contributors">
  <img src="https://contributors-img.web.app/image?repo=HoneyKarina/gold-alert" />
</a>

---

*有问题？随时[创建 Issue](https://github.com/HoneyKarina/gold-alert/issues)！*
