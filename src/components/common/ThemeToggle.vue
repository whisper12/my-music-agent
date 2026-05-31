<template>
  <button class="theme-toggle" @click="toggleTheme" :title="currentTheme === 'light' ? '切换到深色模式' : '切换到浅色模式'">
    <font-awesome-icon :icon="['fas', currentTheme === 'light' ? 'moon' : 'sun']" />
  </button>
</template>

<script setup lang="ts">
import { useTheme } from '@composables/useTheme'

const { currentTheme, toggleTheme } = useTheme()
</script>

<style lang="scss" scoped>
.theme-toggle {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  cursor: pointer;

  &:hover {
    background-color: var(--color-bg-hover);
    border-color: var(--color-border-hover);
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    font-size: 18px;
    color: var(--color-text-primary);
  }
}
</style>
