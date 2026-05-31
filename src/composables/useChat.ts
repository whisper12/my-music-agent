import { ref, watch } from 'vue'
import type { Message } from '@/types/chat'
import { sendMessageToAI, type ToolCall } from '@/utils/anthropic'
import { usePlayer } from './usePlayer'
import { useMusic } from './useMusic'
import { useRadio } from './useRadio'

// 从服务器加载聊天记录
const loadChatHistory = async (): Promise<Message[]> => {
  try {
    const response = await fetch('/api/chat/load')
    const data = await response.json()

    if (data.messages && data.messages.length > 0) {
      // 转换 timestamp 字符串回 Date 对象
      return data.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }))
    }
  } catch (error) {
    console.error('Failed to load chat history:', error)
  }

  // 默认欢迎消息
  return [
    {
      id: '1',
      role: 'assistant',
      content: '你好！我是你的 AI 音乐助手。我可以帮你播放音乐、搜索歌曲、控制播放器。试试说"播放周杰伦的晴天"或"下一首"！',
      timestamp: new Date()
    }
  ]
}

const messages = ref<Message[]>([])
const isLoading = ref(false)
const isHistoryLoaded = ref(false)

// 初始化加载聊天记录
loadChatHistory().then(history => {
  messages.value = history
  isHistoryLoaded.value = true
})

// 保存聊天记录到服务器
const saveChatHistory = async () => {
  try {
    await fetch('/api/chat/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: messages.value })
    })
    console.log('[Chat] History saved to server')
  } catch (error) {
    console.error('Failed to save chat history:', error)
  }
}

// 监听消息变化，自动保存到服务器（防抖）
let saveTimeout: number | null = null
watch(
  messages,
  () => {
    if (!isHistoryLoaded.value) return // 初始加载时不保存

    if (saveTimeout) clearTimeout(saveTimeout)
    saveTimeout = setTimeout(() => {
      saveChatHistory()
    }, 1000) as unknown as number // 1秒后保存
  },
  { deep: true }
)

export function useChat() {
  const { playByKeyword, pause, resume, next, previous, currentTrack, isPlaying, volume } = usePlayer()
  const { searchSongs, toggleLike } = useMusic()
  const { playProgram, stopRadio, isRadioMode } = useRadio()

  // 执行工具调用
  const executeToolCall = async (toolCall: ToolCall): Promise<string> => {
    const { name, arguments: argsStr } = toolCall.function
    const args = argsStr ? JSON.parse(argsStr) : {}

    console.log('[Chat] Executing tool:', name, args)

    try {
      switch (name) {
        case 'play_song':
          await playByKeyword(`${args.song} ${args.artist || ''}`.trim())
          return `正在播放：${args.song}${args.artist ? ' - ' + args.artist : ''}`

        case 'pause_music':
          pause()
          return '已暂停播放'

        case 'resume_music':
          resume()
          return '继续播放'

        case 'next_song':
          next()
          return '已切换到下一首'

        case 'previous_song':
          previous()
          return '已返回上一首'

        case 'search_song':
          const results = await searchSongs(args.keyword)
          if (results.length > 0) {
            const topResults = results.slice(0, 5).map((s: any) =>
              `${s.name} - ${s.artists.map((a: any) => a.name).join(', ')}`
            ).join('\n')
            return `搜索到 ${results.length} 首歌曲，前 5 个结果：\n${topResults}`
          }
          return `没有找到"${args.keyword}"相关的歌曲`

        case 'get_current_song':
          if (currentTrack.value) {
            return `当前播放：${currentTrack.value.title} - ${currentTrack.value.artist}\n状态：${isPlaying.value ? '播放中' : '已暂停'}`
          }
          return '当前没有播放歌曲'

        case 'set_volume':
          const newVolume = Math.max(0, Math.min(100, args.volume)) / 100
          volume.value = newVolume
          return `音量已设置为 ${args.volume}%`

        case 'toggle_like':
          await toggleLike()
          return '已切换收藏状态'

        case 'start_radio':
          playProgram()
          return '正在启动 AI 电台...'

        case 'stop_radio':
          stopRadio()
          return '已停止 AI 电台'

        default:
          return `未知的操作：${name}`
      }
    } catch (error) {
      console.error('[Chat] Tool execution error:', error)
      return `执行失败：${error instanceof Error ? error.message : '未知错误'}`
    }
  }

  const sendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    }

    messages.value.push(userMessage)
    isLoading.value = true

    try {
      // 准备发送给 AI 的消息历史
      const chatHistory = messages.value.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }))

      // 调用 AI API
      const aiResponse = await sendMessageToAI(chatHistory)

      // 处理工具调用
      let responseText = aiResponse.text
      if (aiResponse.toolCalls && aiResponse.toolCalls.length > 0) {
        const toolResults: string[] = []

        for (const toolCall of aiResponse.toolCalls) {
          const result = await executeToolCall(toolCall)
          toolResults.push(result)
        }

        // 组合 AI 回复和工具执行结果
        if (toolResults.length > 0) {
          responseText = toolResults.join('\n')
          if (aiResponse.text) {
            responseText = `${aiResponse.text}\n\n${responseText}`
          }
        }
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText || '好的',
        timestamp: new Date()
      }

      messages.value.push(assistantMessage)
    } catch (error) {
      console.error('Error sending message:', error)

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '抱歉，出现了错误。请重试。',
        timestamp: new Date()
      }

      messages.value.push(errorMessage)
    } finally {
      isLoading.value = false
    }
  }

  const clearMessages = () => {
    messages.value = [{
      id: '1',
      role: 'assistant',
      content: '聊天已清空！有什么可以帮你的吗？',
      timestamp: new Date()
    }]
  }

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages
  }
}
