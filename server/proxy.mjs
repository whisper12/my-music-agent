import express from 'express'
import cors from 'cors'
import NeteaseApi from 'NeteaseCloudMusicApi'
import ttsRouter from './tts.mjs'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 从项目根目录加载 .env
dotenv.config({ path: join(__dirname, '..', '.env') })

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())
app.use('/tts', ttsRouter)

// ==================== 网易云音乐 API ====================

// 二维码登录 - 获取 key
app.get('/music/login/qr/key', async (req, res) => {
  try {
    const result = await NeteaseApi.login_qr_key({})
    res.json(result.body)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 二维码登录 - 生成二维码
app.get('/music/login/qr/create', async (req, res) => {
  const { key } = req.query
  try {
    const result = await NeteaseApi.login_qr_create({ key, qrimg: true })
    res.json(result.body)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 二维码登录 - 检查扫码状态
app.get('/music/login/qr/check', async (req, res) => {
  const { key } = req.query
  try {
    const result = await NeteaseApi.login_qr_check({ key })
    res.json(result.body)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 检查登录状态
app.get('/music/login/status', async (req, res) => {
  const { cookie } = req.query
  try {
    const result = await NeteaseApi.login_status({ cookie: cookie || '' })
    res.json(result.body)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 手机号登录
app.post('/music/login', async (req, res) => {
  const { phone, password } = req.body
  try {
    const result = await NeteaseApi.login_cellphone({ phone, password })
    res.json(result.body)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 获取用户歌单
app.get('/music/playlist', async (req, res) => {
  const { uid, cookie } = req.query
  try {
    const result = await NeteaseApi.user_playlist({ uid, cookie: cookie || '' })
    res.json(result.body)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 获取歌单详情（歌曲列表）
app.get('/music/playlist/detail', async (req, res) => {
  const { id, cookie } = req.query
  try {
    const result = await NeteaseApi.playlist_detail({ id, cookie: cookie || '' })
    res.json(result.body)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 获取歌曲播放链接
app.get('/music/song/url', async (req, res) => {
  const { id, cookie } = req.query
  try {
    const result = await NeteaseApi.song_url({ id, cookie: cookie || '' })
    res.json(result.body)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 搜索歌曲
app.get('/music/search', async (req, res) => {
  const { keywords, cookie } = req.query
  try {
    const result = await NeteaseApi.search({ keywords, cookie: cookie || '' })
    res.json(result.body)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 获取用户喜欢的音乐列表
app.get('/music/likelist', async (req, res) => {
  const { uid, cookie } = req.query
  try {
    const result = await NeteaseApi.likelist({ uid, cookie: cookie || '' })
    res.json(result.body)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 获取歌曲详情
app.get('/music/song/detail', async (req, res) => {
  const { ids, cookie } = req.query
  try {
    const result = await NeteaseApi.song_detail({ ids, cookie: cookie || '' })
    res.json(result.body)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 获取歌词
app.get('/music/lyric', async (req, res) => {
  const { id, cookie } = req.query
  try {
    const result = await NeteaseApi.lyric({ id, cookie: cookie || '' })
    res.json(result.body)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 喜欢音乐
app.post('/music/like', async (req, res) => {
  const { id, like, cookie } = req.body
  try {
    const result = await NeteaseApi.like({ id, like, cookie: cookie || '' })
    res.json(result.body)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ==================== AI DJ 电台 ====================

app.post('/api/v1/messages', async (req, res) => {
  const { context } = req.body || {}

  if (!context) {
    return res.status(400).json({ error: { message: 'No context provided' } })
  }

  // 构建 DJ 节目规划 prompt
  const now = new Date()
  const hour = now.getHours()
  const timeOfDay = hour < 6 ? '深夜' : hour < 12 ? '早晨' : hour < 18 ? '下午' : '晚上'

  console.log('[DJ] Context received:', {
    hasLikedSongs: !!context.likedSongs,
    likedSongsLength: context.likedSongs?.length || 0,
    preview: context.likedSongs?.substring(0, 100),
    recommendedHistoryCount: context.recommendedHistory?.length || 0
  })

  const recommendedHistoryText = context.recommendedHistory && context.recommendedHistory.length > 0
    ? `\n\n已推荐过的歌曲（不要再推荐）：\n${context.recommendedHistory.join('; ')}`
    : ''

  const djPrompt = `你是 Claudio FM 的 AI DJ。现在是${timeOfDay} ${hour}:${now.getMinutes()}。

用户音乐上下文：
${context.likedSongs ? `喜欢的歌曲：\n${context.likedSongs.substring(0, 3000)}` : '用户尚未登录，无法获取音乐偏好'}${recommendedHistoryText}

你的任务：
1. 仔细分析用户喜欢的歌曲，识别音乐风格、艺术家偏好、语言偏好、情感倾向
2. 根据用户品味和当前时间（${timeOfDay}），推荐 20 首**新歌**（绝对不能是用户喜欢列表中已有的歌曲）
3. 推荐策略：
   - 如果用户喜欢某个艺术家，推荐该艺术家的**其他作品**（不在列表中的）
   - 推荐风格相似的**其他艺术家**的歌曲
   - 推荐同类型、同情感的**新歌**
   - 优先推荐近几年的新歌或冷门好歌
   - 保持风格多样性，不要全部推荐同一个艺术家

返回格式（严格 JSON，不要有其他文字）：
{
  "title": "节目标题（如：午后抒情新发现）",
  "opening": "开场白（30-50字，提到用户的音乐品味特点，说明会推荐新歌）",
  "playlist": [
    {"song": "歌名", "artist": "艺术家", "reason": "为什么推荐（15字内）"},
    {"song": "歌名", "artist": "艺术家", "reason": "理由"}
  ],
  "segues": [
    "第1首和第2首之间的串场词（20字内）",
    "第2首和第3首之间的串场词"
  ],
  "closing": "结束语（20-30字）"
}

重要规则（必须严格遵守）：
- **绝对禁止推荐用户喜欢列表中已有的歌曲**
- **每次推荐都要尽量不同，避免重复推荐相同的歌曲**
- 推荐的新歌必须和用户品味相符（风格、语言、情感）
- 可以推荐用户喜欢的艺术家的其他作品（但不能是列表中已有的）
- 可以推荐风格相似的新艺术家
- 根据时间调整：早晨轻快、下午舒缓、晚上放松、深夜安静
- 只返回 JSON，不要任何解释

示例（假设用户喜欢 Taylor Swift 的 "Shake It Off"）：
✅ 正确：推荐 Taylor Swift 的 "Anti-Hero"（其他作品）
✅ 正确：推荐 Olivia Rodrigo 的 "good 4 u"（相似风格的其他艺术家）
❌ 错误：推荐 Taylor Swift 的 "Shake It Off"（已在喜欢列表中）

现在开始规划：`

  console.log(`[DJ] Planning radio show for ${timeOfDay}...`)

  try {
    // 使用 DeepSeek API（支持 JSON 模式）
    const deepseekKey = process.env.DEEPSEEK_API_KEY

    console.log('[DJ] DeepSeek API key:', deepseekKey ? `${deepseekKey.substring(0, 10)}...` : 'NOT SET')

    if (!deepseekKey || deepseekKey === 'sk-your-deepseek-key-here') {
      console.log('[DJ] No DeepSeek API key, using fallback')
      throw new Error('No DeepSeek API key configured')
    }

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${deepseekKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that returns only valid JSON. No explanations, no markdown, just pure JSON.'
          },
          {
            role: 'user',
            content: djPrompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('[DJ] DeepSeek API error:', error)
      throw new Error(`DeepSeek API error: ${response.status}`)
    }

    const data = await response.json()
    console.log('[DJ] Full DeepSeek response:', JSON.stringify(data, null, 2))

    const result = data.choices?.[0]?.message?.content || ''

    console.log(`[DJ] Raw response length: ${result.length}`)
    console.log(`[DJ] Raw response content:`, result)

    // 解析 JSON
    const program = JSON.parse(result)
    console.log(`[DJ] Parsed program:`, JSON.stringify(program, null, 2))

    res.json({
      id: `msg_${Date.now()}`,
      type: 'radio_program',
      program
    })
  } catch (error) {
    console.error('[DJ] Error:', error.message)
    console.log('[DJ] Using fallback program based on user likes')

    // 从用户喜欢列表中随机选择歌曲作为备用
    let fallbackPlaylist = [
      { song: "Blinding Lights", artist: "The Weeknd", reason: "热门新歌推荐" },
      { song: "Levitating", artist: "Dua Lipa", reason: "流行新曲" },
      { song: "Good 4 U", artist: "Olivia Rodrigo", reason: "新人力作" }
    ]

    // 如果有用户喜欢的歌曲，分析风格后推荐相似新歌
    if (context.likedSongs) {
      const songs = context.likedSongs.split('; ').slice(0, 10)
      console.log('[DJ] Fallback: analyzing user taste from', songs.length, 'songs')
      // 这里可以根据用户喜欢的艺术家推荐相似歌曲
      // 暂时使用通用流行歌曲作为 fallback
    }

    const fallbackProgram = {
      title: `${timeOfDay}音乐时光`,
      opening: `欢迎收听 Claudio FM，现在是${timeOfDay}，为您带来精选音乐。`,
      playlist: fallbackPlaylist,
      segues: fallbackPlaylist.slice(0, -1).map(() => "接下来继续为您播放"),
      closing: "感谢收听，期待下次与您相遇"
    }

    res.json({
      id: `msg_${Date.now()}`,
      type: 'radio_program',
      program: fallbackProgram
    })
  }
})

// ==================== 歌曲介绍 API ====================

app.post('/api/song-intro', async (req, res) => {
  const { song, artist } = req.body || {}

  if (!song || !artist) {
    return res.status(400).json({ error: { message: 'Missing song or artist' } })
  }

  console.log(`[Intro] Generating intro for: ${song} - ${artist}`)

  try {
    const deepseekKey = process.env.DEEPSEEK_API_KEY

    if (!deepseekKey) {
      throw new Error('No DeepSeek API key configured')
    }

    const introPrompt = `你是一位音乐电台主播。请为以下歌曲生成一段简短的介绍（50-80字）：

歌曲：${song}
艺术家：${artist}

要求：
1. 介绍歌曲的创作背景、有趣的故事或特点
2. 语气轻松自然，像电台主播在聊天
3. 50-80字，不要太长
4. 直接返回介绍文字，不要其他内容

示例：
"这首歌是 Taylor Swift 在 2014 年发行的，灵感来自她搬到纽约的经历。轻快的旋律配上她标志性的叙事风格，让人仿佛置身于纽约街头。"

现在开始：`

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${deepseekKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that generates concise music introductions.'
          },
          {
            role: 'user',
            content: introPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 200
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('[Intro] DeepSeek API error:', error)
      throw new Error(`DeepSeek API error: ${response.status}`)
    }

    const data = await response.json()
    const intro = data.choices?.[0]?.message?.content || ''

    console.log('[Intro] Generated:', intro)

    res.json({ intro: intro.trim() })
  } catch (error) {
    console.error('[Intro] Error:', error.message)
    res.json({
      intro: `${song}，由 ${artist} 演唱，是一首非常动听的歌曲。`
    })
  }
})

// ==================== 聊天记录管理 ====================

import fs from 'fs'
import path from 'path'

const CHAT_HISTORY_FILE = path.join(__dirname, '..', 'chat_history.json')

// AI 聊天对话
app.post('/api/chat/message', async (req, res) => {
  const { messages } = req.body || {}

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: { message: 'No messages provided' } })
  }

  console.log('[Chat] Received', messages.length, 'messages')

  try {
    const deepseekKey = process.env.DEEPSEEK_API_KEY

    if (!deepseekKey) {
      throw new Error('No DeepSeek API key configured')
    }

    // 定义可用的工具
    const tools = [
      {
        type: 'function',
        function: {
          name: 'play_song',
          description: '播放指定的歌曲。用户说"播放XXX"、"我想听XXX"、"放一首XXX"时调用',
          parameters: {
            type: 'object',
            properties: {
              song: { type: 'string', description: '歌曲名称' },
              artist: { type: 'string', description: '艺术家名称（可选）' }
            },
            required: ['song']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'pause_music',
          description: '暂停当前播放的音乐。用户说"暂停"、"停一下"时调用'
        }
      },
      {
        type: 'function',
        function: {
          name: 'resume_music',
          description: '继续播放音乐。用户说"继续"、"播放"时调用'
        }
      },
      {
        type: 'function',
        function: {
          name: 'next_song',
          description: '切换到下一首歌。用户说"下一首"、"切歌"、"换一首"时调用'
        }
      },
      {
        type: 'function',
        function: {
          name: 'previous_song',
          description: '返回上一首歌。用户说"上一首"、"回到上一首"时调用'
        }
      },
      {
        type: 'function',
        function: {
          name: 'search_song',
          description: '搜索歌曲。用户说"搜索XXX"、"找一下XXX"时调用',
          parameters: {
            type: 'object',
            properties: {
              keyword: { type: 'string', description: '搜索关键词' }
            },
            required: ['keyword']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'get_current_song',
          description: '获取当前正在播放的歌曲信息。用户问"现在播的是什么"、"这是什么歌"时调用'
        }
      },
      {
        type: 'function',
        function: {
          name: 'set_volume',
          description: '设置音量。用户说"音量调到XX"、"声音大一点/小一点"时调用',
          parameters: {
            type: 'object',
            properties: {
              volume: {
                type: 'number',
                description: '音量值，0-100之间的整数',
                minimum: 0,
                maximum: 100
              }
            },
            required: ['volume']
          }
        }
      },
      {
        type: 'function',
        function: {
          name: 'toggle_like',
          description: '收藏或取消收藏当前歌曲。用户说"喜欢这首歌"、"收藏"、"取消收藏"时调用'
        }
      },
      {
        type: 'function',
        function: {
          name: 'start_radio',
          description: '启动 AI 电台，根据用户喜好推荐并播放歌曲。用户说"开启电台"、"AI 电台"、"推荐一些歌"时调用'
        }
      },
      {
        type: 'function',
        function: {
          name: 'stop_radio',
          description: '停止 AI 电台。用户说"停止电台"、"关闭电台"时调用'
        }
      }
    ]

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${deepseekKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `你是一个智能音乐助手，可以帮助用户控制音乐播放器。

你可以：
- 播放、暂停、切歌
- 搜索歌曲
- 调节音量
- 收藏歌曲
- 启动/停止 AI 电台

当用户要求执行操作时，调用相应的工具。回复要简洁友好，中文回复。`
          },
          ...messages
        ],
        tools,
        temperature: 0.7,
        max_tokens: 500
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('[Chat] DeepSeek API error:', error)
      throw new Error(`DeepSeek API error: ${response.status}`)
    }

    const data = await response.json()
    const message = data.choices?.[0]?.message

    console.log('[Chat] Response:', JSON.stringify(message, null, 2))

    // 检查是否有工具调用
    if (message.tool_calls && message.tool_calls.length > 0) {
      res.json({
        content: [{ type: 'text', text: message.content || '' }],
        tool_calls: message.tool_calls
      })
    } else {
      res.json({
        content: [{ type: 'text', text: message.content || 'Sorry, I could not generate a response.' }]
      })
    }
  } catch (error) {
    console.error('[Chat] Error:', error.message)
    res.status(500).json({
      error: { message: error.message }
    })
  }
})

// 保存聊天记录
app.post('/api/chat/save', async (req, res) => {
  try {
    const { messages } = req.body
    fs.writeFileSync(CHAT_HISTORY_FILE, JSON.stringify(messages, null, 2), 'utf-8')
    console.log('[Chat] History saved:', messages.length, 'messages')
    res.json({ success: true })
  } catch (error) {
    console.error('[Chat] Save error:', error)
    res.status(500).json({ error: error.message })
  }
})

// 加载聊天记录
app.get('/api/chat/load', async (req, res) => {
  try {
    if (fs.existsSync(CHAT_HISTORY_FILE)) {
      const data = fs.readFileSync(CHAT_HISTORY_FILE, 'utf-8')
      const messages = JSON.parse(data)
      console.log('[Chat] History loaded:', messages.length, 'messages')
      res.json({ messages })
    } else {
      console.log('[Chat] No history file found')
      res.json({ messages: [] })
    }
  } catch (error) {
    console.error('[Chat] Load error:', error)
    res.status(500).json({ error: error.message })
  }
})

// ==================== 启动服务 ====================

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ MusicAI Server running at:`)
  console.log(`  - Local:   http://localhost:${PORT}`)
  console.log(`  - Network: http://0.0.0.0:${PORT}`)
  console.log(`  Routes:`)
  console.log(`    POST /api/v1/messages   → AI Chat`)
  console.log(`    POST /api/song-intro    → Song Introduction`)
  console.log(`    POST /tts/tts           → Fish Audio TTS`)
  console.log(`    GET  /tts/voices        → Available voices`)
  console.log(`    POST /music/login       → 网易云登录`)
  console.log(`    GET  /music/playlist    → 用户歌单`)
  console.log(`    GET  /music/playlist/detail → 歌单详情`)
  console.log(`    GET  /music/song/url    → 播放链接`)
  console.log(`    GET  /music/song/detail → 歌曲详情`)
  console.log(`    GET  /music/search      → 搜索`)
  console.log(`    GET  /music/likelist    → 喜欢列表`)
  console.log(`    GET  /music/lyric       → 歌词`)
  console.log(`    POST /music/like        → 喜欢歌曲`)
})
