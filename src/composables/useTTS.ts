import { ref } from 'vue'

const isSpeaking = ref(false)
const currentAudio = ref<HTMLAudioElement | null>(null)

export function useTTS() {
  // 文本转语音并播放
  const speak = async (text: string) => {
    if (isSpeaking.value && currentAudio.value) {
      currentAudio.value.pause()
      currentAudio.value = null
      isSpeaking.value = false
      return
    }

    isSpeaking.value = true

    try {
      const response = await fetch('/tts/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('TTS error:', error)
        isSpeaking.value = false
        return
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)

      currentAudio.value = new Audio(url)
      currentAudio.value.addEventListener('ended', () => {
        isSpeaking.value = false
        URL.revokeObjectURL(url)
        currentAudio.value = null
      })
      currentAudio.value.addEventListener('error', () => {
        isSpeaking.value = false
        URL.revokeObjectURL(url)
        currentAudio.value = null
      })

      await currentAudio.value.play()
    } catch (error) {
      console.error('TTS error:', error)
      isSpeaking.value = false
    }
  }

  // 停止播放
  const stop = () => {
    if (currentAudio.value) {
      currentAudio.value.pause()
      currentAudio.value = null
    }
    isSpeaking.value = false
  }

  return {
    isSpeaking,
    speak,
    stop
  }
}
