<template>
  <header class="header">
    <div class="logo">
      <font-awesome-icon :icon="['fas', 'music']" />
      <span>MusicAI</span>
    </div>
    <ThemeToggle />
  </header>
</template>

<script setup lang="ts">
import ThemeToggle from '@components/common/ThemeToggle.vue'
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  .logo {
    font-size: 20px;
    font-weight: 700;
    color: var(--color-text-primary);
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

[data-theme="dark"] .header {
  background: rgba(0, 0, 0, 0.2);
}
</style>
