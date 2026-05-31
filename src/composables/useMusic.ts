import { ref } from 'vue'

const cookie = ref(localStorage.getItem('netease_cookie') || '')
const uid = ref(localStorage.getItem('netease_uid') || '')
const isLoggedIn = ref(!!cookie.value)
const userProfile = ref<any>(null)

export function useMusic() {
  // 获取二维码 key
  const getQrKey = async () => {
    const res = await fetch('/music/login/qr/key')
    const data = await res.json()
    return data.data?.unikey || ''
  }

  // 生成二维码图片
  const getQrImage = async (key: string) => {
    const res = await fetch(`/music/login/qr/create?key=${key}`)
    const data = await res.json()
    return data.data?.qrimg || ''
  }

  // 检查扫码状态 (800=过期, 801=等待, 802=待确认, 803=成功)
  const checkQrStatus = async (key: string) => {
    const res = await fetch(`/music/login/qr/check?key=${key}`)
    const data = await res.json()
    if (data.code === 803 && data.cookie) {
      cookie.value = data.cookie
      localStorage.setItem('netease_cookie', data.cookie)
      isLoggedIn.value = true
      await fetchUserProfile()
    }
    return data
  }

  // 获取用户信息
  const fetchUserProfile = async () => {
    const res = await fetch(`/music/login/status?cookie=${encodeURIComponent(cookie.value)}`)
    const data = await res.json()
    if (data.data?.profile) {
      userProfile.value = data.data.profile
      uid.value = String(data.data.profile.userId)
      localStorage.setItem('netease_uid', uid.value)
    }
    return data
  }

  // 获取用户歌单
  const getUserPlaylists = async () => {
    if (!uid.value) return []
    const res = await fetch(`/music/playlist?uid=${uid.value}&cookie=${encodeURIComponent(cookie.value)}`)
    const data = await res.json()
    return data.playlist || []
  }

  // 获取歌单详情
  const getPlaylistDetail = async (id: string) => {
    const res = await fetch(`/music/playlist/detail?id=${id}&cookie=${encodeURIComponent(cookie.value)}`)
    const data = await res.json()
    return data.playlist || null
  }

  // 获取喜欢列表
  const getLikeList = async (userId?: string, userCookie?: string) => {
    const targetUid = userId || uid.value
    const targetCookie = userCookie || cookie.value

    if (!targetUid) return { ids: [] }

    const res = await fetch(`/music/likelist?uid=${targetUid}&cookie=${encodeURIComponent(targetCookie)}`)
    const data = await res.json()
    return data
  }

  // 搜索歌曲
  const searchSongs = async (keywords: string) => {
    const res = await fetch(`/music/search?keywords=${encodeURIComponent(keywords)}&cookie=${encodeURIComponent(cookie.value)}`)
    const data = await res.json()
    return data.result?.songs || []
  }

  // 获取播放链接
  const getSongUrl = async (id: string) => {
    const res = await fetch(`/music/song/url?id=${id}&cookie=${encodeURIComponent(cookie.value)}`)
    const data = await res.json()
    return data.data?.[0]?.url || ''
  }

  // 获取歌曲详情
  const getSongDetail = async (ids: string) => {
    const res = await fetch(`/music/song/detail?ids=${ids}&cookie=${encodeURIComponent(cookie.value)}`)
    const data = await res.json()
    return data.songs || []
  }

  // 获取歌词
  const getLyric = async (id: string) => {
    const res = await fetch(`/music/lyric?id=${id}&cookie=${encodeURIComponent(cookie.value)}`)
    const data = await res.json()
    return data.lrc?.lyric || ''
  }

  // 喜欢/取消喜欢歌曲
  const likeSong = async (id: string, like: boolean) => {
    const res = await fetch('/music/like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, like, cookie: cookie.value })
    })
    const data = await res.json()
    return data
  }

  // 退出登录
  const logout = () => {
    cookie.value = ''
    uid.value = ''
    isLoggedIn.value = false
    userProfile.value = null
    localStorage.removeItem('netease_cookie')
    localStorage.removeItem('netease_uid')
  }

  return {
    cookie,
    uid,
    isLoggedIn,
    userProfile,
    getQrKey,
    getQrImage,
    checkQrStatus,
    fetchUserProfile,
    getUserPlaylists,
    getPlaylistDetail,
    getLikeList,
    searchSongs,
    getSongUrl,
    getSongDetail,
    getLyric,
    likeSong,
    logout
  }
}
