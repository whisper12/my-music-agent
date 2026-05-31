<template>
  <div class="login-modal" v-if="!isLoggedIn">
    <div class="login-card">
      <h3>登录网易云音乐</h3>
      <p class="desc">扫码登录以获取你的音乐数据</p>

      <div class="qr-container" v-if="qrImage">
        <img :src="qrImage" alt="QR Code" class="qr-image" />
        <p class="qr-status">{{ statusText }}</p>
      </div>

      <div class="loading" v-else>
        <p>加载二维码中...</p>
      </div>

      <button class="refresh-btn" @click="initQr">
        <font-awesome-icon :icon="['fas', 'rotate-right']" v-if="expired" />
        {{ expired ? '刷新二维码' : '重新获取' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useMusic } from '@composables/useMusic'

const { isLoggedIn, getQrKey, getQrImage, checkQrStatus } = useMusic()

const qrImage = ref('')
const qrKey = ref('')
const statusText = ref('请使用网易云音乐 APP 扫码')
const expired = ref(false)
let pollTimer: number | null = null

const initQr = async () => {
  expired.value = false
  statusText.value = '请使用网易云音乐 APP 扫码'

  qrKey.value = await getQrKey()
  if (qrKey.value) {
    qrImage.value = await getQrImage(qrKey.value)
    startPolling()
  }
}

const startPolling = () => {
  if (pollTimer) clearInterval(pollTimer)

  pollTimer = window.setInterval(async () => {
    if (!qrKey.value) return

    const result = await checkQrStatus(qrKey.value)

    if (result.code === 800) {
      statusText.value = '二维码已过期，请刷新'
      expired.value = true
      if (pollTimer) clearInterval(pollTimer)
    } else if (result.code === 801) {
      statusText.value = '请使用网易云音乐 APP 扫码'
    } else if (result.code === 802) {
      statusText.value = '扫码成功，请在手机上确认'
    } else if (result.code === 803) {
      statusText.value = '登录成功！'
      if (pollTimer) clearInterval(pollTimer)
    }
  }, 2000)
}

onMounted(() => {
  if (!isLoggedIn.value) {
    initQr()
  }
})

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
})
</script>

<style lang="scss" scoped>
.login-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.login-card {
  background: var(--color-bg-primary);
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  max-width: 320px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);

  h3 {
    font-size: 20px;
    color: var(--color-text-primary);
    margin-bottom: 8px;
  }

  .desc {
    font-size: 14px;
    color: var(--color-text-secondary);
    margin-bottom: 24px;
  }
}

.qr-container {
  .qr-image {
    width: 200px;
    height: 200px;
    border-radius: 8px;
    margin-bottom: 12px;
  }

  .qr-status {
    font-size: 13px;
    color: var(--color-text-secondary);
  }
}

.loading {
  padding: 40px;
  color: var(--color-text-secondary);
}

.refresh-btn {
  margin-top: 16px;
  padding: 10px 20px;
  border-radius: 8px;
  background: var(--color-accent);
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all var(--transition-fast);
  display: inline-flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: var(--color-accent-hover);
  }
}
</style>
