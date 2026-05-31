<template>
  <div class="chat-area">
    <div class="messages-container" ref="messagesRef">
      <div v-for="message in messages" :key="message.id" class="message-wrapper">
        <div v-if="message.role === 'assistant'" class="message message-ai">
          <div class="avatar">
            <font-awesome-icon :icon="['fas', 'robot']" />
          </div>
          <div class="message-content">
            <div class="message-text">{{ message.content }}</div>
            <button v-if="message.audio" class="voice-btn" :class="{ speaking: isSpeaking }" @click="playVoice(message.id)">
              <font-awesome-icon :icon="['fas', 'volume-high']" />
            </button>
          </div>
        </div>

        <div v-else class="message message-user">
          <div class="message-content">
            <div class="message-text">{{ message.content }}</div>
          </div>
          <div class="avatar">
            <font-awesome-icon :icon="['fas', 'user']" />
          </div>
        </div>
      </div>
    </div>

    <div class="input-area">
      <textarea
        v-model="inputText"
        class="input"
        placeholder="Type a message..."
        rows="1"
        :disabled="isLoading"
        @keydown="handleKeydown"
        @input="adjustHeight"
        ref="textareaRef"
      />
      <button class="send-btn" :disabled="!inputText.trim() || isLoading" @click="sendMessage">
        <font-awesome-icon :icon="['fas', 'paper-plane']" :spin="isLoading" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useChat } from '@composables/useChat'
import { useTTS } from '@composables/useTTS'

const { messages, isLoading, sendMessage: send } = useChat()
const { isSpeaking, speak } = useTTS()

const inputText = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const messagesRef = ref<HTMLElement | null>(null)

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

const sendMessage = async () => {
  const content = inputText.value.trim()
  if (content && !isLoading.value) {
    inputText.value = ''
    nextTick(() => {
      if (textareaRef.value) {
        textareaRef.value.style.height = 'auto'
      }
    })

    await send(content)
    scrollToBottom()
  }
}

const adjustHeight = () => {
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto'
      textareaRef.value.style.height = textareaRef.value.scrollHeight + 'px'
    }
  })
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight
    }
  })
}

const playVoice = (messageId: string) => {
  const message = messages.value.find(m => m.id === messageId)
  if (message) {
    speak(message.content)
  }
}
</script>

<style lang="scss" scoped>
.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.02);
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-wrapper {
  display: flex;
  animation: fadeIn 0.3s ease;
}

.message {
  display: flex;
  gap: 8px;
  max-width: 85%;

  .avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    svg {
      font-size: 16px;
      color: var(--color-text-secondary);
    }
  }

  .message-content {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .message-text {
    padding: 10px 14px;
    border-radius: 12px;
    font-size: 14px;
    line-height: 1.5;
    word-wrap: break-word;
  }

  .voice-btn {
    align-self: flex-start;
    padding: 6px 12px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    cursor: pointer;
    transition: all var(--transition-fast);

    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    svg {
      font-size: 14px;
      color: var(--color-text-primary);
    }
  }

  &.message-ai {
    align-self: flex-start;

    .message-text {
      background: rgba(255, 255, 255, 0.1);
      color: var(--color-text-primary);
    }
  }

  &.message-user {
    align-self: flex-end;
    flex-direction: row-reverse;

    .message-text {
      background: var(--color-accent);
      color: white;
    }
  }
}

.input-area {
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  gap: 8px;
  align-items: flex-end;

  .input {
    flex: 1;
    padding: 10px 12px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.05);
    color: var(--color-text-primary);
    font-size: 14px;
    line-height: 1.5;
    resize: none;
    max-height: 100px;
    overflow-y: auto;
    font-family: inherit;

    &::placeholder {
      color: var(--color-text-tertiary);
    }

    &:focus {
      outline: none;
      border-color: var(--color-accent);
      background: rgba(255, 255, 255, 0.08);
    }
  }

  .send-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--color-accent);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all var(--transition-fast);
    flex-shrink: 0;

    &:hover:not(:disabled) {
      background: var(--color-accent-hover);
      transform: scale(1.05);
    }

    &:active:not(:disabled) {
      transform: scale(0.95);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    svg {
      font-size: 16px;
      color: white;
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

[data-theme="dark"] {
  .input-area {
    background: rgba(0, 0, 0, 0.2);
  }
}
</style>
