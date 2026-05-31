# myMusicAI - 配置指南

## 环境要求

- Node.js 16+
- npm 或 yarn
- 网易云音乐账号（用于登录和获取音乐数据）

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/whisper12/my-music-agent.git
cd my-music-agent
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制环境变量示例文件：

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入你的 API Keys：

```env
# Fish Audio TTS API
FISH_API_KEY=your_fish_audio_api_key_here
FISH_VOICE_ID=your_fish_audio_voice_id_here

# DeepSeek API
DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

### 4. 获取 API Keys

#### DeepSeek API Key

1. 访问 [DeepSeek Platform](https://platform.deepseek.com)
2. 注册/登录账号
3. 进入 API Keys 页面
4. 创建新的 API Key
5. 复制 Key 到 `.env` 文件的 `DEEPSEEK_API_KEY`

**用途：**
- AI 电台节目规划（使用 deepseek-v4-pro 模型）
- 歌曲介绍生成
- AI 音乐助手对话和功能调用

#### Fish Audio API Key

1. 访问 [Fish Audio](https://fish.audio)
2. 注册/登录账号
3. 进入 API 设置页面
4. 创建 API Key
5. 复制 Key 到 `.env` 文件的 `FISH_API_KEY`
6. 选择一个音色 ID，填入 `FISH_VOICE_ID`

**用途：**
- 歌曲介绍语音播报
- AI 助手回复语音播报

**注意：** Fish Audio API 需要配置代理（默认 `http://127.0.0.1:7890`），可在 `server/tts.mjs` 中修改。

### 5. 启动服务

**启动后端服务（端口 3001）：**

```bash
cd server
node proxy.mjs
```

**启动前端服务（端口 5173）：**

在新的终端窗口中：

```bash
npm run dev
```

### 6. 访问应用

- **本地访问**: http://localhost:5173
- **局域网访问**: http://你的IP:5173（显示在终端中）

## 功能使用

### 登录网易云音乐

1. 点击右上角登录按钮
2. 使用网易云音乐 App 扫描二维码
3. 扫码成功后自动登录

### 使用 AI 电台

1. 登录后点击"开始电台"按钮
2. AI 会分析你的音乐品味（首次加载会缓存最多 200 首喜欢的歌曲）
3. 根据当前时间段推荐 20 首新歌
4. 自动播放推荐的歌曲
5. 节目结束后自动获取新推荐（无限续播）

### 使用 AI 音乐助手

1. 点击爱心右侧的聊天图标打开对话框
2. 用自然语言控制播放器：
   - "播放周杰伦的晴天"
   - "暂停"
   - "下一首"
   - "现在播的是什么"
   - "音量调到 50"
   - "搜索林俊杰"
   - "开启 AI 电台"
3. 开启"自动播报"可让 AI 回复语音播报
4. 聊天记录自动保存到本地（按用户隔离）

### 歌曲介绍

1. 播放歌曲时，点击左上角"歌曲介绍"按钮
2. AI 会生成并播报歌曲背景故事
3. 播报时音乐音量自动降低 70%
4. 同一首歌的介绍会被缓存

## 配置说明

### 代理配置

如果 Fish Audio API 需要代理，修改 `server/tts.mjs`：

```javascript
const PROXY_URL = 'http://127.0.0.1:7890' // 修改为你的代理地址
```

### 网络访问

项目默认配置了局域网访问：

- 前端：`vite.config.ts` 中 `host: '0.0.0.0'`
- 后端：`server/proxy.mjs` 中 `app.listen(PORT, '0.0.0.0')`

同一 WiFi 下的其他设备可以通过 IP 地址访问。

### 聊天记录

聊天记录保存在 `chat_histories/` 目录：

- 未登录用户：`guest.json`
- 已登录用户：`user_{uid}.json`

切换账号时自动加载对应的聊天记录。

## 故障排除

### DeepSeek API 错误

- 检查 API Key 是否正确
- 确认账户有足够的余额
- 查看后端日志获取详细错误信息

### Fish Audio TTS 错误

- 检查 API Key 和 Voice ID 是否正确
- 确认代理配置正确（如果需要）
- 检查账户余额

### 网易云音乐登录失败

- 确保使用最新版网易云音乐 App
- 检查网络连接
- 尝试重新生成二维码

### 端口被占用

如果端口 5173 或 3001 被占用：

- 前端会自动切换到其他端口（如 5174）
- 后端需要手动修改 `server/proxy.mjs` 中的 `PORT` 变量

## API 使用限制

### DeepSeek API

- 模型：deepseek-v4-pro
- 根据账户套餐有不同的速率限制
- 查看 [DeepSeek 定价](https://platform.deepseek.com/pricing) 了解详情

### Fish Audio API

- 按字符数计费
- 查看 [Fish Audio 定价](https://fish.audio/pricing) 了解详情

## 安全注意事项

⚠️ **重要：**

- `.env` 文件已被 `.gitignore` 忽略，不会上传到 GitHub
- `chat_histories/` 目录已被忽略，聊天记录不会泄露
- 不要在代码中硬编码 API Keys
- 不要将 `.env` 文件提交到版本控制

## 开发建议

### 修改推荐数量

编辑 `server/proxy.mjs` 第 199 行：

```javascript
推荐 20 首**新歌** // 修改数字即可
```

### 修改 AI 模型

编辑 `server/proxy.mjs`，搜索 `model: "deepseek-v4-pro"` 并替换为其他模型。

### 自定义 TTS 音色

在 Fish Audio 平台选择不同的音色 ID，更新 `.env` 文件中的 `FISH_VOICE_ID`。

## 更多帮助

- [项目 README](README.md)
- [GitHub Issues](https://github.com/whisper12/my-music-agent/issues)
- [DeepSeek 文档](https://platform.deepseek.com/docs)
- [Fish Audio 文档](https://fish.audio/docs)
