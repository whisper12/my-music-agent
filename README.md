# myMusicAI - AI 音乐电台

一个结合 AI 智能推荐、语音播报和智能对话的音乐电台 Web 应用。

## ✨ 功能特性

### 🎵 音乐播放
- **大圆形封面** - 播放时旋转动画，视觉效果出色
- **音量可视化** - 根据音频频率实时变化的外圈动画
- **动态背景** - 自动提取封面主色调，生成渐变模糊背景
- **播放控制** - 播放/暂停、上一首/下一首、进度条拖拽
- **歌词同步** - 三行滚动字幕，当前句高亮发光效果

### 🤖 AI 电台
- **智能推荐** - 基于 DeepSeek AI 分析用户音乐品味
- **个性化节目** - 根据时间段（早晨/下午/晚上/深夜）推荐
- **新歌发现** - 推荐风格相似但不在喜欢列表中的歌曲
- **精准匹配** - 搜索时优先匹配艺术家名，避免播放错误版本
- **上下文缓存** - 首次加载后缓存音乐库，提升性能
- **推荐历史** - 避免重复推荐相同歌曲
- **无限续播** - 节目结束自动获取新推荐

### 💬 AI 音乐助手（新功能）
- **智能对话** - 自然语言控制播放器，无需记忆命令
- **Function Calling** - AI 自动识别意图并执行操作
- **11 种功能**：
  - 播放歌曲："播放周杰伦的晴天"
  - 播放控制："暂停"、"继续"、"下一首"、"上一首"
  - 搜索歌曲："搜索林俊杰"
  - 信息查询："现在播的是什么"
  - 音量控制："音量调到 80"
  - 收藏管理："收藏这首歌"
  - 电台控制："开启 AI 电台"、"停止电台"
- **聊天记录** - 自动保存到本地文件，支持历史回顾
- **TTS 播报** - AI 回复可选语音播报

### 🎙️ 语音播报
- **歌曲介绍** - AI 生成歌曲背景故事（50-80字）
- **智能降噪** - 播报时歌曲音量自动降低 70%，播报完恢复
- **介绍缓存** - 同一首歌的介绍只生成一次
- **Fish Audio TTS** - 高质量语音合成

### 🎧 网易云音乐集成
- **二维码登录** - 扫码快速登录
- **音乐库访问** - 获取喜欢列表、搜索歌曲、播放链接
- **歌词获取** - 自动加载并同步显示歌词
- **喜欢同步** - 点击红心同步到网易云账号

### 🌐 网络访问
- **局域网访问** - 支持同一 WiFi 下其他设备访问
- **跨设备使用** - 手机、平板、电脑均可访问

## 🛠️ 技术栈

### 前端
- **Vue 3** - Composition API + TypeScript
- **Vite** - 快速构建工具
- **SCSS** - 样式预处理器
- **Font Awesome** - 图标库

### 后端
- **Express.js** - Node.js 服务器
- **NeteaseCloudMusicApi** - 网易云音乐 API
- **DeepSeek API** - AI 推荐引擎 + 智能对话
- **Fish Audio API** - 语音合成服务

## 📦 安装

```bash
# 克隆项目
git clone https://github.com/yourusername/mymusicai.git
cd mymusicai

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入你的 API keys
```

## 🔑 环境变量配置

在 `.env` 文件中配置以下变量：

```env
# Fish Audio TTS API
FISH_API_KEY=your_fish_audio_api_key
FISH_VOICE_ID=your_fish_audio_voice_id

# DeepSeek API
DEEPSEEK_API_KEY=your_deepseek_api_key
```

### 获取 API Keys

- **Fish Audio**: https://fish.audio
- **DeepSeek**: https://platform.deepseek.com

## 🚀 运行

```bash
# 启动后端服务器（端口 3001）
cd server
node proxy.mjs

# 启动前端开发服务器（端口 5173）
npm run dev
```

访问地址：
- **本地**: `http://localhost:5173`
- **局域网**: `http://192.168.x.x:5173`（显示在终端）

## 📱 使用说明

### 1. 登录网易云音乐
- 点击右上角登录按钮
- 使用网易云音乐 App 扫描二维码

### 2. 开始电台
- 登录后点击"开始电台"按钮
- AI 会分析你的音乐品味并推荐歌曲
- 首次加载会缓存你的喜欢列表（最多 200 首）

### 3. 播放控制
- 点击播放/暂停按钮控制播放
- 点击上一首/下一首切换歌曲
- 拖动进度条跳转播放位置

### 4. 歌曲介绍
- 点击左上角"歌曲介绍"按钮
- AI 会生成并播报歌曲背景故事
- 播报时歌曲音量自动降低

### 5. AI 音乐助手（新功能）
- 点击爱心右侧的聊天图标打开对话框
- 用自然语言控制播放器：
  - "播放周杰伦的晴天"
  - "暂停"
  - "下一首"
  - "现在播的是什么"
  - "音量调到 50"
  - "搜索林俊杰"
  - "开启 AI 电台"
- 开启"自动播报"可让 AI 回复语音播报
- 聊天记录自动保存到本地

### 6. 喜欢歌曲
- 点击红心按钮收藏歌曲
- 自动同步到网易云音乐账号

## 🎨 界面预览

```
┌─────────────────────────────┐
│  🎵 myMusicAI       👤      │  ← Header
├─────────────────────────────┤
│         12:34               │
│   Monday • May 30, 2026     │  ← Time Display
├─────────────────────────────┤
│  [歌曲介绍]                 │  ← TTS Button
│                             │
│      ╭─────────╮            │
│      │ ◉ Cover │            │  ← Rotating Cover
│      ╰─────────╯            │     + Volume Ring
│                             │
│      Song Title             │
│      Artist Name            │
│                             │
│   上一句歌词                │
│   当前歌词 (高亮)           │  ← Lyrics Marquee
│   下一句歌词                │
│                             │
│   0:00 ━━━━━━━━━━ 3:45     │  ← Progress Bar
│                             │
│    ⏮️   ▶️   ⏭️   ❤️   💬   │  ← Controls + Chat
└─────────────────────────────┘
```

## 📂 项目结构

```
mymusicai/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   └── Header.vue           # 顶部栏
│   │   ├── ChatDialog.vue           # AI 聊天对话框
│   │   ├── LoginModal.vue           # 登录弹窗
│   │   ├── MusicPlayerNew.vue       # 音乐播放器
│   │   └── TimeDisplay.vue          # 时间显示
│   ├── composables/
│   │   ├── useChat.ts               # AI 聊天逻辑
│   │   ├── useMusic.ts              # 网易云音乐 API
│   │   ├── usePlayer.ts             # 音频播放控制
│   │   ├── useRadio.ts              # AI 电台逻辑
│   │   ├── useTTS.ts                # 语音合成
│   │   └── useTheme.ts              # 主题管理
│   ├── types/
│   │   ├── chat.ts                  # 聊天类型定义
│   │   └── music.ts                 # 音乐类型定义
│   ├── utils/
│   │   └── anthropic.ts             # AI API 调用
│   ├── App.vue                      # 根组件
│   └── main.ts                      # 入口文件
├── server/
│   ├── proxy.mjs                    # 后端服务器
│   └── tts.mjs                      # TTS 路由
├── chat_history.json                # 聊天记录（自动生成）
├── .env                             # 环境变量
├── .env.example                     # 环境变量示例
└── package.json                     # 依赖配置
```

## 🔧 API 端点

### 音乐相关
- `GET /music/login/qr/key` - 获取登录二维码 key
- `GET /music/login/qr/create` - 生成二维码
- `GET /music/login/qr/check` - 检查扫码状态
- `GET /music/likelist` - 获取喜欢列表
- `GET /music/search` - 搜索歌曲
- `GET /music/song/url` - 获取播放链接
- `GET /music/song/detail` - 获取歌曲详情
- `GET /music/lyric` - 获取歌词
- `POST /music/like` - 喜欢/取消喜欢歌曲

### AI 相关
- `POST /api/v1/messages` - AI 电台节目规划
- `POST /api/song-intro` - 生成歌曲介绍
- `POST /api/chat/message` - AI 聊天对话（支持 Function Calling）
- `POST /api/chat/save` - 保存聊天记录
- `GET /api/chat/load` - 加载聊天记录

### TTS 相关
- `POST /tts/tts` - 文本转语音
- `GET /tts/voices` - 获取可用音色列表

## ⚠️ 注意事项

1. **Fish Audio 余额** - TTS 功能需要 Fish Audio 账户有余额
2. **代理配置** - Fish Audio API 需要配置代理（默认 `http://127.0.0.1:7890`）
3. **浏览器兼容** - 推荐使用 Chrome/Edge 浏览器以获得最佳体验
4. **网易云登录** - 需要使用网易云音乐 App 扫码登录
5. **局域网访问** - 确保设备在同一 WiFi 下，防火墙允许端口 5173 和 3001

## 🎯 特色功能

- **智能对话控制** - 自然语言操作播放器，无需记忆命令
- **Function Calling** - AI 自动识别意图并执行 11 种操作
- **智能推荐算法** - 基于用户音乐品味的个性化推荐
- **精准歌曲匹配** - 优先匹配艺术家名，避免播放错误版本
- **上下文缓存优化** - 减少 API 调用，提升性能
- **无缝续播** - 电台永不停歇
- **沉浸式体验** - 封面主色调背景 + 音量可视化
- **歌词同步** - 精准到秒的歌词高亮
- **语音介绍** - AI 生成 + TTS 播报的智能解说
- **聊天记录持久化** - 自动保存到本地文件

## 📄 License

MIT

## 🙏 致谢

- [NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi) - 网易云音乐 API
- [Fish Audio](https://fish.audio) - 语音合成服务
- [DeepSeek](https://www.deepseek.com) - AI 推荐引擎 + 智能对话
