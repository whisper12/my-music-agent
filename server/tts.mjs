import express from 'express'
import dotenv from 'dotenv'
import { ProxyAgent, request } from 'undici'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 从项目根目录加载 .env
dotenv.config({ path: join(__dirname, '..', '.env') })

const router = express.Router()

const FISH_API_KEY = process.env.FISH_API_KEY || ''
const FISH_VOICE_ID = process.env.FISH_VOICE_ID || ''
const FISH_API_URL = 'https://api.fish.audio/v1/tts'
const PROXY_URL = process.env.HTTP_PROXY || process.env.HTTPS_PROXY || 'http://127.0.0.1:7890'
const proxyAgent = new ProxyAgent(PROXY_URL)

console.log(`[TTS] Using proxy: ${PROXY_URL}`)

// 文本转语音
router.post('/tts', async (req, res) => {
  const { text, voice_id } = req.body

  if (!FISH_API_KEY) {
    return res.status(500).json({ error: 'Fish Audio API key not configured. Set FISH_API_KEY in .env' })
  }

  if (!text) {
    return res.status(400).json({ error: 'Text is required' })
  }

  const voiceId = voice_id || FISH_VOICE_ID

  if (!voiceId) {
    return res.status(400).json({ error: 'Voice ID is required. Set FISH_VOICE_ID in .env or pass voice_id in request' })
  }

  console.log(`[TTS] Text: "${text.substring(0, 50)}..." Voice: ${voiceId}`)
  console.log(`[TTS] API URL: ${FISH_API_URL}`)

  try {
    const payload = {
      text,
      reference_id: voiceId,
      format: 'mp3',
      latency: 'normal'
    }

    console.log(`[TTS] Request payload:`, JSON.stringify(payload))

    const { statusCode, headers, body } = await request(FISH_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FISH_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      dispatcher: proxyAgent
    })

    console.log(`[TTS] Response status: ${statusCode}`)

    if (statusCode !== 200) {
      const chunks = []
      for await (const chunk of body) {
        chunks.push(chunk)
      }
      const error = Buffer.concat(chunks).toString()
      console.error('[TTS] Error response:', error)
      return res.status(statusCode).json({ error: `Fish Audio error: ${error}` })
    }

    // 返回音频流
    res.setHeader('Content-Type', 'audio/mpeg')
    const chunks = []
    for await (const chunk of body) {
      chunks.push(chunk)
    }
    const buffer = Buffer.concat(chunks)
    res.send(buffer)
    console.log(`[TTS] Success, audio size: ${buffer.byteLength} bytes`)
  } catch (error) {
    console.error('[TTS] Request error:', error)
    console.error('[TTS] Error stack:', error.stack)
    console.error('[TTS] Error cause:', error.cause)
    res.status(500).json({ error: `Network error: ${error.message}` })
  }
})

// 获取可用音色列表
router.get('/voices', async (req, res) => {
  if (!FISH_API_KEY) {
    return res.status(500).json({ error: 'Fish Audio API key not configured' })
  }

  try {
    const { statusCode, body } = await request('https://api.fish.audio/model', {
      headers: {
        'Authorization': `Bearer ${FISH_API_KEY}`
      },
      dispatcher: proxyAgent
    })

    if (statusCode !== 200) {
      return res.status(statusCode).json({ error: 'Failed to fetch voices' })
    }

    const chunks = []
    for await (const chunk of body) {
      chunks.push(chunk)
    }
    const data = JSON.parse(Buffer.concat(chunks).toString())
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
