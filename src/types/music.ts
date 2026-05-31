export interface Track {
  id: string
  title: string
  artist: string
  album: string
  cover: string
  duration: number
  url: string
}

export interface PlayerState {
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  currentTrack: Track | null
}
