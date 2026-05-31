<template>
  <div class="music-player">
    <div class="album-cover">
      <img v-if="currentTrack?.cover" :src="currentTrack.cover" :alt="currentTrack.title" />
      <div v-else class="placeholder">
        <font-awesome-icon :icon="['fas', 'music']" />
      </div>
    </div>

    <div class="track-info">
      <div class="track-title">{{ currentTrack?.title || 'No track playing' }}</div>
      <div class="track-artist">{{ currentTrack?.artist || 'Select a song' }}</div>
    </div>

    <div class="progress-bar">
      <span class="time">{{ formatTime(currentTime) }}</span>
      <div class="progress-track" @click="handleSeek">
        <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
        <div class="progress-thumb" :style="{ left: progressPercent + '%' }"></div>
      </div>
      <span class="time">{{ formatTime(duration) }}</span>
    </div>

    <div class="controls">
      <button class="control-btn" @click="previous">
        <font-awesome-icon :icon="['fas', 'backward']" />
      </button>
      <button class="control-btn play-btn" @click="togglePlay">
        <font-awesome-icon :icon="['fas', isPlaying ? 'pause' : 'play']" />
      </button>
      <button class="control-btn" @click="next">
        <font-awesome-icon :icon="['fas', 'forward']" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePlayer } from '@composables/usePlayer'

const {
  isPlaying,
  currentTime,
  duration,
  currentTrack,
  progressPercent,
  togglePlay,
  previous,
  next,
  seek
} = usePlayer()

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const handleSeek = (event: MouseEvent) => {
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const percent = (event.clientX - rect.left) / rect.width
  seek(percent)
}
</script>

<style lang="scss" scoped>
.music-player {
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  background: rgba(255, 255, 255, 0.03);
}

.album-cover {
  width: 200px;
  height: 200px;
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
      font-size: 60px;
      opacity: 0.3;
      color: var(--color-text-tertiary);
    }
  }
}

.track-info {
  text-align: center;
  width: 100%;

  .track-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .track-artist {
    font-size: 14px;
    color: var(--color-text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.progress-bar {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;

  .time {
    font-size: 12px;
    color: var(--color-text-secondary);
    font-variant-numeric: tabular-nums;
    min-width: 36px;
  }

  .progress-track {
    flex: 1;
    height: 4px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
    position: relative;
    cursor: pointer;

    .progress-fill {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      background: var(--color-accent);
      border-radius: 2px;
      transition: width 0.1s linear;
    }

    .progress-thumb {
      position: absolute;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 12px;
      height: 12px;
      background: white;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      transition: left 0.1s linear;
    }
  }
}

.controls {
  display: flex;
  align-items: center;
  gap: 16px;

  .control-btn {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all var(--transition-fast);

    &:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: scale(1.05);
    }

    &:active {
      transform: scale(0.95);
    }

    svg {
      font-size: 18px;
      color: var(--color-text-primary);
    }

    &.play-btn {
      width: 56px;
      height: 56px;
      background: var(--color-accent);
      border: none;

      svg {
        font-size: 22px;
        color: white;
      }

      &:hover {
        background: var(--color-accent-hover);
      }
    }
  }
}
</style>
