<template>
  <div id="app">
    <router-view />
    
    <!-- 背景音乐 -->
    <audio 
      ref="bgmAudio" 
      :src="bgmSrc" 
      loop 
      autoplay
      :volume="bgmVolume"
      @loadeddata="onBgmLoaded"
    ></audio>
    
    <!-- 音乐控制按钮 -->
    <button 
      v-if="showBgmControl" 
      class="bgm-control" 
      @click="toggleBgm"
      :title="bgmMuted ? '开启音乐' : '静音'"
    >
      {{ bgmMuted ? '🔇' : '🔊' }}
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const bgmSrc = '/videos/background.mp3'
const bgmVolume = 0.15  // 音量 15%
const bgmMuted = ref(false)
const showBgmControl = ref(false)
const bgmAudio = ref(null)
const isPlaying = ref(false)

const onBgmLoaded = () => {
  showBgmControl.value = true
  console.log('✅ BGM 加载完成')
}

const toggleBgm = () => {
  if (bgmAudio.value) {
    bgmMuted.value = !bgmMuted.value
    bgmAudio.value.muted = bgmMuted.value
  }
}

// 点击页面任意位置启动音乐（解决浏览器自动播放限制）
const startBgm = () => {
  if (bgmAudio.value && !isPlaying.value) {
    bgmAudio.value.play().then(() => {
      isPlaying.value = true
      console.log('✅ BGM 已启动')
    }).catch(() => {})
    document.removeEventListener('click', startBgm)
  }
}

onMounted(() => {
  // 等待用户交互后启动音乐
  document.addEventListener('click', startBgm)
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
}

#app {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

/* ===== BGM 控制按钮 ===== */
.bgm-control {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 9999;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 248, 235, 0.85);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(180, 150, 100, 0.2);
  box-shadow: 0 2px 16px rgba(139, 115, 85, 0.1);
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5a4a3a;
}

.bgm-control:hover {
  transform: scale(1.08);
  background: rgba(255, 248, 235, 1);
  box-shadow: 0 4px 24px rgba(139, 115, 85, 0.15);
}

/* ===== 响应式 ===== */
@media (max-width: 768px) {
  .bgm-control {
    bottom: 20px;
    right: 20px;
    width: 38px;
    height: 38px;
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .bgm-control {
    bottom: 16px;
    right: 16px;
    width: 34px;
    height: 34px;
    font-size: 14px;
  }
}
</style>