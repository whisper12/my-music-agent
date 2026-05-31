<template>
  <div class="radio-control">
    <div class="radio-header">
      <h2>📻 Claudio FM</h2>
      <p class="subtitle">AI 私人电台</p>
    </div>

    <div class="radio-status">
      <div v-if="programStatus === 'idle'" class="status-idle">
        <font-awesome-icon :icon="['fas', 'radio']" class="radio-icon" />
        <p>按下播放，开始你的私人电台</p>
      </div>

      <div v-else-if="programStatus === 'loading'" class="status-loading">
        <font-awesome-icon :icon="['fas', 'spinner']" spin class="radio-icon" />
        <p>{{ currentSegment }}</p>
      </div>

      <div v-else-if="programStatus === 'playing'" class="status-playing">
        <div class="program-info">
          <h3>{{ currentProgram?.title }}</h3>
          <p class="segment">{{ currentSegment }}</p>
        </div>

        <div v-if="currentProgram" class="playlist">
          <div v-for="(song, index) in currentProgram.playlist" :key="index" class="song-item">
            <span class="song-number">{{ index + 1 }}</span>
            <div class="song-info">
              <div class="song-name">{{ song.song }}</div>
              <div class="song-artist">{{ song.artist }}</div>
            </div>
            <div class="song-reason">{{ song.reason }}</div>
          </div>
        </div>
      </div>

      <div v-else-if="programStatus === 'error'" class="status-error">
        <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="radio-icon" />
        <p>{{ currentSegment }}</p>
      </div>
    </div>

    <div class="radio-controls">
      <button
        v-if="!isPlaying"
        class="play-btn"
        @click="playProgram"
        :disabled="programStatus === 'loading'"
      >
        <font-awesome-icon :icon="['fas', 'play']" />
        <span>开始电台</span>
      </button>

      <button v-else class="stop-btn" @click="stopRadio">
        <font-awesome-icon :icon="['fas', 'stop']" />
        <span>停止电台</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRadio } from '@composables/useRadio'

const {
  isPlaying,
  currentProgram,
  currentSegment,
  programStatus,
  playProgram,
  stopRadio
} = useRadio()
</script>

<style lang="scss" scoped>
.radio-control {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.radio-header {
  text-align: center;

  h2 {
    font-size: 24px;
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0 0 8px 0;
  }

  .subtitle {
    font-size: 14px;
    color: var(--color-text-secondary);
    margin: 0;
  }
}

.radio-status {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
}

.status-idle,
.status-loading,
.status-error {
  text-align: center;

  .radio-icon {
    font-size: 48px;
    color: var(--color-text-secondary);
    margin-bottom: 16px;
  }

  p {
    font-size: 14px;
    color: var(--color-text-secondary);
    margin: 0;
  }
}

.status-playing {
  width: 100%;

  .program-info {
    text-align: center;
    margin-bottom: 20px;

    h3 {
      font-size: 18px;
      font-weight: 600;
      color: var(--color-text-primary);
      margin: 0 0 8px 0;
    }

    .segment {
      font-size: 14px;
      color: var(--color-accent);
      margin: 0;
    }
  }

  .playlist {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .song-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    transition: all var(--transition-fast);

    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .song-number {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--color-accent);
      color: white;
      border-radius: 50%;
      font-size: 12px;
      font-weight: 600;
      flex-shrink: 0;
    }

    .song-info {
      flex: 1;
      min-width: 0;

      .song-name {
        font-size: 14px;
        font-weight: 500;
        color: var(--color-text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .song-artist {
        font-size: 12px;
        color: var(--color-text-secondary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    .song-reason {
      font-size: 12px;
      color: var(--color-text-tertiary);
      flex-shrink: 0;
      max-width: 100px;
      text-align: right;
    }
  }
}

.radio-controls {
  display: flex;
  justify-content: center;

  button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 32px;
    border-radius: 24px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all var(--transition-fast);

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    svg {
      font-size: 18px;
    }
  }

  .play-btn {
    background: var(--color-accent);
    color: white;

    &:hover:not(:disabled) {
      background: var(--color-accent-hover);
      transform: scale(1.05);
    }
  }

  .stop-btn {
    background: rgba(255, 59, 48, 0.8);
    color: white;

    &:hover {
      background: rgba(255, 59, 48, 1);
      transform: scale(1.05);
    }
  }
}

[data-theme="dark"] {
  .radio-status {
    background: rgba(0, 0, 0, 0.3);
  }
}
</style>
