# MusicAI - 配置指南

## 设置 Anthropic API Key

1. 访问 [Anthropic Console](https://console.anthropic.com/)
2. 注册/登录账号
3. 创建 API Key
4. 在项目根目录创建 `.env` 文件：

```bash
cp .env.example .env
```

5. 编辑 `.env` 文件，填入你的 API Key：

```env
VITE_ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
```

6. 重启开发服务器：

```bash
npm run dev
```

## 注意事项

⚠️ **安全警告**：当前配置使用 `dangerouslyAllowBrowser: true`，这意味着 API Key 会暴露在浏览器中。

**生产环境建议：**
- 创建后端 API 代理
- 在服务器端调用 Anthropic API
- 前端只调用你的后端接口

## API 使用限制

- Claude 3.5 Sonnet：每次请求最多 1024 tokens
- 根据你的 Anthropic 账户套餐有不同的速率限制
- 查看 [Anthropic 定价](https://www.anthropic.com/pricing) 了解详情

## 测试

配置完成后，在聊天框输入消息，应该能收到 Claude AI 的真实回复。
