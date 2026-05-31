<template>
  <div class="album-cover">
    <img v-if="currentTrack" :src="currentTrack.cover" :alt="currentTrack.title" />
    <div v-else class="placeholder">
      <font-awesome-icon :icon="['fas', 'music']" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Track } from '@/types/music'

interface Props {
  currentTrack: Track | null
}

defineProps<Props>()
</script>

<style lang="scss" scoped>
.album-cover {
  width: 240px;
  height: 240px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  background: rgba(255, 255, 255, 0.05);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    svg {
      font-size: 80px;
      opacity: 0.3;
      color: var(--color-text-tertiary);
    }
  }
}
</style>
