<template>
  <div class="input-wrapper" :class="{ 'input-disabled': disabled, 'input-error': error }">
    <label v-if="label" class="input-label">{{ label }}</label>
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      class="input"
      @input="handleInput"
      @blur="handleBlur"
      @focus="handleFocus"
    />
    <span v-if="error" class="input-error-message">{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string
  type?: string
  label?: string
  placeholder?: string
  disabled?: boolean
  error?: string
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

const handleBlur = (event: FocusEvent) => {
  emit('blur', event)
}

const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
}
</script>

<style lang="scss" scoped>
.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 6px;

  &.input-disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .input-label {
    font-size: 14px;
    font-weight: 500;
    color: var(--color-text-primary);
  }

  .input {
    padding: 10px 14px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background-color: var(--color-bg-primary);
    color: var(--color-text-primary);
    font-size: 14px;
    transition: all var(--transition-fast);

    &::placeholder {
      color: var(--color-text-tertiary);
    }

    &:focus {
      outline: none;
      border-color: var(--color-accent);
      box-shadow: 0 0 0 3px var(--color-accent-light);
    }

    &:disabled {
      cursor: not-allowed;
      background-color: var(--color-bg-secondary);
    }
  }

  &.input-error .input {
    border-color: var(--color-error);

    &:focus {
      box-shadow: 0 0 0 3px rgba(245, 34, 45, 0.1);
    }
  }

  .input-error-message {
    font-size: 12px;
    color: var(--color-error);
  }
}
</style>
