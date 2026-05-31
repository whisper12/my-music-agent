import { ref, computed, watch } from 'vue'
import type { Track } from '@/types/music'
import { useMusic } from './useMusic'
import { useTTS } from './useTTS'

const { getSongUrl, getSongDetail, searchSongs } = useMusic()
const { isSpeaking } = useTTS()

const audio = ref<HTMLAudioElement | null>(null)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(0.8)
const baseVolume = ref(0.8) // 基础音量（用户设置的音量）
const currentTrack = ref<Track | null>(null)
const playlist = ref<Track[]>([])
const currentIndex = ref(-1)

// 监听 TTS 播放状态，自动调整音量
watch(isSpeaking, (speaking) => {
  if (audio.value) {
    if (speaking) {
      // TTS 播放时降低音乐音量
      audio.value.volume = baseVolume.value * 0.3
    } else {
      // TTS 停止时恢复音乐音量
      audio.value.volume = baseVolume.value
    }
  }
})

export function usePlayer() {
  // 初始化 audio 元素
  const initAudio = () => {
    if (!audio.value) {
      audio.value = new Audio()
      audio.value.volume = volume.value

      audio.value.addEventListener('timeupdate', () => {
        currentTime.value = audio.value!.currentTime
      })

      audio.value.addEventListener('loadedmetadata', () => {
        duration.value = audio.value!.duration
      })

      audio.value.addEventListener('ended', () => {
        next()
      })

      audio.value.addEventListener('play', () => {
        isPlaying.value = true
      })

      audio.value.addEventListener('pause', () => {
        isPlaying.value = false
      })
    }
  }

  // 播放指定歌曲
  const playTrack = async (track: Track) => {
    initAudio()

    let url = track.url
    if (!url) {
      url = await getSongUrl(track.id)
    }

    if (!url) {
      console.error('No playback URL for track:', track.title)
      return
    }

    currentTrack.value = { ...track, url }
    audio.value!.src = url
    audio.value!.play()

    // 更新 playlist index
    const idx = playlist.value.findIndex(t => t.id === track.id)
    if (idx >= 0) currentIndex.value = idx
  }

  // 通过歌曲 ID 播放
  const playById = async (id: string) => {
    const details = await getSongDetail(id)
    if (details.length > 0) {
      const song = details[0]
      const track: Track = {
        id: String(song.id),
        title: song.name,
        artist: song.ar?.map((a: any) => a.name).join(', ') || 'Unknown',
        album: song.al?.name || 'Unknown',
        cover: song.al?.picUrl || '',
        duration: Math.floor((song.dt || 0) / 1000),
        url: ''
      }
      await playTrack(track)
    }
  }

  // 搜索并播放第一首
  const playByKeyword = async (keyword: string) => {
    const songs = await searchSongs(keyword)
    if (songs.length > 0) {
      const song = songs[0]
      const track: Track = {
        id: String(song.id),
        title: song.name,
        artist: song.artists?.map((a: any) => a.name).join(', ') || 'Unknown',
        album: song.album?.name || 'Unknown',
        cover: song.album?.artist?.img1v1Url || '',
        duration: Math.floor((song.duration || 0) / 1000),
        url: ''
      }

      // 把搜索结果加入播放列表
      playlist.value = songs.map((s: any) => ({
        id: String(s.id),
        title: s.name,
        artist: s.artists?.map((a: any) => a.name).join(', ') || 'Unknown',
        album: s.album?.name || 'Unknown',
        cover: s.album?.artist?.img1v1Url || '',
        duration: Math.floor((s.duration || 0) / 1000),
        url: ''
      }))

      currentIndex.value = 0
      await playTrack(track)
    }
  }

  // 播放/暂停
  const togglePlay = () => {
    if (!audio.value) return
    if (isPlaying.value) {
      audio.value.pause()
    } else {
      audio.value.play()
    }
  }

  // 上一曲
  const previous = () => {
    if (playlist.value.length === 0) return
    currentIndex.value = (currentIndex.value - 1 + playlist.value.length) % playlist.value.length
    playTrack(playlist.value[currentIndex.value])
  }

  // 下一曲
  const next = () => {
    if (playlist.value.length === 0) return
    currentIndex.value = (currentIndex.value + 1) % playlist.value.length
    playTrack(playlist.value[currentIndex.value])
  }

  // 跳转进度
  const seek = (percent: number) => {
    if (!audio.value) return
    audio.value.currentTime = duration.value * percent
  }

  // 设置音量
  const setVolume = (v: number) => {
    volume.value = v
    baseVolume.value = v
    if (audio.value) {
      // 如果 TTS 正在播放，应用降低后的音量
      audio.value.volume = isSpeaking.value ? v * 0.3 : v
    }
  }

  const progressPercent = computed(() => {
    if (duration.value === 0) return 0
    return (currentTime.value / duration.value) * 100
  })

  return {
    audio,
    isPlaying,
    currentTime,
    duration,
    volume,
    currentTrack,
    playlist,
    currentIndex,
    progressPercent,
    playTrack,
    playById,
    playByKeyword,
    togglePlay,
    previous,
    next,
    seek,
    setVolume
  }
}
