<template>
    <div class="music-player" :style="backgroundStyle">
        <!-- 背景模糊层 -->
        <div class="blur-background" :style="blurBackgroundStyle"></div>

        <!-- 主内容 -->
        <div class="player-content">
            <!-- TTS 播报按钮（左上角） -->
            <button v-if="currentTrack" class="tts-intro-btn" @click="playIntro" :disabled="isPlayingIntro">
                <i class="fa fa-volume-up"></i>
                <span>{{ isPlayingIntro ? "播报中..." : "歌曲介绍" }}</span>
            </button>

            <!-- 封面区域 -->
            <div class="cover-container">
                <!-- 音量动画外圈 -->
                <div class="volume-ring" :class="{ active: isPlaying }">
                    <svg viewBox="0 0 200 200">
                        <circle
                            cx="100"
                            cy="100"
                            r="90"
                            fill="none"
                            stroke="rgba(255, 255, 255, 0.3)"
                            stroke-width="2"
                            :stroke-dasharray="volumeCircumference"
                            :stroke-dashoffset="volumeOffset"
                            class="volume-circle"
                        />
                    </svg>
                </div>

                <!-- 封面 -->
                <div class="cover-wrapper" :class="{ rotating: isPlaying }">
                    <img
                        v-if="currentTrack?.cover"
                        :src="currentTrack.cover"
                        :alt="currentTrack.title"
                        class="cover-image"
                        @load="onCoverLoad"
                        crossorigin="anonymous"
                    />
                    <div v-else class="cover-placeholder">
                        <i class="fa fa-music"></i>
                    </div>
                </div>
            </div>

            <!-- 歌曲信息 -->
            <div class="song-info">
                <h2 class="song-title">{{ currentTrack?.title || "未播放" }}</h2>
                <p class="song-artist">{{ currentTrack?.artist || "-" }}</p>
            </div>

            <!-- 电台控制按钮（无歌曲播放时显示） -->
            <div v-if="!currentTrack" class="radio-start">
                <button class="start-radio-btn" @click="startRadio" :disabled="!isLoggedIn">
                    <i class="fa fa-radio"></i>
                    <span>{{ isLoggedIn ? "开始电台" : "请先登录" }}</span>
                </button>
            </div>

            <!-- 歌词滚动字幕（进度条上方） -->
            <div class="lyrics-marquee">
                <div class="lyrics-lines" :style="{ transform: `translateY(${lyricsTransform}px)` }">
                    <p v-if="currentLyricIndex > 0" class="lyric-line prev">
                        {{ lyrics[currentLyricIndex - 1]?.text || "" }}
                    </p>
                    <p class="lyric-line current">
                        {{ lyrics[currentLyricIndex]?.text || (currentTrack ? "♪" : "暂无歌词") }}
                    </p>
                    <p v-if="currentLyricIndex < lyrics.length - 1" class="lyric-line next">
                        {{ lyrics[currentLyricIndex + 1]?.text || "" }}
                    </p>
                </div>
            </div>

            <!-- 进度条 -->
            <div class="progress-section">
                <span class="time">{{ formatTime(currentTime) }}</span>
                <div class="progress-bar" @click="onProgressClick">
                    <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
                    <div class="progress-thumb" :style="{ left: progressPercent + '%' }"></div>
                </div>
                <span class="time">{{ formatTime(duration) }}</span>
            </div>

            <!-- 控制按钮 -->
            <div class="controls">
                <button class="control-btn" @click="handlePrevious">
                    <i class="fa fa-step-backward"></i>
                </button>

                <button class="control-btn play-btn" @click="togglePlay">
                    <i class="fa" :class="isPlaying ? 'fa-pause' : 'fa-play'"></i>
                </button>

                <button class="control-btn" @click="handleNext">
                    <i class="fa fa-step-forward"></i>
                </button>

                <button class="control-btn" :class="{ active: isLiked }" @click="toggleLike">
                    <i class="fa" :class="isLiked ? 'fa-heart' : 'fa-heart-o'"></i>
                </button>

                <button class="control-btn" @click="toggleChat">
                    <i class="fa fa-comments"></i>
                </button>
            </div>
        </div>

        <!-- 聊天对话框 -->
        <ChatDialog :is-open="isChatOpen" @close="isChatOpen = false" />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { usePlayer } from "@/composables/usePlayer";
import { useMusic } from "@/composables/useMusic";
import { useRadio } from "@/composables/useRadio";
import { useTTS } from "@/composables/useTTS";
import ChatDialog from "./ChatDialog.vue";

const { isPlaying, currentTime, duration, currentTrack, progressPercent, togglePlay, previous, next, seek, audio } = usePlayer();

const { getLyric, likeSong, isLoggedIn } = useMusic();
const { playProgram, playNextSong, playPreviousSong, isRadioMode } = useRadio();
const { speak } = useTTS();

// 状态
const isLiked = ref(false);
const lyrics = ref<{ time: number; text: string }[]>([]);
const currentLyricIndex = ref(-1);
const dominantColor = ref("rgba(100, 100, 100, 0.8)");
const volumeLevel = ref(0);
const lyricsTransform = ref(0);
const isPlayingIntro = ref(false);
const introCache = ref<Map<string, string>>(new Map()); // 缓存歌曲介绍
const isChatOpen = ref(false); // 聊天对话框状态

// 切换聊天对话框
const toggleChat = () => {
    isChatOpen.value = !isChatOpen.value;
};

// 音量圈动画
const volumeCircumference = 2 * Math.PI * 90;
const volumeOffset = computed(() => {
    return volumeCircumference * (1 - volumeLevel.value);
});

// 背景样式
const backgroundStyle = computed(() => ({
    background: `linear-gradient(180deg, ${dominantColor.value} 0%, rgba(30, 30, 30, 0.95) 100%)`,
}));

const blurBackgroundStyle = computed(() => ({
    backgroundImage: currentTrack.value?.cover ? `url(${currentTrack.value.cover})` : "none",
}));

// 格式化时间
const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

// 进度条点击
const onProgressClick = (e: MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    seek(percent);
};

// 开始电台
const startRadio = () => {
    playProgram();
};

// 处理上一首
const handlePrevious = () => {
    if (isRadioMode.value) {
        playPreviousSong();
    } else {
        previous();
    }
};

// 处理下一首
const handleNext = () => {
    if (isRadioMode.value) {
        playNextSong();
    } else {
        next();
    }
};

// 播放歌曲介绍
const playIntro = async () => {
    if (!currentTrack.value || isPlayingIntro.value) return;

    try {
        isPlayingIntro.value = true;

        // 生成缓存 key
        const cacheKey = `${currentTrack.value.title}-${currentTrack.value.artist}`;

        let intro: string;

        // 检查缓存
        if (introCache.value.has(cacheKey)) {
            intro = introCache.value.get(cacheKey)!;
            console.log("[Intro] Using cached intro");
        } else {
            // 获取歌曲介绍
            const response = await fetch("/api/song-intro", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    song: currentTrack.value.title,
                    artist: currentTrack.value.artist,
                }),
            });

            const data = await response.json();
            intro = data.intro;

            // 缓存介绍
            introCache.value.set(cacheKey, intro);
            console.log("[Intro] Fetched and cached intro");
        }

        console.log("[Intro] Playing:", intro);

        // 播放介绍（音量控制由 usePlayer 自动处理）
        await speak(intro);

        isPlayingIntro.value = false;
    } catch (error) {
        console.error("[Intro] Error:", error);
        isPlayingIntro.value = false;
    }
};

// 喜欢/取消喜欢
const toggleLike = async () => {
    if (!currentTrack.value) return;

    try {
        isLiked.value = !isLiked.value;
        await likeSong(currentTrack.value.id, isLiked.value);
        console.log(isLiked.value ? "Liked" : "Unliked", currentTrack.value.title);
    } catch (error) {
        console.error("Failed to like song:", error);
        isLiked.value = !isLiked.value; // 回滚
    }
};

// 解析歌词
const parseLyric = (lyricText: string) => {
    const lines = lyricText.split("\n");
    const parsed: { time: number; text: string }[] = [];

    for (const line of lines) {
        const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);
        if (match) {
            const minutes = parseInt(match[1]);
            const seconds = parseInt(match[2]);
            const milliseconds = parseInt(match[3].padEnd(3, "0"));
            const time = minutes * 60 + seconds + milliseconds / 1000;
            const text = match[4].trim();
            if (text) {
                parsed.push({ time, text });
            }
        }
    }

    return parsed;
};

// 加载歌词
const loadLyrics = async () => {
    if (!currentTrack.value) return;

    try {
        const lyricText = await getLyric(currentTrack.value.id);
        lyrics.value = parseLyric(lyricText);
        console.log("Loaded lyrics:", lyrics.value.length, "lines");
    } catch (error) {
        console.error("Failed to load lyrics:", error);
        lyrics.value = [];
    }
};

// 更新当前歌词行
watch(currentTime, (time) => {
    if (lyrics.value.length === 0) return;

    for (let i = lyrics.value.length - 1; i >= 0; i--) {
        if (time >= lyrics.value[i].time) {
            if (currentLyricIndex.value !== i) {
                currentLyricIndex.value = i;
                // 触发滚动动画
                lyricsTransform.value = 0;
            }
            break;
        }
    }
});

// 监听歌词索引变化，触发滚动动画
watch(currentLyricIndex, () => {
    // 重置位置然后滚动
    lyricsTransform.value = 10;
    setTimeout(() => {
        lyricsTransform.value = 0;
    }, 50);
});

// 监听歌曲变化
watch(currentTrack, (track) => {
    if (track) {
        loadLyrics();
        isLiked.value = false; // TODO: 检查是否已喜欢
    }
});

// 提取封面主色调
const onCoverLoad = (e: Event) => {
    const img = e.target as HTMLImageElement;

    try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        let r = 0,
            g = 0,
            b = 0;
        const sampleSize = 10;

        for (let i = 0; i < data.length; i += 4 * sampleSize) {
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
        }

        const pixels = data.length / (4 * sampleSize);
        r = Math.floor(r / pixels);
        g = Math.floor(g / pixels);
        b = Math.floor(b / pixels);

        dominantColor.value = `rgba(${r}, ${g}, ${b}, 0.6)`;
    } catch (error) {
        console.error("Failed to extract color:", error);
    }
};

// 音量动画
onMounted(() => {
    if (audio.value) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaElementSource(audio.value);

        source.connect(analyser);
        analyser.connect(audioContext.destination);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const updateVolume = () => {
            analyser.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
            volumeLevel.value = Math.min(average / 128, 1);
            requestAnimationFrame(updateVolume);
        };

        updateVolume();
    }
});
</script>

<style scoped lang="scss">
.music-player {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    transition: background 0.5s ease;
}

.blur-background {
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background-size: cover;
    background-position: center;
    filter: blur(80px);
    opacity: 0.3;
    z-index: 0;
}

.player-content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem 1.5rem;
    height: 100%;
}

.tts-intro-btn {
    position: absolute;
    top: 1rem;
    left: 1rem;
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.9rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);

    &:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.25);
        transform: translateY(-2px);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    i {
        font-size: 1rem;
    }
}

.cover-container {
    position: relative;
    width: 280px;
    height: 280px;
    margin: 2rem 0;
}

.volume-ring {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;

    svg {
        width: 100%;
        height: 100%;
        transform: rotate(-90deg);
    }

    .volume-circle {
        transition: stroke-dashoffset 0.1s ease;
    }

    &.active .volume-circle {
        stroke: rgba(255, 255, 255, 0.6);
    }
}

.cover-wrapper {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 200px;
    height: 200px;
    border-radius: 50%;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);

    &.rotating {
        animation: rotate 20s linear infinite;
    }
}

@keyframes rotate {
    from {
        transform: translate(-50%, -50%) rotate(0deg);
    }
    to {
        transform: translate(-50%, -50%) rotate(360deg);
    }
}

.cover-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.cover-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 4rem;
    color: rgba(255, 255, 255, 0.3);
}

.song-info {
    text-align: center;
    margin: 1.5rem 0;
    color: white;
}

.song-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
}

.song-artist {
    font-size: 1rem;
    opacity: 0.7;
    margin: 0;
}

.lyrics-marquee {
    width: 100%;
    max-width: 500px;
    height: 120px;
    overflow: hidden;
    margin: 0rem 0 0.5rem 0;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
}

.lyrics-lines {
    transition: transform 0.3s ease;
    text-align: center;
    width: 100%;
}

.lyric-line {
    height: 30px;
    line-height: 30px;
    margin: 0;
    padding: 0 1rem;
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.9rem;
    transition: all 0.3s ease;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &.prev {
        opacity: 0.4;
        font-size: 0.85rem;
    }

    &.current {
        color: white;
        font-size: 1rem;
        font-weight: 500;
        opacity: 1;
        text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
    }

    &.next {
        opacity: 0.4;
        font-size: 0.85rem;
    }
}

.radio-start {
    margin: 2rem 0;
}

.start-radio-btn {
    background: rgba(255, 255, 255, 0.2);
    border: 2px solid rgba(255, 255, 255, 0.3);
    color: white;
    padding: 1rem 2rem;
    border-radius: 50px;
    font-size: 1.1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    transition: all 0.3s ease;

    &:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.3);
        border-color: rgba(255, 255, 255, 0.5);
        transform: scale(1.05);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    i {
        font-size: 1.3rem;
    }
}

.progress-section {
    display: flex;
    align-items: center;
    gap: 1rem;
    width: 100%;
    max-width: 500px;
    margin: 1.5rem 0;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.875rem;
}

.progress-bar {
    flex: 1;
    height: 4px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
    cursor: pointer;
    position: relative;
}

.progress-fill {
    height: 100%;
    background: white;
    border-radius: 2px;
    transition: width 0.1s ease;
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
}

.controls {
    display: flex;
    align-items: center;
    gap: 2rem;
    margin: 1rem 0;
}

.control-btn {
    background: none;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    opacity: 0.8;
    transition: all 0.2s ease;
    padding: 0.5rem;

    &:hover {
        opacity: 1;
        transform: scale(1.1);
    }

    &.active {
        color: #ff4444;
        opacity: 1;
    }
}

.play-btn {
    font-size: 2.5rem;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    width: 65px;
    height: 65px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        background: rgba(255, 255, 255, 0.3);
    }
}
</style>
