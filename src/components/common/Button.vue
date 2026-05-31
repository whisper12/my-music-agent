<template>
  <button
    class="btn"
    :class="[`btn-${variant}`, `btn-${size}`, { 'btn-block': block, 'btn-loading': loading, 'btn-disabled': disabled }]"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <span v-if="loading" class="btn-spinner">⏳</span>
    <slot />
  </button>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'small' | 'medium' | 'large'
  block?: boolean
  loading?: boolean
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'medium',
  block: false,
  loading: false,
  disabled: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const handleClick = (event: MouseEvent) => {
  emit('click', event)
}
</script>

<style lang="scss" scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: var(--radius-md);
  font-weight: 500;
  transition: all var(--transition-fast);
  cursor: pointer;
  border: 1px solid transparent;

  &:active:not(.btn-disabled):not(.btn-loading) {
    transform: scale(0.98);
  }

  &.btn-disabled,
  &.btn-loading {
    cursor: not-allowed;
    opacity: 0.6;
  }

  // Variants
  &.btn-primary {
    background-color: var(--color-accent);
    color: white;

    &:hover:not(.btn-disabled):not(.btn-loading) {
      background-color: var(--color-accent-hover);
    }
  }

  &.btn-secondary {
    background-color: var(--color-bg-secondary);
    color: var(--color-text-primary);
    border-color: var(--color-border);

    &:hover:not(.btn-disabled):not(.btn-loading) {
      background-color: var(--color-bg-hover);
      border-color: var(--color-border-hover);
    }
  }

  &.btn-danger {
    background-color: var(--color-error);
    color: white;

    &:hover:not(.btn-disabled):not(.btn-loading) {
      opacity: 0.9;
    }
  }

  &.btn-ghost {
    background-color: transparent;
    color: var(--color-text-primary);

    &:hover:not(.btn-disabled):not(.btn-loading) {
      background-color: var(--color-bg-hover);
    }
  }

  // Sizes
  &.btn-small {
    padding: 6px 12px;
    font-size: 13px;
  }

  &.btn-medium {
    padding: 10px 20px;
    font-size: 14px;
  }

  &.btn-large {
    padding: 14px 28px;
    font-size: 16px;
  }

  &.btn-block {
    width: 100%;
  }

  .btn-spinner {
    animation: spin 1s linear infinite;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
