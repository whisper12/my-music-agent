<template>
  <div class="time-display">
    <div class="time">{{ currentTime }}</div>
    <div class="date-info">
      <span class="weekday">{{ currentWeekday }}</span>
      <span class="separator">•</span>
      <span class="date">{{ currentDate }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const currentTime = ref('')
const currentWeekday = ref('')
const currentDate = ref('')

let timer: number | null = null

const updateTime = () => {
  const now = new Date()

  // Format time: HH:MM
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  currentTime.value = `${hours}:${minutes}`

  // Format weekday
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  currentWeekday.value = weekdays[now.getDay()]

  // Format date: Month Day, Year
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December']
  const month = months[now.getMonth()]
  const day = now.getDate()
  const year = now.getFullYear()
  currentDate.value = `${month} ${day}, ${year}`
}

onMounted(() => {
  updateTime()
  timer = window.setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style lang="scss" scoped>
.time-display {
  padding: 24px 20px;
  text-align: center;
  background: rgba(255, 255, 255, 0.03);

  .time {
    font-size: 56px;
    font-weight: 300;
    color: var(--color-text-primary);
    letter-spacing: -2px;
    margin-bottom: 8px;
    font-variant-numeric: tabular-nums;
  }

  .date-info {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 14px;
    color: var(--color-text-secondary);

    .separator {
      opacity: 0.5;
    }

    .weekday,
    .date {
      font-weight: 500;
    }
  }
}
</style>
