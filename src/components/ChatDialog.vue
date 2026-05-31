<template>
  <div class="chat-dialog-wrapper" v-if="isOpen">
    <!-- 背景遮罩 -->
    <div class="chat-overlay" @click="$emit('close')"></div>

    <!-- 对话框 -->
    <div class="chat-dialog">
      <!-- 头部 -->
      <div class="chat-header">
        <h3>AI 音乐助手</h3>
        <div class="header-controls">
          <label class="auto-tts-toggle">
            <input type="checkbox" v-model="autoPlayTTS" />
            <span>自动播报</span>
          </label>
          <button class="close-btn" @click="$emit('close')">
            <i class="fa fa-times"></i>
          </button>
        </div>
      </div>

      <!-- 消息列表 -->
      <div class="messages-container" ref="messagesContainer">
        <div
          v-for="message in messages"
          :key="message.id"
          class="message"
          :class="message.role"
        >
          <div class="message-content">
            <p>{{ message.content }}</p>
            <!-- AI 回复的 TTS 播报按钮 -->
            <button
              v-if="message.role === 'assistant'"
              class="tts-btn"
              @click="playTTS(message.content)"
              :disabled="isSpeaking"
            >
              <i class="fa fa-volume-up"></i>
              {{ isSpeaking ? '播报中...' : '播报' }}
            </button>
          </div>
          <span class="message-time">{{ formatTime(message.timestamp) }}</span>
        </div>
      </div>

      <!-- 输入框 -->
      <div class="input-container">
        <input
          type="text"
          v-model="inputText"
          placeholder="输入消息..."
          @keyup.enter="sendMessage"
          :disabled="isLoading"
        />
        <button @click="sendMessage" :disabled="isLoading || !inputText.trim()">
          <i class="fa fa-paper-plane"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useChat } from '@/composables/useChat'
import { useTTS } from '@/composables/useTTS'

defineProps<{
  isOpen: boolean
}>()

defineEmits<{
  close: []
}>()

const { messages, isLoading, sendMessage: sendChatMessage } = useChat()
const { speak, isSpeaking } = useTTS()

const inputText = ref('')
const autoPlayTTS = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)

// 发送消息
const sendMessage = async () => {
  if (!inputText.value.trim() || isLoading.value) return

  const message = inputText.value
  inputText.value = ''

  await sendChatMessage(message)

  // 滚动到底部
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// 播放 TTS
const playTTS = (text: string) => {
  speak(text)
}

// 监听新消息，自动播报
watch(
  () => messages.value.length,
  () => {
    if (autoPlayTTS.value && messages.value.length > 0) {
      const lastMessage = messages.value[messages.value.length - 1]
      if (lastMessage.role === 'assistant') {
        nextTick(() => {
          speak(lastMessage.content)
        })
      }
    }

    // 滚动到底部
    nextTick(() => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    })
  }
)

// 格式化时间
const formatTime = (date: Date) => {
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}
</script>

<style scoped lang="scss">
.chat-dialog-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.chat-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.chat-dialog {
  position: relative;
  width: 100%;
  max-width: 600px;
  height: 70vh;
  max-height: 600px;
  background: rgba(30, 30, 30, 0.95);
  border-radius: 20px 20px 0 0;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.chat-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;

  h3 {
    margin: 0;
    color: white;
    font-size: 1.1rem;
  }

  .header-controls {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .auto-tts-toggle {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
    cursor: pointer;

    input[type='checkbox'] {
      cursor: pointer;
    }
  }

  .close-btn {
    background: none;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    opacity: 0.7;
    transition: opacity 0.2s;

    &:hover {
      opacity: 1;
    }
  }
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
  }
}

.message {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  &.user {
    align-items: flex-end;

    .message-content {
      background: rgba(100, 150, 255, 0.3);
      border-radius: 12px 12px 0 12px;
    }
  }

  &.assistant {
    align-items: flex-start;

    .message-content {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 12px 12px 12px 0;
    }
  }

  .message-content {
    max-width: 80%;
    padding: 0.75rem 1rem;
    color: white;

    p {
      margin: 0 0 0.5rem 0;
      line-height: 1.5;
      word-wrap: break-word;
    }

    .tts-btn {
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: white;
      padding: 0.4rem 0.8rem;
      border-radius: 8px;
      font-size: 0.85rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      transition: all 0.2s;

      &:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.25);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      i {
        font-size: 0.9rem;
      }
    }
  }

  .message-time {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.5);
    padding: 0 0.5rem;
  }
}

.input-container {
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  gap: 0.75rem;

  input {
    flex: 1;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    padding: 0.75rem 1rem;
    color: white;
    font-size: 0.95rem;

    &::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }

    &:focus {
      outline: none;
      border-color: rgba(255, 255, 255, 0.4);
    }
  }

  button {
    background: rgba(100, 150, 255, 0.3);
    border: 1px solid rgba(100, 150, 255, 0.5);
    color: white;
    padding: 0.75rem 1.25rem;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover:not(:disabled) {
      background: rgba(100, 150, 255, 0.5);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    i {
      font-size: 1rem;
    }
  }
}
</style>
