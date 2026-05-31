<template>
  <div class="app">
    <div class="container">
      <Header />
      <TimeDisplay />
      <MusicPlayerNew />
    </div>
    <LoginModal />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import Header from '@components/layout/Header.vue'
import TimeDisplay from '@components/TimeDisplay.vue'
import MusicPlayerNew from '@components/MusicPlayerNew.vue'
import LoginModal from '@components/LoginModal.vue'
import { useTheme } from '@composables/useTheme'

const { initTheme } = useTheme()

onMounted(() => {
  initTheme()
})
</script>

<style lang="scss" scoped>
.app {
  position: relative;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  background: #1a1a1a;
}

.container {
  width: 100%;
  max-width: 600px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  @media (max-width: 600px) {
    max-width: 100%;
  }
}
</style>
