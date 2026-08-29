<template>
  <div class="welcome-container">
    <!-- 背景图片 -->
    <div class="background-image" :style="{ backgroundImage: `url(${backgroundImage})` }"></div>
    <div class="bg-overlay"></div>

    <!-- 可拖拽的相机预览 -->
    <div 
      ref="cameraContainerRef"
      class="camera-container"
      :style="cameraStyle"
      @mousedown="startDrag"
      @touchstart="startDragTouch"
    >
      <div class="camera-header">
        <span class="camera-title">📷 目镜</span>
        <div class="camera-controls">
          <button class="camera-btn-minimize" @click.stop="toggleMinimize" title="最小化">
            {{ isMinimized ? '⤵' : '⤴' }}
          </button>
          <button class="camera-btn-close" @click.stop="hideCamera" title="隐藏">
            ✕
          </button>
        </div>
      </div>
      <video 
        ref="videoRef" 
        class="camera-video"
        :class="{ minimized: isMinimized }"
        autoplay 
        playsinline
      ></video>
      <div class="camera-status" v-if="!isTracking && isCameraReady">
        <span class="status-hint">⏳ 识别中...</span>
      </div>
      <div class="camera-status tracking" v-if="isTracking">
        <span class="status-hint tracking">👁️ 追踪中</span>
      </div>
      <div class="drag-handle"></div>
    </div>
    
    <!-- 粒子效果 -->
    <canvas ref="particleCanvas" class="particle-canvas"></canvas>

    <!-- 状态提示 -->
    <div class="status-bar" :class="{ active: isTracking }">
      <span class="status-dot" :class="{ tracking: isTracking, 'mouse-mode': !isTracking && !isCameraReady }"></span>
      <span class="status-text">{{ statusMessage }}</span>
    </div>

    <!-- 导航栏 -->
    <div class="navbar">
      <div class="nav-buttons">
        <button 
          class="nav-btn" 
          @click="goToNationalView"
          :class="{ 'hover-effect': isHoveringNational }"
          ref="nationalBtn"
        >
          <img :src="nationalIcon" alt="" class="nav-icon" />
          <span>全国视角</span>
        </button>
        <button 
          class="nav-btn" 
          @click="goToCaseView"
          :class="{ 'hover-effect': isHoveringCase }"
          ref="caseBtn"
        >
          <img :src="caseIcon" alt="" class="nav-icon" />
          <span>案例视角</span>
        </button>
        <!-- 🆕 法典科普按钮 -->
        <button 
          class="nav-btn nav-btn-ecology" 
          @click="goToEcologyCode"
          :class="{ 'hover-effect': isHoveringEcology }"
          ref="ecologyBtn"
        >
          <img :src="ecologyIcon" alt="" class="nav-icon" />
          <span>法典科普</span>
        </button>
      </div>
    </div>
    
    <!-- 主内容 -->
    <div class="content fade-in-up">
      <div class="main-title">
        <img 
          :src="titleImage" 
          alt="山海有界：生态环境法典下的中国绿色版图" 
          class="title-image"
          @error="titleImageFailed = true"
        />
        <div class="title-fallback" v-if="titleImageFailed">
          <span>山海有界</span>
          <span>生态环境法典下的中国绿色版图</span>
        </div>
      </div>
      
      <div class="sub-title">
        <img :src="subtitleImage" alt="副标题" class="subtitle-image" />
      </div>
    </div>

    
    <!-- 🆕 右下角小助手（模仿 Assistant.vue 样式） -->
    <div class="assistant-wrapper">
      <!-- 圆形头像 -->
      <div class="assistant-avatar" @click="toggleDialog">
        <img :src="assistantAvatar" alt="小助手" />
        <div class="assistant-status" :class="{ 'status-active': dialogVisible }"></div>
      </div>

      <!-- 对话框 -->
      <div class="assistant-dialog" v-show="dialogVisible" @click.stop>
        <div class="dialog-bubble">
          <img src="/images/对话框.png" class="dialog-bg" alt="对话框" />

          <div class="dialog-content">
            <div class="dialog-top-placeholder">
              <span class="drag-hint">⠿ 拖动调整内容位置</span>
            </div>

            <div class="dialog-bottom">
              <div class="dialog-header">
                <span class="dialog-name">🌿 法典小助手</span>
                <button class="dialog-close" @click="closeDialog">✕</button>
              </div>

              <div class="dialog-messages" ref="messagesContainer">
                <!-- 当前显示的那句话 -->
                <div class="dialog-message">
                  <span class="msg-avatar">🌱</span>
                  <span class="msg-text" @click="nextMessage" :class="{ 'clickable': !isLastMessage }">
                    {{ currentMessage }}
                    <span v-if="!isLastMessage" class="click-hint">（点击继续）</span>
                    <span v-else class="click-hint">（点击开启探索）</span>
                  </span>
                </div>
              </div>
              <button 
                  v-if="isLastMessage" 
                  class="dialog-explore-btn" 
                  @click="goToNationalView"
                >
                  开启探索 →
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="competition-badge">
  第三届星湖杯 · 科普地图设计赛道参赛作品
</div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// ========== 图片资源路径 ==========
const backgroundImage = '/images/background.png'
const titleImage = '/images/title.png'
const subtitleImage = '/images/sectitle.png'
const nationalIcon = '/images/iconnational.png'
const caseIcon = '/images/iconcase.png'
const ecologyIcon = '/images/iconnational.png' // 使用现有图标，可替换为专属图标
const assistantAvatar = '/images/character.jpg'

// ========== 对话框状态 ==========
const dialogVisible = ref(true)
const inputText = ref('')
const isTyping = ref(false)
const messagesContainer = ref(null)

// ========== 消息数据 ==========
const messages = ref([
  '你好！我是你的生态环境法典科普小助手 🌱',
  '这个网站用地图说话，带你看见——\n新出台的《生态环境法典》如何"跨越"行政边界，重塑中国的山川湖海。',
  '🗺️ 全国视角 —— 在地图上看见生态红线、治理体系与环境风险的空间分布\n📌 案例视角 —— 在秦岭山脉中追踪非法穿越案，看法律如何抵达群山深处',
  '下面我们一起开启探索之旅吧！'
])

const currentIndex = ref(0)
const currentMessage = computed(() => messages.value[currentIndex.value] || '')
const isLastMessage = computed(() => currentIndex.value === messages.value.length - 1)

const nextMessage = () => {
  if (isLastMessage.value) {
    // 最后一句话点击直接跳转
    goToNationalView()
  } else {
    currentIndex.value++
  }
}
// ========== 状态管理 ==========
const isLoading = ref(false)
const titleImageFailed = ref(false)
const isTracking = ref(false)
const isCameraReady = ref(false)
const statusMessage = ref('启动中...')

// ========== 眨眼反馈 ==========
const showBlinkFeedback = ref(false)
const blinkFeedbackText = ref('👁️ 目动')
let blinkFeedbackTimer = null

// ========== 相机拖拽控制 ==========
const cameraContainerRef = ref(null)
const isDragging = ref(false)
const isMinimized = ref(false)
const isCameraHidden = ref(false)
const dragOffset = reactive({ x: 0, y: 0 })
const cameraPosition = reactive({ x: 20, y: 20 })
const cameraSize = reactive({ width: 280, height: 210 })

const cameraStyle = computed(() => ({
  left: cameraPosition.x + 'px',
  top: cameraPosition.y + 'px',
  width: isMinimized.value ? '60px' : cameraSize.width + 'px',
  height: isMinimized.value ? '60px' : cameraSize.height + 'px',
  display: isCameraHidden.value ? 'none' : 'block'
}))

// 鼠标拖拽
const startDrag = (e) => {
  if (e.target.closest('.camera-controls')) return
  isDragging.value = true
  const rect = cameraContainerRef.value.getBoundingClientRect()
  dragOffset.x = e.clientX - rect.left
  dragOffset.y = e.clientY - rect.top
  
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  e.preventDefault()
}

const onDrag = (e) => {
  if (!isDragging.value) return
  const newX = e.clientX - dragOffset.x
  const newY = e.clientY - dragOffset.y
  
  const maxX = window.innerWidth - (isMinimized.value ? 60 : cameraSize.width)
  const maxY = window.innerHeight - (isMinimized.value ? 60 : cameraSize.height)
  
  cameraPosition.x = Math.max(0, Math.min(maxX, newX))
  cameraPosition.y = Math.max(0, Math.min(maxY, newY))
}

const stopDrag = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}

// 触摸拖拽
const startDragTouch = (e) => {
  if (e.target.closest('.camera-controls')) return
  isDragging.value = true
  const touch = e.touches[0]
  const rect = cameraContainerRef.value.getBoundingClientRect()
  dragOffset.x = touch.clientX - rect.left
  dragOffset.y = touch.clientY - rect.top
  
  document.addEventListener('touchmove', onDragTouch, { passive: false })
  document.addEventListener('touchend', stopDragTouch)
  e.preventDefault()
}

const onDragTouch = (e) => {
  if (!isDragging.value) return
  const touch = e.touches[0]
  const newX = touch.clientX - dragOffset.x
  const newY = touch.clientY - dragOffset.y
  
  const maxX = window.innerWidth - (isMinimized.value ? 60 : cameraSize.width)
  const maxY = window.innerHeight - (isMinimized.value ? 60 : cameraSize.height)
  
  cameraPosition.x = Math.max(0, Math.min(maxX, newX))
  cameraPosition.y = Math.max(0, Math.min(maxY, newY))
  e.preventDefault()
}

const stopDragTouch = () => {
  isDragging.value = false
  document.removeEventListener('touchmove', onDragTouch)
  document.removeEventListener('touchend', stopDragTouch)
}

const toggleMinimize = () => {
  isMinimized.value = !isMinimized.value
}

const hideCamera = () => {
  isCameraHidden.value = true
}

const showCamera = () => {
  isCameraHidden.value = false
}

// ========== DOM引用 ==========
const videoRef = ref(null)
const particleCanvas = ref(null)
const nationalBtn = ref(null)
const caseBtn = ref(null)
const ecologyBtn = ref(null)
const scrollMoreBtn = ref(null)

// ========== 眼部追踪相关 ==========
let faceMesh = null
let animationId = null
let particleSystem = null
let currentGazeX = 0.5
let currentGazeY = 0.5
let isBlinking = false
let blinkStartTime = 0
let isProcessingBlink = false

// ========== 鼠标追踪 ==========
let mouseX = window.innerWidth / 2
let mouseY = window.innerHeight / 2

const isHoveringNational = ref(false)
const isHoveringCase = ref(false)
const isHoveringEcology = ref(false)

// 手势识别
let handLandmarker = null
let lastGesture = ''
let gestureDebounceTimer = null

// ========== 小助手方法 ==========
const toggleDialog = () => {
  dialogVisible.value = !dialogVisible.value
  if (dialogVisible.value) {
    scrollToBottom()
  }
}

const closeDialog = () => {
  dialogVisible.value = false
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const sendMessage = () => {
  const text = inputText.value.trim()
  if (!text || isTyping.value) return

  messages.value.push({ role: 'user', content: text })
  inputText.value = ''
  scrollToBottom()

  isTyping.value = true
  let reply = '抱歉，这个问题我还不太了解。你可以试试问「什么是生态红线？」「秦岭案是怎么回事？」「法典对我有什么影响？」或「垃圾分类怎么分？」'

  for (const [key, value] of Object.entries(knowledgeBase)) {
    if (text.includes(key) || key.includes(text) || text.includes(key.replace('什么是', '').replace('怎么分', ''))) {
      reply = value.answer
      break
    }
  }

  setTimeout(() => {
    messages.value.push({ role: 'assistant', content: reply })
    isTyping.value = false
    scrollToBottom()
  }, 500 + Math.random() * 500)
}

const askSuggestion = (suggestion) => {
  inputText.value = suggestion
  sendMessage()
}

// ========== 粒子系统 ==========
class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.particles = []
    this.mouseX = window.innerWidth / 2
    this.mouseY = window.innerHeight / 2
    this.targetX = this.mouseX
    this.targetY = this.mouseY
    this.count = 40
    this.clickParticles = []
    
    this.resize()
    window.addEventListener('resize', () => this.resize())
    this.initParticles()
  }

  resize() {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
  }

  initParticles() {
    this.particles = []
    for (let i = 0; i < this.count; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = Math.random() * 80 + 10
      this.particles.push({
        x: this.mouseX + Math.cos(angle) * radius,
        y: this.mouseY + Math.sin(angle) * radius,
        size: Math.random() * 3 + 1.5,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        life: Math.random() * 80 + 40,
        maxLife: 120,
        color: Math.random() > 0.5 ? '#528c7e' : '#bad66e'
      })
    }
  }

  updateMouse(x, y) {
    this.targetX = x
    this.targetY = y
  }

  triggerClick(x, y) {
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = Math.random() * 6 + 3
      this.clickParticles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 4 + 2,
        life: 30,
        maxLife: 30,
        color: Math.random() > 0.3 ? '#528c7e' : '#bad66e'
      })
    }
  }

  update() {
    this.mouseX += (this.targetX - this.mouseX) * 0.1
    this.mouseY += (this.targetY - this.mouseY) * 0.1

    this.particles.forEach(p => {
      const dx = this.mouseX - p.x
      const dy = this.mouseY - p.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      
      if (dist > 5) {
        const force = 0.05
        p.speedX += (dx / dist) * force
        p.speedY += (dy / dist) * force
      }
      
      p.speedX += (Math.random() - 0.5) * 0.1
      p.speedY += (Math.random() - 0.5) * 0.1
      p.speedX *= 0.95
      p.speedY *= 0.95
      
      p.x += p.speedX
      p.y += p.speedY
      
      const dx2 = p.x - this.mouseX
      const dy2 = p.y - this.mouseY
      const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2)
      if (dist2 > 100) {
        p.x = this.mouseX + (dx2 / dist2) * 80
        p.y = this.mouseY + (dy2 / dist2) * 80
      }
      
      p.life -= 0.3
      if (p.life < 0) {
        p.life = p.maxLife
        const angle = Math.random() * Math.PI * 2
        const radius = Math.random() * 60 + 10
        p.x = this.mouseX + Math.cos(angle) * radius
        p.y = this.mouseY + Math.sin(angle) * radius
        p.color = Math.random() > 0.5 ? '#528c7e' : '#bad66e'
      }
    })

    this.clickParticles = this.clickParticles.filter(p => {
      p.x += p.vx
      p.y += p.vy
      p.vx *= 0.96
      p.vy *= 0.96
      p.vy += 0.03
      p.life -= 1
      p.size *= 0.98
      return p.life > 0 && p.size > 0.5
    })
  }

  draw() {
    const ctx = this.ctx
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    
    const allParticles = [...this.particles, ...this.clickParticles]
    allParticles.forEach(p => {
      const lifeRatio = p.life / p.maxLife
      const alpha = lifeRatio * 0.9
      
      const gradient = ctx.createRadialGradient(
        p.x, p.y, 0,
        p.x, p.y, p.size * 2.5
      )
      gradient.addColorStop(0, p.color)
      gradient.addColorStop(0.3, p.color + '80')
      gradient.addColorStop(1, p.color + '00')
      
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()
      
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(82, 140, 126, ${alpha * 0.6})`
      ctx.fill()
      
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size * 0.3, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(82, 140, 126, ${alpha * 0.9})`
      ctx.fill()
    })
    
    const gradient = ctx.createRadialGradient(
      this.mouseX, this.mouseY, 0,
      this.mouseX, this.mouseY, 40
    )
    gradient.addColorStop(0, 'rgba(82, 140, 126, 0.15)')
    gradient.addColorStop(0.5, 'rgba(186, 214, 110, 0.08)')
    gradient.addColorStop(1, 'rgba(82, 140, 126, 0)')
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(this.mouseX, this.mouseY, 40, 0, Math.PI * 2)
    ctx.fill()
  }

  animate() {
    this.update()
    this.draw()
  }
}

// ========== 加载AI模型 ==========
const loadFaceMesh = async () => {
  try {
    const faceLandmarksDetection = await import('@mediapipe/tasks-vision')
    const { FaceLandmarker, FilesetResolver } = faceLandmarksDetection
    
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.7/wasm'
    )
    
    faceMesh = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
        delegate: 'GPU'
      },
      runningMode: 'VIDEO',
      numFaces: 1,
      minFaceDetectionConfidence: 0.5,
      minFacePresenceConfidence: 0.5,
      minTrackingConfidence: 0.5
    })
    
    return true
  } catch (error) {
    console.error('加载FaceMesh失败:', error)
    return false
  }
}

const loadHandLandmarker = async () => {
  try {
    const vision = await import('@mediapipe/tasks-vision')
    const { HandLandmarker, FilesetResolver } = vision
    
    const visionInstance = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.7/wasm'
    )
    
    handLandmarker = await HandLandmarker.createFromOptions(visionInstance, {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
        delegate: 'GPU'
      },
      runningMode: 'VIDEO',
      numHands: 1,
      minHandDetectionConfidence: 0.5,
      minHandPresenceConfidence: 0.5,
      minTrackingConfidence: 0.5
    })
    
    return true
  } catch (error) {
    console.error('加载HandLandmarker失败:', error)
    return false
  }
}

// ========== 摄像头 ==========
const startCamera = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: 640, height: 480 }
    })
    
    if (videoRef.value) {
      videoRef.value.srcObject = stream
      await videoRef.value.play()
      isCameraReady.value = true
      return true
    }
    return false
  } catch (error) {
    console.error('摄像头启动失败:', error)
    statusMessage.value = '🖱️ 鼠标模式'
    return false
  }
}

// ========== 手势识别 ==========
const detectGesture = (landmarks) => {
  const thumbTip = landmarks[4]
  const indexTip = landmarks[8]
  const middleTip = landmarks[12]
  const ringTip = landmarks[16]
  const pinkyTip = landmarks[20]
  
  const indexMcp = landmarks[5]
  const middleMcp = landmarks[9]
  const ringMcp = landmarks[13]
  const pinkyMcp = landmarks[17]
  
  const indexExtended = indexTip.y < indexMcp.y - 0.05
  const middleExtended = middleTip.y < middleMcp.y - 0.05
  const ringExtended = ringTip.y < ringMcp.y - 0.05
  const pinkyExtended = pinkyTip.y < pinkyMcp.y - 0.05
  
  const thumbExtended = thumbTip.x < indexMcp.x - 0.05
  
  if (thumbExtended && !indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
    return 'thumbs_up'
  }
  
  if (!thumbExtended && !indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
    return 'fist'
  }
  
  if (thumbExtended && indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
    return 'one'
  }
  
  if (thumbExtended && indexExtended && middleExtended && !ringExtended && !pinkyExtended) {
    return 'two'
  }
  
  if (thumbExtended && indexExtended && middleExtended && ringExtended && pinkyExtended) {
    return 'five'
  }
  
  if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
    return 'point'
  }
  
  return 'none'
}

// ========== 眼部追踪 ==========
const detectFace = () => {
  if (!faceMesh || !videoRef.value || !videoRef.value.readyState >= 2) {
    animationId = requestAnimationFrame(detectFace)
    return
  }
  
  try {
    const results = faceMesh.detectForVideo(videoRef.value, performance.now())
    
    if (results.faceLandmarks && results.faceLandmarks.length > 0) {
      const landmarks = results.faceLandmarks[0]
      isTracking.value = true
      statusMessage.value = '闭眼1秒进入全国 · 闭眼2秒进入案例'
      
      const leftEye = getEyeLandmarks(landmarks, 'left')
      const rightEye = getEyeLandmarks(landmarks, 'right')
      
      const earLeft = calculateEAR(leftEye)
      const earRight = calculateEAR(rightEye)
      const ear = (earLeft + earRight) / 2
      
      const EYE_CLOSED_THRESHOLD = 0.95
      const now = Date.now()
      
      if (ear > EYE_CLOSED_THRESHOLD) {
        if (!isBlinking) {
          isBlinking = true
          blinkStartTime = now
          statusMessage.value = '闭眼中...'
          showBlinkFeedbackFn('😌 闭眼中...')
        }
      } else {
        if (isBlinking) {
          const elapsed = (now - blinkStartTime) / 1000
          isBlinking = false
          
          if (elapsed >= 2 && !isProcessingBlink) {
            isProcessingBlink = true
            statusMessage.value = '进入案例视角'
            showBlinkFeedbackFn('📜 进入案例视角')
            particleSystem?.triggerClick(window.innerWidth / 2, window.innerHeight / 2)
            setTimeout(() => goToCaseView(), 200)
            setTimeout(() => { isProcessingBlink = false }, 500)
          }
          else if (elapsed >= 1 && !isProcessingBlink) {
            isProcessingBlink = true
            statusMessage.value = '进入全国视角'
            showBlinkFeedbackFn('🏯 进入全国视角')
            particleSystem?.triggerClick(window.innerWidth / 2, window.innerHeight / 2)
            setTimeout(() => goToNationalView(), 200)
            setTimeout(() => { isProcessingBlink = false }, 500)
          }
          else if (elapsed > 0.1) {
            statusMessage.value = `仅闭 ${elapsed.toFixed(1)} 秒`
            showBlinkFeedbackFn(`⏳ 仅闭 ${elapsed.toFixed(1)} 秒`)
          }
        }
      }
      
      const gazeX = calculateGazeX(landmarks)
      const gazeY = calculateGazeY(landmarks)
      
      currentGazeX = currentGazeX * 0.7 + gazeX * 0.3
      currentGazeY = currentGazeY * 0.7 + gazeY * 0.3
      
      const screenX = currentGazeX * window.innerWidth
      const screenY = currentGazeY * window.innerHeight
      
      if (particleSystem) {
        particleSystem.updateMouse(screenX, screenY)
      }
      
      detectHover(screenX, screenY)
      
    } else {
      isTracking.value = false
      statusMessage.value = '未检测到人脸'
    }
  } catch (error) {
    console.error('detectFace 错误:', error)
  }
  
  animationId = requestAnimationFrame(detectFace)
}

// ========== 手势追踪 ==========
const detectHand = () => {
  if (!handLandmarker || !videoRef.value || !videoRef.value.readyState >= 2) {
    return
  }
  
  try {
    const results = handLandmarker.detectForVideo(videoRef.value, performance.now())
    
    if (results.landmarks && results.landmarks.length > 0) {
      const landmarks = results.landmarks[0]
      const gesture = detectGesture(landmarks)
      
      if (gesture !== 'none' && gesture !== lastGesture) {
        lastGesture = gesture
        handleGestureAction(gesture)
      }
    }
  } catch (error) {
    // 静默处理
  }
}

// ========== 显示眨眼反馈 ==========
const showBlinkFeedbackFn = (text) => {
  if (blinkFeedbackTimer) {
    clearTimeout(blinkFeedbackTimer)
  }
  
  blinkFeedbackText.value = text || '👁️ 目动'
  showBlinkFeedback.value = true
  
  blinkFeedbackTimer = setTimeout(() => {
    showBlinkFeedback.value = false
  }, 1500)
}

// ========== 动作处理 ==========
const handleGestureAction = (gesture) => {
  if (gestureDebounceTimer) {
    clearTimeout(gestureDebounceTimer)
  }
  
  gestureDebounceTimer = setTimeout(() => {
    if (gesture === 'one') {
      particleSystem?.triggerClick(window.innerWidth / 2, window.innerHeight / 2)
      goToNationalView()
    } else if (gesture === 'two') {
      particleSystem?.triggerClick(window.innerWidth / 2, window.innerHeight / 2)
      goToCaseView()
    }
    lastGesture = ''
  }, 300)
}

// ========== 辅助函数 ==========
const getEyeLandmarks = (landmarks, side) => {
  const LEFT_EYE_8 = [33, 133, 157, 158, 159, 160, 161, 173]
  const RIGHT_EYE_8 = [362, 263, 387, 386, 385, 384, 398, 466]
  
  const indices = side === 'left' ? LEFT_EYE_8 : RIGHT_EYE_8
  return indices.map(i => landmarks[i])
}

const calculateEAR = (eye) => {
  if (!eye || eye.length < 8) return 0
  
  const p1 = eye[0], p2 = eye[1], p3 = eye[2], p4 = eye[3]
  const p5 = eye[4], p6 = eye[5], p7 = eye[6], p8 = eye[7]
  
  const v1 = Math.sqrt(
    Math.pow(p2.x - p6.x, 2) + 
    Math.pow(p2.y - p6.y, 2)
  )
  
  const v2 = Math.sqrt(
    Math.pow(p3.x - p5.x, 2) + 
    Math.pow(p3.y - p5.y, 2)
  )
  
  const h = Math.sqrt(
    Math.pow(p1.x - p4.x, 2) + 
    Math.pow(p1.y - p4.y, 2)
  )
  
  if (h === 0) return 0
  return (v1 + v2) / (2 * h)
}

const calculateGazeX = (landmarks) => {
  const leftEyeCenter = {
    x: (landmarks[33].x + landmarks[133].x) / 2,
    y: (landmarks[33].y + landmarks[133].y) / 2
  }
  const rightEyeCenter = {
    x: (landmarks[362].x + landmarks[263].x) / 2,
    y: (landmarks[362].y + landmarks[263].y) / 2
  }
  const centerX = (leftEyeCenter.x + rightEyeCenter.x) / 2
  return Math.max(0, Math.min(1, centerX))
}

const calculateGazeY = (landmarks) => {
  const leftEyeCenter = {
    x: (landmarks[33].x + landmarks[133].x) / 2,
    y: (landmarks[33].y + landmarks[133].y) / 2
  }
  const rightEyeCenter = {
    x: (landmarks[362].x + landmarks[263].x) / 2,
    y: (landmarks[362].y + landmarks[263].y) / 2
  }
  const centerY = (leftEyeCenter.y + rightEyeCenter.y) / 2
  const noseTip = landmarks[1]
  const verticalOffset = centerY - noseTip.y
  return Math.max(0, Math.min(1, centerY + verticalOffset * 0.5))
}

const detectHover = (x, y) => {
  const elements = [
    { ref: nationalBtn, state: isHoveringNational },
    { ref: caseBtn, state: isHoveringCase },
    { ref: ecologyBtn, state: isHoveringEcology }
  ]
  
  elements.forEach(({ ref, state }) => {
    if (ref && ref.value) {
      const rect = ref.value.getBoundingClientRect()
      const isHovering = x >= rect.left && x <= rect.right && 
                         y >= rect.top && y <= rect.bottom
      state.value = isHovering
    }
  })
}

// ========== 鼠标事件 ==========
const handleMouseMove = (e) => {
  mouseX = e.clientX
  mouseY = e.clientY
  if (particleSystem && !isTracking.value) {
    particleSystem.updateMouse(mouseX, mouseY)
  }
}

const handleMouseClick = (e) => {
  if (!isTracking.value && particleSystem) {
    particleSystem.triggerClick(e.clientX, e.clientY)
  }
}

// ========== 路由方法 ==========
const goToNationalView = () => {
  router.push({
    path: '/map',
    query: { view: 'national', region: 'china', from: 'welcome' }
  })
}

const goToCaseView = () => {
  router.push({
    path: '/map',
    query: { view: 'case', region: 'xian', city: '西安', from: 'welcome' }
  })
}

const goToEcologyCode = () => {
  router.push('/ecology-code')
}

const loadMore = async () => {
  if (isLoading.value) return
  isLoading.value = true
  setTimeout(() => {
    isLoading.value = false
    router.push('/ecology-code')
  }, 800)
}

// ========== 生命周期 ==========
onMounted(async () => {
  console.log('===== 欢迎页面已加载 =====')
  
  await nextTick()
  if (particleCanvas.value) {
    particleSystem = new ParticleSystem(particleCanvas.value)
    animateParticles()
  }
  
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('click', handleMouseClick)
  
  // 双击状态栏恢复相机
  const statusBar = document.querySelector('.status-bar')
  if (statusBar) {
    statusBar.addEventListener('dblclick', showCamera)
  }
  
  // ESC关闭对话框
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && dialogVisible.value) {
      closeDialog()
    }
  })
  
  checkImageExists(titleImage).then(exists => {
    if (!exists) {
      console.warn('标题图片加载失败，将使用备用文字')
      titleImageFailed.value = true
    }
  })
  
  try {
    statusMessage.value = '加载模型中...'
    
    const [faceLoaded, handLoaded] = await Promise.all([
      loadFaceMesh(),
      loadHandLandmarker()
    ])
    
    if (!faceLoaded) {
      statusMessage.value = '🖱️ 鼠标模式'
      return
    }
    
    const cameraStarted = await startCamera()
    if (!cameraStarted) {
      statusMessage.value = '🖱️ 鼠标模式'
      return
    }
    
    statusMessage.value = '初始化追踪...'
    setTimeout(() => {
      detectFace()
      setInterval(detectHand, 100)
    }, 500)
  } catch (error) {
    console.error('初始化失败:', error)
    statusMessage.value = '🖱️ 鼠标模式'
  }
})

const animateParticles = () => {
  if (particleSystem) {
    particleSystem.animate()
  }
  requestAnimationFrame(animateParticles)
}

const checkImageExists = (url) => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = url
  })
}

onBeforeUnmount(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  if (faceMesh) {
    faceMesh.close()
  }
  if (handLandmarker) {
    handLandmarker.close()
  }
  if (videoRef.value && videoRef.value.srcObject) {
    videoRef.value.srcObject.getTracks().forEach(track => track.stop())
  }
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('click', handleMouseClick)
  if (gestureDebounceTimer) {
    clearTimeout(gestureDebounceTimer)
  }
})
</script>

<style scoped>
/* ============================================================
   配色变量
   ============================================================ */
:root {
  --primary: #528c7e;
  --primary-light: #bad66e;
  --primary-purple: #c8b5df;
  --primary-gray: #748a9e;
  --primary-dark: #3d6b60;
  --bg-dark: #2c3e50;
  --text-light: #e8f0f0;
  --text-muted: #a8bcc9;
  --shadow-color: rgba(82, 140, 126, 0.2);
}

/* ============================================================
   基础样式
   ============================================================ */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.welcome-container {
  width: 100%;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif;
}

/* ============================================================
   背景
   ============================================================ */
.background-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 0;
  transform: scale(1.1);
  animation: bgZoom 1.5s ease-out forwards;
}

.bg-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    rgba(44, 62, 80, 0.5) 0%,
    rgba(82, 140, 126, 0.3) 50%,
    rgba(44, 62, 80, 0.5) 100%
  );
  z-index: 1;
}

@keyframes bgZoom {
  from { transform: scale(1.15); }
  to { transform: scale(1); }
}

/* ============================================================
   粒子画布
   ============================================================ */
.particle-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 50;
}

/* ============================================================
   相机
   ============================================================ */
.camera-container {
  position: fixed;
  z-index: 150;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.5), 0 0 60px rgba(82, 140, 126, 0.08);
  border: 2px solid rgba(82, 140, 126, 0.3);
  background: #1a2a2a;
  transition: width 0.3s ease, height 0.3s ease, box-shadow 0.3s ease;
  cursor: grab;
  user-select: none;
  touch-action: none;
  min-width: 60px;
  min-height: 60px;
}

.camera-container:active {
  cursor: grabbing;
}

.camera-container:hover {
  box-shadow: 0 8px 50px rgba(0, 0, 0, 0.6), 0 0 80px rgba(82, 140, 126, 0.12);
  border-color: rgba(82, 140, 126, 0.5);
}

.drag-handle {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 20px;
  height: 20px;
  cursor: nwse-resize;
  z-index: 10;
  background: linear-gradient(135deg, transparent 40%, rgba(82, 140, 126, 0.3) 50%, transparent 60%);
  border-bottom-right-radius: 14px;
}

.drag-handle::after {
  content: '⤡';
  position: absolute;
  bottom: 2px;
  right: 4px;
  font-size: 14px;
  color: rgba(82, 140, 126, 0.3);
}

.camera-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 12px;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.7) 0%, transparent 100%);
  pointer-events: none;
}

.camera-title {
  font-size: 13px;
  color: #bad66e;
  font-weight: 500;
  letter-spacing: 1px;
  pointer-events: none;
}

.camera-controls {
  display: flex;
  gap: 4px;
  pointer-events: auto;
}

.camera-btn-minimize,
.camera-btn-close {
  width: 22px;
  height: 22px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.camera-btn-minimize:hover {
  background: rgba(82, 140, 126, 0.3);
  color: #bad66e;
}

.camera-btn-close:hover {
  background: rgba(200, 70, 70, 0.5);
  color: #fff;
}

.camera-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  border-radius: 14px;
  background: #0a1a1a;
}

.camera-video.minimized {
  object-fit: cover;
}

.camera-status {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  padding: 2px 12px;
  border-radius: 20px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 0.5px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
}

.camera-status.tracking {
  background: rgba(82, 140, 126, 0.5);
  border-color: rgba(186, 214, 110, 0.3);
}

.camera-status .status-hint.tracking {
  color: #bad66e;
}

/* ============================================================
   状态栏
   ============================================================ */
.status-bar {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 24px;
  background: rgba(44, 62, 80, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 30px;
  z-index: 60;
  border: 1px solid rgba(82, 140, 126, 0.3);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  cursor: default;
}

.status-bar.active {
  border-color: rgba(82, 140, 126, 0.6);
  box-shadow: 0 4px 40px rgba(82, 140, 126, 0.15);
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #748a9e;
  transition: all 0.3s;
  border: 1px solid rgba(82, 140, 126, 0.3);
}

.status-dot.tracking {
  background: #bad66e;
  border-color: #528c7e;
  animation: pulse-dot 1.5s infinite;
}

.status-dot.mouse-mode {
  background: #c8b5df;
  border-color: #748a9e;
  animation: pulse-dot-mouse 1.5s infinite;
}

@keyframes pulse-dot {
  0%, 100% { box-shadow: 0 0 0 0 rgba(186, 214, 110, 0.5); }
  50% { box-shadow: 0 0 0 10px rgba(186, 214, 110, 0); }
}

@keyframes pulse-dot-mouse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(200, 181, 223, 0.5); }
  50% { box-shadow: 0 0 0 10px rgba(200, 181, 223, 0); }
}

.status-text {
  color: #e8f0f0;
  font-size: 15px;
  font-weight: 400;
  letter-spacing: 1px;
}

/* ============================================================
   导航栏
   ============================================================ */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 16px 40px;
  background: rgba(44, 62, 80, 0.6);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(82, 140, 126, 0.15);
  z-index: 100;
  box-sizing: border-box;
}

.nav-buttons {
  display: flex;
  gap: 16px;
  align-items: center;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(82, 140, 126, 0.2);
  border-radius: 30px;
  color: #e8f0f0;
  font-size: 16px;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
  font-family: inherit;
}

.nav-btn:hover {
  background: rgba(82, 140, 126, 0.2);
  border-color: rgba(82, 140, 126, 0.5);
  transform: translateY(-2px);
}

.nav-btn.hover-effect {
  background: rgba(82, 140, 126, 0.3) !important;
  transform: translateY(-2px) scale(1.03);
  border-color: #bad66e !important;
  box-shadow: 0 4px 30px rgba(82, 140, 126, 0.2);
}

/* 🆕 法典科普按钮 - 特殊样式 */
.nav-btn-ecology {
  background: rgba(82, 140, 126, 0.15);
  border-color: rgba(186, 214, 110, 0.3);
}

.nav-btn-ecology:hover {
  background: rgba(82, 140, 126, 0.3);
  border-color: #bad66e;
}

.nav-icon {
  width: 20px;
  height: 20px;
  filter: brightness(0) invert(1) opacity(0.8);
}

/* ============================================================
   主内容
   ============================================================ */
.content {
  text-align: center;
  z-index: 2;
  padding: 100px 2rem 2rem;
  max-width: 1200px;
  position: relative;
}

.fade-in-up {
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.main-title {
  margin-bottom: 2rem;
  animation: titleFloat 3s ease-in-out infinite;
}

.title-image {
  max-width: 90%;
  height: auto;
  display: block;
  margin: 0 auto;
  filter: drop-shadow(0 4px 20px rgba(0, 0, 0, 0.2));
}

@keyframes titleFloat {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
}

.title-fallback {
  font-size: clamp(1.8rem, 5vw, 3rem);
  font-weight: 600;
  color: #e8f0f0;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
  letter-spacing: 2px;
}

.title-fallback span {
  display: block;
  margin: 0.5rem 0;
}

.title-fallback span:first-child {
  color: #bad66e;
  font-size: clamp(2.2rem, 6vw, 3.6rem);
}

.sub-title {
  margin-bottom: 4rem;
}

.subtitle-image {
  max-width: 60%;
  height: auto;
}

.scroll-more {
  position: absolute;
  bottom: 1.5rem;
  left: 0;
  right: 0;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  animation: bounce 2s infinite, fadeInUp 0.6s ease-out 0.6s forwards;
}

.scroll-text {
  color: rgba(232, 240, 240, 0.8);
  font-size: 1.1rem;
  letter-spacing: 2px;
  transition: all 0.3s;
}

.scroll-more:hover .scroll-text {
  color: #bad66e;
  text-shadow: 0 0 20px rgba(82, 140, 126, 0.3);
}

.scroll-arrow {
  color: rgba(232, 240, 240, 0.5);
  transition: transform 0.3s;
}

.scroll-more:hover .scroll-arrow {
  transform: translateY(5px);
  color: #bad66e;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(10px); }
}

/* ============================================================
   小助手（模仿 Assistant.vue）
   ============================================================ */
.assistant-wrapper {
  position: fixed;
  bottom: 30px;
  right: 160px;
  z-index: 9998;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

/* 圆形头像 */
.assistant-avatar {
  width: 76px;
  height: 76px;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  border: 3px solid rgba(255, 248, 235, 0.9);
  position: relative;
  flex-shrink: 0;
  overflow: hidden;
}

.assistant-avatar:hover {
  transform: scale(1.08);
  box-shadow: 0 6px 32px rgba(0, 0, 0, 0.2);
}

.assistant-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.assistant-status {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #4CAF50;
  border: 2px solid white;
  transition: all 0.3s;
}

.assistant-status.status-active {
  background: #FF9800;
  animation: pulse-status 1.5s infinite;
}

@keyframes pulse-status {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255, 152, 0, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(255, 152, 0, 0); }
}

/* 对话框 */
.assistant-dialog {
  position: absolute;
  bottom: 38px;
  right: 0;
  width: 500px;
  max-width: 92vw;
  animation: slideUp 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.dialog-bubble {
  position: relative;
  width: 100%;
}

.dialog-bg {
  width: 100%;
  height: auto;
  display: block;
  opacity: 0.92;
  filter: drop-shadow(0 4px 20px rgba(0, 0, 0, 0.08));
}

.dialog-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding: 0 16px 12px;
}

.dialog-top-placeholder {
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 10px;
  min-height: 60px;
}

.drag-hint {
  font-size: 11px;
  color: rgba(139, 115, 85, 0.35);
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  letter-spacing: 1px;
  user-select: none;
}

.dialog-bottom {
  flex-shrink: 0;
  height: 220px;
  width: 90%;
  display: flex;
  flex-direction: column;
  padding: 0 40px;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 2px;
  border-bottom: 1px solid rgba(139, 115, 85, 0.08);
  flex-shrink: 0;
}

.dialog-name {
  font-size: 13px;
  font-weight: 700;
  color: #3a2a1a;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  letter-spacing: 1px;
}

.dialog-close {
  background: rgba(139, 115, 85, 0.2);
  border: none;
  color: #5a4a3a;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.dialog-close:hover {
  background: rgba(139, 115, 85, 0.4);
  transform: rotate(90deg);
}

.dialog-messages {
  flex: 1;
  overflow-y: auto;
  padding: 2px 2px 2px;
  margin: 0;
  min-height: 90px;
  max-height: 130px;
}

.dialog-messages::-webkit-scrollbar {
  width: 3px;
}
.dialog-messages::-webkit-scrollbar-track {
  background: rgba(200, 180, 150, 0.1);
  border-radius: 4px;
}
.dialog-messages::-webkit-scrollbar-thumb {
  background: #c4a86a;
  border-radius: 4px;
}

.dialog-message {
  display: flex;
  align-items: flex-start;
  gap: 5px;
  margin-bottom: 3px;
  font-size: 12px;
  line-height: 1.5;
  color: #3a2a1a;
  animation: msgIn 0.3s ease-out;
}

@keyframes msgIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

.dialog-message .msg-avatar {
  font-size: 13px;
  flex-shrink: 0;
  margin-top: 1px;
}

.dialog-message .msg-text {
  background: rgba(255, 248, 235, 0.4);
  padding: 3px 10px;
  border-radius: 6px;
  white-space: pre-line;
  word-break: break-word;
  max-width: 90%;
  border: 1px solid rgba(200, 180, 150, 0.06);
}

.dialog-message.message-user {
  flex-direction: row-reverse;
}

.dialog-message.message-user .msg-text {
  background: rgba(82, 140, 126, 0.08);
  border-color: rgba(82, 140, 126, 0.1);
}

.typing-indicator .typing-dots {
  display: inline-flex;
  gap: 2px;
  padding: 0 4px;
}
.typing-indicator .typing-dots span {
  animation: dotJump 1.2s infinite;
}
.typing-indicator .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
.typing-indicator .typing-dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes dotJump {
  0%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-6px); }
}

.dialog-input-area {
  display: flex;
  gap: 5px;
  padding-top: 3px;
  border-top: 1px solid rgba(200, 180, 150, 0.08);
  flex-shrink: 0;
}

.dialog-input-area input {
  flex: 1;
  padding: 3px 10px;
  border: 1px solid rgba(200, 180, 150, 0.2);
  border-radius: 14px;
  font-size: 11px;
  background: rgba(255, 248, 235, 0.4);
  color: #3a2a1a;
  outline: none;
  font-family: inherit;
  transition: all 0.2s;
}
.dialog-input-area input:focus {
  border-color: rgba(82, 140, 126, 0.4);
  background: rgba(255, 248, 235, 0.6);
}
.dialog-input-area input::placeholder {
  color: #8a7a6a;
  font-size: 10px;
}
.dialog-input-area input:disabled {
  opacity: 0.5;
}

.dialog-input-area button {
  padding: 3px 12px;
  border: none;
  background: #528c7e;
  color: white;
  border-radius: 14px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}
.dialog-input-area button:hover:not(:disabled) {
  background: #3d6b60;
  transform: scale(1.02);
}
.dialog-input-area button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.dialog-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  padding-top: 3px;
  flex-shrink: 0;
}
.dialog-explore-btn-wrapper {
  display: flex;
  justify-content: center;
  padding-top: 6px;
  flex-shrink: 0;
}

.dialog-explore-btn {
  padding: 6px 28px;
  border: none;
  background: #528c7e;
  color: white;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
  letter-spacing: 1px;
  box-shadow: 0 2px 12px rgba(82, 140, 126, 0.3);
}

.dialog-explore-btn:hover {
  background: #3d6b60;
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(82, 140, 126, 0.4);
}
.suggestion-btn {
  padding: 1px 8px;
  border: 1px solid rgba(200, 180, 150, 0.2);
  border-radius: 10px;
  background: rgba(255, 248, 235, 0.3);
  color: #6a5a4a;
  font-size: 9px;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  white-space: nowrap;
}
.suggestion-btn:hover {
  background: rgba(82, 140, 126, 0.1);
  border-color: rgba(82, 140, 126, 0.3);
  transform: translateY(-1px);
}

/* ============================================================
   眨眼反馈
   ============================================================ */
.blink-feedback {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.8);
  background: rgba(44, 62, 80, 0.92);
  backdrop-filter: blur(12px);
  padding: 18px 36px;
  border-radius: 16px;
  border: 1px solid rgba(82, 140, 126, 0.3);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  z-index: 250;
  display: flex;
  align-items: center;
  gap: 14px;
  opacity: 0;
  pointer-events: none;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.blink-feedback.show {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
  pointer-events: none;
}

.blink-icon {
  font-size: 28px;
  animation: blinkIcon 0.6s ease-out;
}

.blink-text {
  color: #e8f0f0;
  font-size: 18px;
  font-weight: 400;
}

@keyframes blinkIcon {
  0% {
    transform: scale(0.3) rotate(-10deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.2) rotate(5deg);
  }
  100% {
    transform: scale(1) rotate(0);
    opacity: 1;
  }
}

/* ============================================================
   响应式
   ============================================================ */
@media (max-width: 768px) {
  .camera-container {
    width: 200px !important;
    height: 160px !important;
    left: 10px !important;
    top: 80px !important;
  }

  .camera-title {
    font-size: 11px;
  }

  .camera-btn-minimize,
  .camera-btn-close {
    width: 18px;
    height: 18px;
    font-size: 10px;
  }

  .camera-status {
    font-size: 10px;
    padding: 1px 10px;
  }

  .navbar {
    padding: 12px 20px;
    justify-content: center;
  }
  
  .nav-buttons {
    gap: 10px;
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .nav-btn {
    padding: 8px 16px;
    font-size: 14px;
  }
  
  .nav-icon {
    width: 18px;
    height: 18px;
  }
  
  .title-image {
    max-width: 95%;
  }
  
  .subtitle-image {
    max-width: 80%;
  }
  
  .scroll-more {
    bottom: 1rem;
  }
  
  .scroll-text {
    font-size: 1rem;
  }
  
  .status-bar {
    bottom: 70px;
    padding: 6px 18px;
  }
  
  .status-text {
    font-size: 13px;
  }

  .assistant-wrapper {
    bottom: 20px;
    right: 20px;
  }
  
  .assistant-avatar {
    width: 64px;
    height: 64px;
  }
  
  .assistant-status {
    width: 15px;
    height: 15px;
  }
  
  .assistant-dialog {
    bottom: 75px;
    width: 85vw;
    right: -10px;
  }
  .dialog-explore-btn {
  font-size: 11px;
  padding: 4px 20px;
  } 
  .dialog-bottom {
    height: 150px;
  }
  
  .dialog-messages {
    min-height: 70px;
    max-height: 100px;
  }
  
  .dialog-message {
    font-size: 11px;
  }
  
  .dialog-name {
    font-size: 12px;
  }
  
  .dialog-top-placeholder {
    min-height: 40px;
    padding-top: 6px;
  }
  
  .drag-hint {
    font-size: 9px;
  }

  .blink-feedback {
    padding: 14px 24px;
    gap: 12px;
  }
  
  .blink-icon {
    font-size: 22px;
  }
  
  .blink-text {
    font-size: 16px;
  }
}

.competition-badge {
  position: fixed;
  bottom: 16px;
  left: 20px;
  font-size: 12px;
  color: rgba(232, 240, 240, 0.35);
  letter-spacing: 1.5px;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  z-index: 20;
  user-select: none;
  pointer-events: none;
}

@media (max-width: 768px) {
  .competition-badge {
    font-size: 10px;
    bottom: 12px;
    left: 14px;
  }
}

@media (max-width: 480px) {
  .competition-badge {
    font-size: 9px;
    bottom: 10px;
    left: 12px;
  }
}

@media (max-width: 480px) {
  .camera-container {
    width: 160px !important;
    height: 130px !important;
    left: 8px !important;
    top: 72px !important;
  }

  .camera-title {
    font-size: 10px;
  }

  .camera-btn-minimize,
  .camera-btn-close {
    width: 16px;
    height: 16px;
    font-size: 9px;
  }

  .camera-status {
    font-size: 9px;
    padding: 1px 8px;
    bottom: 4px;
  }

  .drag-handle {
    display: none;
  }

  .navbar {
    padding: 10px 16px;
  }
  
  .nav-btn {
    padding: 6px 12px;
    font-size: 12px;
    gap: 4px;
  }
  
  .nav-icon {
    width: 16px;
    height: 16px;
  }
  
  .content {
    padding: 80px 1rem 1rem;
  }

  .assistant-wrapper {
    bottom: 16px;
    right: 16px;
  }
  
  .assistant-avatar {
    width: 54px;
    height: 54px;
  }
  
  .assistant-status {
    width: 13px;
    height: 13px;
  }
  
  .assistant-dialog {
    bottom: 65px;
    width: 90vw;
    right: -6px;
  }
  
  .dialog-bottom {
    height: 190px;
  }
  
  .dialog-messages {
    min-height: 55px;
    max-height: 80px;
    padding: 1px;
  }
  
  .dialog-message {
    font-size: 10px;
    gap: 3px;
  }
  
  .dialog-message .msg-text {
    padding: 2px 6px;
  }
  
  .dialog-top-placeholder {
    min-height: 30px;
    padding-top: 4px;
  }
  
  .drag-hint {
    font-size: 8px;
  }
  
  .dialog-input-area input {
    font-size: 10px;
    padding: 2px 8px;
  }
  
  .dialog-input-area button {
    font-size: 10px;
    padding: 2px 8px;
  }
  
  .suggestion-btn {
    font-size: 8px;
    padding: 1px 6px;
  }

  .blink-feedback {
    padding: 12px 18px;
    gap: 8px;
    border-radius: 12px;
  }
  
  .blink-icon {
    font-size: 18px;
  }
  
  .blink-text {
    font-size: 14px;
  }
}
</style>