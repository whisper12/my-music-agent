import { ref } from 'vue'
import { useMusic } from './useMusic'
import { usePlayer } from './usePlayer'
import { useTTS } from './useTTS'

interface Song {
  song: string
  artist: string
  reason: string
}

interface RadioProgram {
  title: string
  opening: string
  playlist: Song[]
  segues: string[]
  closing: string
}

const isPlaying = ref(false)
const currentProgram = ref<RadioProgram | null>(null)
const currentSegment = ref('')
const programStatus = ref<'idle' | 'loading' | 'playing' | 'error'>('idle')
const musicContext = ref<string>('')  // 缓存用户音乐上下文
const isContextLoaded = ref(false)    // 是否已加载上下文
const currentSongIndex = ref(0)       // 当前播放的歌曲索引
const isRadioMode = ref(false)        // 是否处于电台模式
const recommendedHistory = ref<Set<string>>(new Set())  // 已推荐过的歌曲（歌名-艺术家）

export function useRadio() {
  const { isLoggedIn, getLikeList, getSongDetail, uid, cookie, searchSongs } = useMusic()
  const { playByKeyword, audio, playById } = usePlayer()
  const { speak, stop: stopTTS } = useTTS()

  // 获取并缓存用户音乐上下文（只执行一次）
  const loadMusicContext = async () => {
    if (isContextLoaded.value) {
      console.log('[Radio] Using cached context')
      return musicContext.value
    }

    console.log('[Radio] Loading music context for the first time...')

    if (!isLoggedIn.value) {
      console.log('[Radio] User not logged in')
      return ''
    }

    try {
      const likeList = await getLikeList(uid.value, cookie.value)
      console.log('[Radio] Like list:', likeList)

      if (likeList && likeList.ids && likeList.ids.length > 0) {
        console.log('[Radio] Found', likeList.ids.length, 'liked songs')

        // 获取所有喜欢的歌曲详情（分批获取，每次50首）
        const allSongs: any[] = []
        const batchSize = 50
        const totalBatches = Math.ceil(Math.min(likeList.ids.length, 200) / batchSize)

        for (let i = 0; i < totalBatches; i++) {
          const start = i * batchSize
          const end = Math.min(start + batchSize, likeList.ids.length)
          const batchIds = likeList.ids.slice(start, end).join(',')

          console.log(`[Radio] Fetching batch ${i + 1}/${totalBatches}...`)
          const songDetails = await getSongDetail(batchIds, cookie.value)

          if (songDetails && songDetails.length > 0) {
            allSongs.push(...songDetails)
          }
        }

        if (allSongs.length > 0) {
          const songList = allSongs.map((song: any) =>
            `${song.name} - ${song.ar.map((a: any) => a.name).join(', ')}`
          ).join('; ')

          musicContext.value = songList
          isContextLoaded.value = true

          console.log(`[Radio] Context loaded: ${allSongs.length} songs`)
          console.log('[Radio] Preview:', songList.substring(0, 200))

          return songList
        }
      }
    } catch (error) {
      console.error('[Radio] Failed to load context:', error)
    }

    return ''
  }

  // 请求 DJ 规划节目
  const planProgram = async (): Promise<RadioProgram> => {
    const likedSongs = await loadMusicContext()

    const response = await fetch('/api/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        context: {
          likedSongs,
          recommendedHistory: Array.from(recommendedHistory.value)
        }
      })
    })

    if (!response.ok) {
      throw new Error('Failed to plan radio program')
    }

    const data = await response.json()
    const program = data.program

    // 记录推荐的歌曲到历史
    program.playlist.forEach((song: Song) => {
      recommendedHistory.value.add(`${song.song}-${song.artist}`)
    })

    return program
  }

  // 播放 DJ 台词（TTS）
  const speakSegment = async (text: string) => {
    currentSegment.value = text
    await speak(text)
  }

  // 播放整个节目
  const playProgram = async () => {
    if (!isLoggedIn.value) {
      alert('请先登录网易云音乐')
      return
    }

    programStatus.value = 'loading'
    currentSegment.value = '正在规划节目...'
    isPlaying.value = true
    isRadioMode.value = true

    try {
      // 无限循环播放
      while (isPlaying.value) {
        // 1. 规划节目
        const program = await planProgram()
        currentProgram.value = program
        currentSongIndex.value = 0
        programStatus.value = 'playing'

        console.log('[Radio] Program planned:', program.title)

        // 2. 开场白
        await speakSegment(program.opening)

        // 3. 播放歌曲 + 串场
        for (let i = 0; i < program.playlist.length; i++) {
          if (!isPlaying.value) break  // 用户停止了电台

          currentSongIndex.value = i
          const song = program.playlist[i]

          // 播放歌曲（只搜索并播放第一个结果，不加入整个搜索列表）
          currentSegment.value = `正在播放：${song.song} - ${song.artist}`

          const songs = await searchSongs(`${song.song} ${song.artist}`)
          if (songs.length > 0) {
            // 优先匹配艺术家名完全一致的歌曲
            const matchedSong = songs.find((s: any) =>
              s.artists?.some((a: any) =>
                a.name.toLowerCase().includes(song.artist.toLowerCase()) ||
                song.artist.toLowerCase().includes(a.name.toLowerCase())
              )
            ) || songs[0]

            await playById(String(matchedSong.id))
          }

          // 等待歌曲播放完成
          await waitForSongEnd()

          if (!isPlaying.value) break  // 用户停止了电台

          // 串场词（如果不是最后一首）
          if (i < program.playlist.length - 1 && program.segues[i]) {
            await speakSegment(program.segues[i])
          }
        }

        if (!isPlaying.value) break  // 用户停止了电台

        // 继续下一个节目（无缝衔接，不播放结束语）
        console.log('[Radio] Program ended, planning next...')
      }

      programStatus.value = 'idle'
      currentSegment.value = '电台已停止'
      isRadioMode.value = false

    } catch (error) {
      console.error('[Radio] Error:', error)
      programStatus.value = 'error'
      currentSegment.value = '节目出错，请重试'
      isPlaying.value = false
      isRadioMode.value = false
    }
  }

  // 播放下一首（手动切换）
  const playNextSong = async () => {
    if (!isRadioMode.value || !currentProgram.value) return

    const nextIndex = currentSongIndex.value + 1

    // 如果还有下一首，播放下一首
    if (nextIndex < currentProgram.value.playlist.length) {
      currentSongIndex.value = nextIndex
      const song = currentProgram.value.playlist[nextIndex]

      currentSegment.value = `正在播放：${song.song} - ${song.artist}`
      const songs = await searchSongs(`${song.song} ${song.artist}`)
      if (songs.length > 0) {
        // 优先匹配艺术家名完全一致的歌曲
        const matchedSong = songs.find((s: any) =>
          s.artists?.some((a: any) =>
            a.name.toLowerCase().includes(song.artist.toLowerCase()) ||
            song.artist.toLowerCase().includes(a.name.toLowerCase())
          )
        ) || songs[0]

        await playById(String(matchedSong.id))
      }
    } else {
      // 没有下一首了，获取新的推荐
      console.log('[Radio] End of playlist, fetching new recommendations...')
      currentSegment.value = '正在获取新的推荐...'

      const program = await planProgram()
      currentProgram.value = program
      currentSongIndex.value = 0

      const song = program.playlist[0]
      currentSegment.value = `正在播放：${song.song} - ${song.artist}`

      const songs = await searchSongs(`${song.song} ${song.artist}`)
      if (songs.length > 0) {
        const firstSong = songs[0]
        await playById(String(firstSong.id))
      }
    }
  }

  // 播放上一首（手动切换）
  const playPreviousSong = async () => {
    if (!isRadioMode.value || !currentProgram.value) return

    const prevIndex = currentSongIndex.value - 1

    // 如果有上一首，播放上一首
    if (prevIndex >= 0) {
      currentSongIndex.value = prevIndex
      const song = currentProgram.value.playlist[prevIndex]

      currentSegment.value = `正在播放：${song.song} - ${song.artist}`
      const songs = await searchSongs(`${song.song} ${song.artist}`)
      if (songs.length > 0) {
        // 优先匹配艺术家名完全一致的歌曲
        const matchedSong = songs.find((s: any) =>
          s.artists?.some((a: any) =>
            a.name.toLowerCase().includes(song.artist.toLowerCase()) ||
            song.artist.toLowerCase().includes(a.name.toLowerCase())
          )
        ) || songs[0]

        await playById(String(matchedSong.id))
      }
    }
  }

  // 等待歌曲播放结束
  const waitForSongEnd = (): Promise<void> => {
    return new Promise((resolve) => {
      if (!audio.value) {
        resolve()
        return
      }

      const onEnded = () => {
        audio.value?.removeEventListener('ended', onEnded)
        resolve()
      }

      audio.value.addEventListener('ended', onEnded)
    })
  }

  // 停止电台
  const stopRadio = () => {
    isPlaying.value = false
    isRadioMode.value = false
    programStatus.value = 'idle'
    stopTTS()
    if (audio.value) {
      audio.value.pause()
    }
  }

  // 清除缓存（用于刷新音乐库）
  const clearCache = () => {
    musicContext.value = ''
    isContextLoaded.value = false
    console.log('[Radio] Cache cleared')
  }

  return {
    isPlaying,
    currentProgram,
    currentSegment,
    programStatus,
    isContextLoaded,
    isRadioMode,
    currentSongIndex,
    playProgram,
    playNextSong,
    playPreviousSong,
    stopRadio,
    clearCache
  }
}
