<!-- src/views/EcologyCodePage.vue -->
<template>
  <div class="ecology-page">
    <!-- 背景 -->
    <div class="bg-image"></div>
    <div class="bg-overlay"></div>

    <!-- 中国风装饰 -->
    <div class="chinese-decoration">
      <div class="cloud cloud-1"></div>
      <div class="cloud cloud-2"></div>
      <div class="cloud cloud-3"></div>
      <div class="cloud cloud-4"></div>
      <div class="border-decoration top-left"></div>
      <div class="border-decoration top-right"></div>
      <div class="border-decoration bottom-left"></div>
      <div class="border-decoration bottom-right"></div>
    </div>

    <!-- 返回按钮 -->
    <button class="back-btn" @click="goBack">← 返回首页</button>

    <!-- 3D 模型容器 -->
    <div class="model-container" ref="modelContainer">
      <div class="model-hint" v-if="!showPopup && modelLoaded">
        <span class="hint-text">🕊️ 轻触灵鸟 翻阅法典</span>
      </div>
      <div class="ink-decoration ink-left"></div>
      <div class="ink-decoration ink-right"></div>
    </div>

    <Assistant />
    <!-- 卷轴弹窗 -->
    <ScrollPopup :show="showPopup" @close="closePopup" />

    <!-- 加载状态 -->
    <div class="loading-state" v-if="isLoading && !modelLoaded">
      <div class="loading-spinner"></div>
      <span>灵鸟展翅中...</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import ScrollPopup from '@/components/ScrollPopup.vue'
import Assistant from '@/components/Assistant.vue'  // 新增

const router = useRouter()

const showPopup = ref(false)
const modelLoaded = ref(false)
const isLoading = ref(true)
const modelContainer = ref(null)
let modelViewer = null

const goBack = () => {
  router.push('/')
}

const closePopup = () => {
  showPopup.value = false
}

const createModelViewer = () => {
  if (!modelContainer.value) return

  const viewer = document.createElement('model-viewer')
  viewer.setAttribute('src', '/models/birds.glb')
  viewer.setAttribute('camera-controls', '')
  viewer.setAttribute('camera-orbit', '0deg 0deg 6.5m')
  viewer.setAttribute('camera-target', '0m 0m 0m')
  viewer.setAttribute('environment-image', 'neutral')
  viewer.setAttribute('exposure', '1.2')
  viewer.setAttribute('shadow-intensity', '0.6')
  viewer.setAttribute('animation-name', '*')
  viewer.setAttribute('animation-crossfade-duration', '0.5')
  viewer.setAttribute('animation-loop', '')
  
  viewer.style.width = '100%'
  viewer.style.height = '100%'
  viewer.style.setProperty('--poster-color', 'transparent')
  viewer.style.setProperty('--progress-bar-color', 'rgba(180, 120, 60, 0.8)')
  viewer.style.setProperty('--progress-bar-height', '4px')

  viewer.addEventListener('load', () => {
    console.log('✅ 小鸟模型加载完成')
    modelLoaded.value = true
    isLoading.value = false
    try { viewer.play() } catch (e) {}
  })

  viewer.addEventListener('error', () => {
    isLoading.value = false
  })

  viewer.addEventListener('click', () => {
    showPopup.value = true
  })

  const progressBar = document.createElement('div')
  progressBar.setAttribute('slot', 'progress-bar')
  progressBar.innerHTML = `
    <div class="progress-bar-container">
      <div class="progress-bar-fill" style="width: 0%;"></div>
    </div>
  `
  viewer.appendChild(progressBar)

  modelContainer.value.appendChild(viewer)
  modelViewer = viewer
}

const handleKeydown = (e) => {
  if (e.key === 'Escape' && showPopup.value) closePopup()
}

onMounted(() => {
  if (customElements.get('model-viewer')) {
    createModelViewer()
  } else {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/@google/model-viewer@4.0.0/dist/model-viewer.min.js'
    script.type = 'module'
    script.onload = () => {
      customElements.whenDefined('model-viewer').then(createModelViewer)
    }
    document.head.appendChild(script)
  }
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  if (modelViewer) {
    modelViewer.remove()
    modelViewer = null
  }
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
/* ============================================================
   ===== 页面样式 =====
   ============================================================ */

.ecology-page {
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
  font-family: '华文楷体', 'KaiTi', '楷体', 'Microsoft YaHei', serif;
}

.bg-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('/images/背景.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 0;
}

.bg-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 248, 235, 0.12);
  z-index: 1;
  pointer-events: none;
}

/* ===== 中国风装饰 ===== */
.chinese-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
}

.cloud {
  position: absolute;
  opacity: 0.05;
  color: #6a5a4a;
}
.cloud::before,
.cloud::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  background: currentColor;
}

.cloud-1 {
  top: 5%;
  left: 3%;
  font-size: 120px;
  width: 180px;
  height: 60px;
  background: currentColor;
  border-radius: 80px;
  animation: cloudFloat 20s ease-in-out infinite;
}
.cloud-1::before { width: 80px; height: 80px; top: -40px; left: 20px; }
.cloud-1::after { width: 60px; height: 60px; top: -30px; left: 70px; }

.cloud-2 {
  top: 12%;
  right: 5%;
  font-size: 80px;
  width: 140px;
  height: 45px;
  background: currentColor;
  border-radius: 60px;
  animation: cloudFloat 25s ease-in-out infinite reverse;
}
.cloud-2::before { width: 60px; height: 60px; top: -30px; left: 15px; }
.cloud-2::after { width: 45px; height: 45px; top: -22px; left: 55px; }

.cloud-3 {
  bottom: 15%;
  left: 5%;
  font-size: 100px;
  width: 160px;
  height: 50px;
  background: currentColor;
  border-radius: 70px;
  animation: cloudFloat 22s ease-in-out infinite 3s;
}
.cloud-3::before { width: 70px; height: 70px; top: -35px; left: 18px; }
.cloud-3::after { width: 50px; height: 50px; top: -25px; left: 60px; }

.cloud-4 {
  bottom: 8%;
  right: 3%;
  font-size: 60px;
  width: 100px;
  height: 35px;
  background: currentColor;
  border-radius: 50px;
  animation: cloudFloat 18s ease-in-out infinite 5s reverse;
}
.cloud-4::before { width: 45px; height: 45px; top: -22px; left: 12px; }
.cloud-4::after { width: 35px; height: 35px; top: -17px; left: 40px; }

@keyframes cloudFloat {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(30px); }
}

.border-decoration {
  position: absolute;
  width: 60px;
  height: 60px;
  border-color: rgba(139, 115, 85, 0.12);
  border-style: solid;
  border-width: 0;
  z-index: 2;
}
.top-left { top: 20px; left: 20px; border-top-width: 2px; border-left-width: 2px; }
.top-right { top: 20px; right: 20px; border-top-width: 2px; border-right-width: 2px; }
.bottom-left { bottom: 20px; left: 20px; border-bottom-width: 2px; border-left-width: 2px; }
.bottom-right { bottom: 20px; right: 20px; border-bottom-width: 2px; border-right-width: 2px; }

/* ===== 返回按钮 ===== */
.back-btn {
  position: fixed;
  top: 24px;
  left: 24px;
  z-index: 100;
  background: rgba(255, 248, 235, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(139, 115, 85, 0.25);
  padding: 10px 24px;
  border-radius: 30px;
  color: #5a4a3a;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.5px;
  font-family: '华文楷体', 'KaiTi', serif;
  box-shadow: 0 2px 12px rgba(139, 115, 85, 0.08);
}
.back-btn:hover {
  background: rgba(255, 248, 235, 1);
  transform: translateX(-3px);
  border-color: rgba(139, 115, 85, 0.4);
  box-shadow: 0 4px 20px rgba(139, 115, 85, 0.15);
}

/* ===== 3D 模型容器 ===== */
.model-container {
  width: 100%;
  height: 100vh;
  position: relative;
  z-index: 2;
}
.model-container model-viewer {
  width: 100%;
  height: 100%;
}

/* ===== 点击提示 ===== */
.model-hint {
  position: absolute;
  bottom: 140px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  animation: floatHint 2.5s ease-in-out infinite;
  pointer-events: none;
}

.hint-text {
  display: inline-block;
  padding: 12px 32px;
  background: rgba(255, 248, 235, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(180, 120, 60, 0.2);
  border-radius: 50px;
  color: #6a5a4a;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 3px;
  font-family: '华文楷体', 'KaiTi', serif;
  box-shadow: 0 4px 24px rgba(139, 115, 85, 0.08);
}
.hint-text::before { content: '❀ '; opacity: 0.6; }
.hint-text::after { content: ' ❀'; opacity: 0.6; }

@keyframes floatHint {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(-10px); }
}

/* ===== 水墨装饰 ===== */
.ink-decoration {
  position: absolute;
  pointer-events: none;
  z-index: 1;
  border-radius: 50%;
  background: radial-gradient(ellipse, rgba(139, 115, 85, 0.04) 0%, transparent 70%);
}
.ink-left { left: -80px; top: 30%; width: 300px; height: 400px; transform: rotate(-20deg); }
.ink-right { right: -80px; bottom: 20%; width: 250px; height: 350px; transform: rotate(15deg); }

/* ===== 加载状态 ===== */
.loading-state {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 50;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: #6a5a4a;
  font-size: 16px;
  font-family: '华文楷体', 'KaiTi', serif;
  letter-spacing: 2px;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid rgba(180, 120, 60, 0.15);
  border-top-color: rgba(180, 120, 60, 0.6);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

.progress-bar-container {
  width: 100%;
  height: 4px;
  background: rgba(139, 115, 85, 0.15);
  border-radius: 2px;
  overflow: hidden;
}
.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #c4a86a, #8a7a5a);
  border-radius: 2px;
  transition: width 0.3s ease;
}

/* ===== 响应式 ===== */
@media (max-width: 768px) {
  .hint-text { font-size: 13px; padding: 10px 20px; }
  .back-btn { padding: 8px 16px; font-size: 12px; top: 14px; left: 14px; }
  .cloud-1, .cloud-2, .cloud-3, .cloud-4 { display: none; }
  .border-decoration { width: 30px; height: 30px; }
  .top-left, .top-right { top: 12px; }
  .bottom-left, .bottom-right { bottom: 12px; }
  .ink-left, .ink-right { display: none; }
}

@media (max-width: 480px) {
  .hint-text { font-size: 11px; padding: 8px 16px; letter-spacing: 1px; }
}
</style>