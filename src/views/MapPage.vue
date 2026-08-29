<template>
  <div class="map-page">
        <!-- 引导小助手 -->
    <GuideAssistant
      ref="guideAssistantRef"
      :steps="guideSteps"
      :current-layer-index="currentLayerIndex"
      :all-loaded="allLayersLoaded"
      :accessibility-mode="accessibilityMode"
      :view-type="viewType"
      @load-layer="loadLayerByGuide"
      @switch-view="switchViewByGuide"
      @step-change="onStepChange"
      @guide-complete="onGuideComplete"
    />
    <!-- ===== 中国风装饰 ===== -->
    <div class="chinese-decoration">
      <div class="cloud c1"></div>
      <div class="cloud c2"></div>
      <div class="border-corner tl"></div>
      <div class="border-corner tr"></div>
      <div class="border-corner bl"></div>
      <div class="border-corner br"></div>
    </div>

    <div id="map" ref="mapContainer" class="map"></div>

    <!-- ===== 无障碍模式邀请弹窗 ===== -->
    <div class="accessibility-invite" v-if="showInvite && !accessibilityMode">
      <div class="invite-overlay"></div>
      <div class="invite-panel">
        <div class="invite-icon">♿</div>
        <div class="invite-title">开启无障碍模式</div>
        <div class="invite-desc">
          您可以通过以下方式操作地图：
        </div>
        <div class="invite-features">
          <div class="invite-feature">
            <span class="invite-feature-icon">👁️</span>
            <span><strong>眼动追踪</strong> — 视线移动光标，闭眼1秒点击</span>
          </div>
          <div class="invite-feature">
            <span class="invite-feature-icon">✋</span>
            <span><strong>手势控制</strong> — 握拳缩小，五指张开放大</span>
          </div>
          <div class="invite-feature">
            <span class="invite-feature-icon">👆</span>
            <span><strong>眨眼两次</strong> 即可开启此模式</span>
          </div>
        </div>
        <div class="invite-actions">
          <button class="invite-btn primary" @click="enableAccessibility">
            👁️ 眨眼两次开启
          </button>
          <button class="invite-btn secondary" @click="dismissInvite">
            暂不使用
          </button>
        </div>
        <div class="invite-hint">
          ⏳ 等待您眨眼两次...
        </div>
      </div>
    </div>

    <!-- 无障碍模式状态 -->
    <div class="accessibility-status" v-if="accessibilityMode">
      <span class="status-dot tracking"></span>
      <span>♿ 无障碍模式已开启</span>
      <button class="status-close" @click="toggleAccessibility">✕</button>
    </div>

    <!-- 状态提示 -->
    <div class="status-tip" v-if="statusMessage">
      {{ statusMessage }}
    </div>

    <!-- 图层指示器 -->
    <div class="layer-indicator" v-if="activeLayers.length > 0">
      <div class="layer-indicator-title">已加载图层</div>
      <span v-for="(layer, index) in activeLayers" :key="index" class="layer-tag">
        {{ index + 1 }}. {{ layer }}
      </span>
    </div>

    <!-- 生态损害图例 -->
    <div class="damage-legend" v-if="showDamageLegend && damageLegendData">
      <div class="legend-title">{{ damageLegendData.title }}</div>
      <div class="legend-item" v-for="item in damageLegendData.items" :key="item.id">
        <span class="legend-color" :style="{ background: item.color }"></span>
        <span class="legend-label">{{ item.label }}</span>
        <span class="legend-desc">{{ item.desc }}</span>
      </div>
      <div class="legend-divider"></div>
      <div class="legend-stats">
        <div>📊 非法穿越：{{ damageLegendData.stats.totalTrips }}次</div>
        <div>👥 参与人数：{{ damageLegendData.stats.totalPeople }}人</div>
        <div>💰 收费：{{ damageLegendData.stats.totalFee }}元</div>
      </div>
      <div class="legend-disclaimer">
        {{ damageLegendData.disclaimer }}
      </div>
    </div>

    <!-- 风险图例 -->
    <div class="risk-legend" v-if="showRiskLegend && riskLegendData">
      <div class="legend-title">{{ riskLegendData.title }}</div>
      <div class="legend-section">
        <div class="legend-sub-title">风险等级</div>
        <div class="legend-item" v-for="item in riskLegendData.types" :key="item.id">
          <span class="legend-color" :style="{ background: item.color }"></span>
          <span class="legend-label" :style="{ color: item.color }">{{ item.label }}</span>
          <span class="legend-desc">{{ item.description }}</span>
        </div>
      </div>
      <div class="legend-section">
        <div class="legend-sub-title">风险类型</div>
        <div class="legend-item" v-for="cat in riskLegendData.categories" :key="cat.id">
          <span class="legend-color" :style="{ background: cat.color, opacity: 0.6 }"></span>
          <span class="legend-label">{{ cat.label }}</span>
        </div>
      </div>
      <div class="legend-disclaimer">
        {{ riskLegendData.disclaimer }}
      </div>
    </div>

    <!-- 控制按钮 -->
    <div class="controls">
      <div class="controls-left">
        <button 
          v-for="(btn, index) in layerButtons" 
          :key="index"
          @click="loadNextLayer(index)"
          class="control-btn layer-btn"
          :class="{ 
            'btn-active': currentLayerIndex >= index,
            'btn-loading': isLoading === index
          }"
          :disabled="isLoading !== null || currentLayerIndex >= index"
        >
          <span v-if="isLoading === index" class="spinner-small"></span>
          <span v-else>{{ btn.icon }} {{ btn.label }}</span>
        </button>
      </div>
      <div class="controls-right">
        <button @click="resetView" class="control-btn">🌐 重置视图</button>
      </div>
    </div>

    <!-- 返回首页按钮 -->
    <button class="back-home-btn" @click="goBackHome">← 返回首页</button>
  </div>
</template>


<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick ,watch} from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  loadChinaBaseMap, 
  loadEcoRedlineLayer, 
  loadGovernanceLayer,
  loadRiskLayer,
  loadTrespasserLayer,
  loadDamageLayer,
  loadJusticeLayer,
} from '@/map-layers'

const router = useRouter()
const route = useRoute()

const mapContainer = ref(null)
let map = null
let popup = null
const statusMessage = ref('')
const activeLayers = ref([])
const currentLayerIndex = ref(-1)
const isLoading = ref(null)

// ===== 无障碍模式 =====
const accessibilityMode = ref(false)
const showInvite = ref(true) // 显示邀请弹窗
let inviteAutoCloseTimer = null

// ===== 眼动追踪相关 =====
let faceMesh = null
let animationId = null
let handLandmarker = null
let isBlinking = false
let blinkStartTime = 0
let isProcessingBlink = false
let gazeX = 0.5
let gazeY = 0.5
let lastClickTime = 0

// ===== 眨眼检测（用于开启无障碍） =====
let blinkCountForEnable = 0
let lastBlinkTimeForEnable = 0
const BLINK_ENABLE_INTERVAL = 1000 // 1秒内两次眨眼

// ===== 手势追踪 =====
let lastGesture = ''
let gestureDebounceTimer = null

// ===== 风险图例相关 =====
const showRiskLegend = ref(false)
const riskLegendData = ref(null)
const showDamageLegend = ref(false)
const damageLegendData = ref(null)

// ========== Maptiler 配置 ==========
const MAP_ID = '019eaa60-224f-7f61-8746-ad3efbd51c9c'
const API_KEY = 'cUeIpGNy8YxAK7lLuEB6'
const viewType = ref(route.query.view || 'national')

// ========== 图层配置 ==========
const layerButtons = computed(() => {
  if (viewType.value === 'national') {
    return [
      { id: 'china-base', label: '中国底图', icon: '🗺️' },
      { id: 'eco-redline', label: '生态红线地图', icon: '🟢' },
      { id: 'governance', label: '生态治理体系地图', icon: '🏛️' },
      { id: 'risk', label: '环境风险地图', icon: '🔥' },
    ]
  }
  return [
    { id: 'china-base', label: '中国底图', icon: '🗺️' },
    { id: 'eco-redline', label: '生态红线底图', icon: '🟢' },
    { id: 'trespasser', label: '越界者地图', icon: '🚩' },
    { id: 'damage', label: '生态损害地图', icon: '🌿' },
    { id: 'justice', label: '法治路径地图', icon: '⚖️' },
  ]
})

// 导入引导组件
import GuideAssistant from '@/components/GuideAssistant.vue'

// ===== 引导相关 =====
const guideAssistantRef = ref(null)
const allLayersLoaded = ref(false)

// ===== 定义引导步骤 =====
const guideSteps = computed(() => {
  if (viewType.value === 'national') {
    return [
      {
        icon: '🗺️',
        message: '欢迎来到全国视角！让我们一步步探索生态环境法典的空间分布。',
        hint: '点击下方"开始探索"按钮，跟随我一起了解',
        layerIndex: null
      },
      {
        icon: '🟢',
        message: '这是「生态红线地图」—— 法律划定的不可触碰空间。',
        hint: '红色区域代表生态保护红线，禁止开发建设活动',
        layerIndex: 1,  // 对应 layerButtons 的索引
        duration: 5000
      },
      {
        icon: '🏛️',
        message: '这是「生态治理体系地图」—— 从中央到地方，环保部门的职责网络。',
        hint: '红色节点是生态环境部，绿色节点是各省环保部门',
        layerIndex: 2,
        duration: 5000
      },
      {
        icon: '🔥',
        message: '这是「环境风险地图」—— 法典重点关注的生态脆弱区和污染区域。',
        hint: '颜色越深代表风险越高，点击区域可查看详情',
        layerIndex: 3,
        duration: 5000
      },
      {
        icon: '📌',
        message: '全国视角已探索完毕！接下来我们切换到「案例视角」，看看法律如何落地。',
        hint: '即将切换...',
        switchView: 'case',
        duration: 3000
      }
    ]
  } else {
    return [
      {
        icon: '🗺️',
        message: '欢迎来到案例视角！让我们一起追踪秦岭非法穿越案，看法律如何抵达群山深处。',
        hint: '点击"开始探索"跟随案件脉络',
        layerIndex: null
      },
      {
        icon: '🚩',
        message: '这是「越界者地图」—— 展示非法穿越如何突破法律边界。',
        hint: '红色标记是涉案核心地点：鳌山、光头山、鹿角梁等',
        layerIndex: 2,  // 对应 case 视角的 trespasser
        duration: 5000
      },
      {
        icon: '🌿',
        message: '这是「生态损害地图」—— 展示非法穿越造成的生态损害扩散链条。',
        hint: '热力图颜色越深，损害越严重',
        layerIndex: 3,
        duration: 5000
      },
      {
        icon: '⚖️',
        message: '这是「法治路径地图」—— 完整展示公益诉讼追责的全过程。',
        hint: '点击地图上的标记，查看法治路径详情',
        layerIndex: 4,
        duration: 5000
      },
      {
        icon: '🎉',
        message: '太棒了！你已经完整探索了生态环境法典的全国视角和案例视角！',
        hint: '法律不仅在城市，也抵达群山深处',
        layerIndex: null,
        duration: 4000
      }
    ]
  }
})

// ===== 引导事件处理 =====
const loadLayerByGuide = (index) => {
  // 如果 index 为 null 或 undefined，跳过
  if (index === null || index === undefined) return
  loadNextLayer(index)
}

const switchViewByGuide = (view) => {
  // 切换视图
  viewType.value = view
  // 更新 URL
  router.push({
    query: { ...route.query, view: view }
  })
  // 重置图层状态
  currentLayerIndex.value = -1
  activeLayers.value = []
  // 重新加载底图
  setTimeout(() => {
    loadNextLayer(0) // 加载底图
    // 如果无障碍模式开启，继续自动播放
    if (accessibilityMode.value) {
      setTimeout(() => {
        guideAssistantRef.value?.goToStep(1)
      }, 1000)
    }
  }, 500)
}

const onStepChange = (index, step) => {
  console.log(`📍 引导步骤 ${index + 1}:`, step.message)
  // 更新状态消息
  statusMessage.value = step.hint || step.message
  setTimeout(() => {
    statusMessage.value = ''
  }, 3000)
}

const onGuideComplete = () => {
  statusMessage.value = '🎉 探索完成！你可以自由浏览地图了'
  setTimeout(() => {
    statusMessage.value = ''
  }, 4000)
}

// ===== 监听无障碍模式，自动开始引导 =====
watch(accessibilityMode, (enabled) => {
  if (enabled) {
    // 无障碍模式开启，自动开始引导并开启自动播放
    setTimeout(() => {
      guideAssistantRef.value?.startGuide()
      // 延迟开启自动播放
      setTimeout(() => {
        // 触发自动播放
        const toggleBtn = document.querySelector('.header-btn')
        if (toggleBtn) toggleBtn.click()
      }, 1000)
    }, 1500)
  }
})

// ===== 在加载完成后标记 =====
// 修改 loadNextLayer 函数，在所有图层加载完成后设置 allLayersLoaded
// 在 loadNextLayer 的 case 分支中，当 index === layerButtons.value.length - 1 时：
// allLayersLoaded.value = true

// ============================================================
// 眼动追踪 - 加载模型
// ============================================================

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

// ============================================================
// 眼动追踪 - 核心检测
// ============================================================

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
  const v1 = Math.sqrt(Math.pow(p2.x - p6.x, 2) + Math.pow(p2.y - p6.y, 2))
  const v2 = Math.sqrt(Math.pow(p3.x - p5.x, 2) + Math.pow(p3.y - p5.y, 2))
  const h = Math.sqrt(Math.pow(p1.x - p4.x, 2) + Math.pow(p1.y - p4.y, 2))
  if (h === 0) return 0
  return (v1 + v2) / (2 * h)
}

const calculateGaze = (landmarks) => {
  const leftEyeCenter = {
    x: (landmarks[33].x + landmarks[133].x) / 2,
    y: (landmarks[33].y + landmarks[133].y) / 2
  }
  const rightEyeCenter = {
    x: (landmarks[362].x + landmarks[263].x) / 2,
    y: (landmarks[362].y + landmarks[263].y) / 2
  }
  const centerX = (leftEyeCenter.x + rightEyeCenter.x) / 2
  const centerY = (leftEyeCenter.y + rightEyeCenter.y) / 2
  return { x: Math.max(0, Math.min(1, centerX)), y: Math.max(0, Math.min(1, centerY)) }
}

// 获取视频元素
const getVideo = () => {
  // 尝试找到欢迎页面的视频
  let video = document.querySelector('video')
  if (!video) {
    // 如果没有，创建一个隐藏的
    video = document.createElement('video')
    video.style.display = 'none'
    video.autoplay = true
    video.playsInline = true
    document.body.appendChild(video)
    
    navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: 640, height: 480 }
    }).then(stream => {
      video.srcObject = stream
      video.play()
    }).catch(() => {})
  }
  return video
}

// ============================================================
// 眼动追踪 - 主循环
// ============================================================

const detectFace = () => {
  if (!faceMesh) {
    animationId = requestAnimationFrame(detectFace)
    return
  }

  try {
    const video = getVideo()
    if (!video || video.readyState < 2) {
      animationId = requestAnimationFrame(detectFace)
      return
    }

    const results = faceMesh.detectForVideo(video, performance.now())
    
    if (results.faceLandmarks && results.faceLandmarks.length > 0) {
      const landmarks = results.faceLandmarks[0]
      
      // 眨眼检测
      const leftEye = getEyeLandmarks(landmarks, 'left')
      const rightEye = getEyeLandmarks(landmarks, 'right')
      const earLeft = calculateEAR(leftEye)
      const earRight = calculateEAR(rightEye)
      const ear = (earLeft + earRight) / 2
      
      const EYE_CLOSED_THRESHOLD = 0.95
      const now = Date.now()
      
      if (ear > EYE_CLOSED_THRESHOLD) {
        // 闭眼
        if (!isBlinking) {
          isBlinking = true
          blinkStartTime = now
          
          // ==== 检测眨眼两次开启无障碍 ====
          if (!accessibilityMode.value && showInvite.value) {
            if (now - lastBlinkTimeForEnable < BLINK_ENABLE_INTERVAL) {
              blinkCountForEnable++
              if (blinkCountForEnable >= 2) {
                // 两次眨眼！开启无障碍
                enableAccessibility()
                blinkCountForEnable = 0
              }
            } else {
              blinkCountForEnable = 1
            }
            lastBlinkTimeForEnable = now
          }
          
          if (accessibilityMode.value) {
            statusMessage.value = '⏳ 闭眼中...'
          }
          if (accessibilityMode.value && guideAssistantRef.value) {
    guideAssistantRef.value.triggerBlinkDetected()
  }
        }
      } else {
        // 睁眼
        if (isBlinking) {
          const elapsed = (now - blinkStartTime) / 1000
          isBlinking = false

          // 🆕 眨眼检测 - 如果眨眼时间短（0.1-0.3秒），触发引导组件的眨眼计数
          if (elapsed > 0.05 && elapsed < 0.4 && guideAssistantRef.value) {
            guideAssistantRef.value.triggerBlinkDetected()
          }
          
          if (accessibilityMode.value) {
            // 闭眼1秒 → 点击
            if (elapsed >= 1 && elapsed < 2 && !isProcessingBlink) {
              isProcessingBlink = true
              statusMessage.value = '✅ 闭眼1秒！点击'
              performClick()
              setTimeout(() => { isProcessingBlink = false }, 500)
            }
            // 闭眼2秒 → 重置视图
            else if (elapsed >= 2 && elapsed < 3 && !isProcessingBlink) {
              isProcessingBlink = true
              statusMessage.value = '✅ 闭眼2秒！重置视图'
              resetView()
              setTimeout(() => { isProcessingBlink = false }, 500)
            }
            // 闭眼3秒 → 返回首页
            else if (elapsed >= 3 && !isProcessingBlink) {
              isProcessingBlink = true
              statusMessage.value = '✅ 闭眼3秒！返回首页'
              goBackHome()
              setTimeout(() => { isProcessingBlink = false }, 500)
            }
            else if (elapsed > 0.1) {
              statusMessage.value = `⏳ 闭眼 ${elapsed.toFixed(1)}秒`
            }
          }
        }
      }
      
      // 凝视位置（仅无障碍模式开启时移动光标）
      if (accessibilityMode.value) {
        const gaze = calculateGaze(landmarks)
        gazeX = gaze.x
        gazeY = gaze.y
        const screenX = gazeX * window.innerWidth
        const screenY = gazeY * window.innerHeight
        moveCursor(screenX, screenY)
      }
    }
  } catch (error) {
    // 静默处理
  }
  
  animationId = requestAnimationFrame(detectFace)
}

// ============================================================
// 手势识别
// ============================================================

// ============================================================
// 手势识别 - 修改
// ============================================================

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
  
  // 五指张开 → 放大
  if (thumbExtended && indexExtended && middleExtended && ringExtended && pinkyExtended) {
    return 'five'  // 🖐️ 放大
  }
  // 握拳 → 缩小
  if (!thumbExtended && !indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
    return 'fist'  // ✊ 缩小
  }
  // 点赞 → 重置视图
  if (thumbExtended && !indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
    return 'thumbs_up'
  }
  // 食指指向 → 点击
  if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
    return 'point'
  }
  if (thumbExtended && indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
    return 'one'
  }
  return 'none'
}

// ============================================================
// 手势追踪 - 修改
// ============================================================

const detectHand = () => {
  if (!handLandmarker || !accessibilityMode.value) return

  try {
    const video = getVideo()
    if (!video || video.readyState < 2) return

    const results = handLandmarker.detectForVideo(video, performance.now())
    
    if (results.landmarks && results.landmarks.length > 0) {
      const landmarks = results.landmarks[0]
      const gesture = detectGesture(landmarks)
      
      if (gesture !== 'none' && gesture !== lastGesture) {
        lastGesture = gesture
        
        if (gesture === 'five') {
          // 🖐️ 五指张开 → 放大视图
          statusMessage.value = '🖐️ 五指张开 → 放大'
          zoomIn()
        } else if (gesture === 'fist') {
          // ✊ 握拳 → 缩小视图
          statusMessage.value = '✊ 握拳 → 缩小'
          zoomOut()
        } else if (gesture === 'thumbs_up') {
          // 👍 点赞 → 重置视图
          statusMessage.value = '👍 重置视图'
          resetView()
        } else if (gesture === 'point') {
          // 👆 指向 → 点击
          statusMessage.value = '👆 点击'
          performClick()
        }
        
        if (gestureDebounceTimer) {
          clearTimeout(gestureDebounceTimer)
        }
        gestureDebounceTimer = setTimeout(() => {
          lastGesture = ''
        }, 500)
      }
    }
  } catch (error) {
    // 静默处理
  }
}

// ============================================================
// 缩放控制函数
// ============================================================

const zoomIn = () => {
  if (!map) return
  const currentZoom = map.getZoom()
  map.flyTo({
    zoom: Math.min(currentZoom + 1, map.getMaxZoom() || 20),
    duration: 300
  })
}

const zoomOut = () => {
  if (!map) return
  const currentZoom = map.getZoom()
  map.flyTo({
    zoom: Math.max(currentZoom - 1, map.getMinZoom() || 0),
    duration: 300
  })
}
// ============================================================
// 自定义光标
// ============================================================

let cursorElement = null

const createCursor = () => {
  if (cursorElement) return
  
  cursorElement = document.createElement('div')
  cursorElement.style.cssText = `
    position: fixed;
    pointer-events: none;
    z-index: 9998;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255, 215, 0, 0.25) 0%, rgba(255, 215, 0, 0.08) 60%, transparent 100%);
    border: 2.5px solid rgba(255, 215, 0, 0.7);
    transform: translate(-50%, -50%);
    transition: all 0.06s ease-out;
    box-shadow: 0 0 30px rgba(255, 215, 0, 0.15);
  `
  document.body.appendChild(cursorElement)
}

const moveCursor = (x, y) => {
  if (!accessibilityMode.value || !cursorElement) return
  
  cursorElement.style.left = x + 'px'
  cursorElement.style.top = y + 'px'
  
  // 触发鼠标移动事件
  const event = new MouseEvent('mousemove', {
    clientX: x,
    clientY: y,
    bubbles: true
  })
  document.dispatchEvent(event)
}

const performClick = () => {
  if (!accessibilityMode.value) return
  
  const now = Date.now()
  if (now - lastClickTime < 500) return
  lastClickTime = now
  
  const x = gazeX * window.innerWidth
  const y = gazeY * window.innerHeight
  
  const event = new MouseEvent('click', {
    clientX: x,
    clientY: y,
    bubbles: true
  })
  document.dispatchEvent(event)
  
  if (cursorElement) {
    cursorElement.style.transform = 'translate(-50%, -50%) scale(0.6)'
    cursorElement.style.borderColor = '#4CAF50'
    setTimeout(() => {
      if (cursorElement) {
        cursorElement.style.transform = 'translate(-50%, -50%) scale(1)'
        cursorElement.style.borderColor = 'rgba(255, 215, 0, 0.7)'
      }
    }, 200)
  }
}

// ============================================================
// 无障碍模式控制
// ============================================================

const enableAccessibility = () => {
  accessibilityMode.value = true
  showInvite.value = false
  statusMessage.value = '♿ 无障碍模式已开启'
  
  createCursor()
  
  if (inviteAutoCloseTimer) {
    clearTimeout(inviteAutoCloseTimer)
    inviteAutoCloseTimer = null
  }
  
  // 启动眼动追踪
  if (!animationId) {
    detectFace()
  }
  
  // 启动手势识别
  if (!gestureDebounceTimer) {
    setInterval(detectHand, 100)
  }
}

const toggleAccessibility = () => {
  accessibilityMode.value = !accessibilityMode.value
  
  if (accessibilityMode.value) {
    statusMessage.value = '♿ 无障碍模式已开启'
    createCursor()
    if (!animationId) {
      detectFace()
    }
  } else {
    statusMessage.value = '♿ 无障碍模式已关闭'
    if (cursorElement) {
      cursorElement.remove()
      cursorElement = null
    }
  }
}

const dismissInvite = () => {
  showInvite.value = false
  statusMessage.value = '💡 可随时通过下方按钮开启无障碍模式'
  setTimeout(() => {
    statusMessage.value = ''
  }, 3000)
}

// ============================================================
// 加载 Maptiler SDK
// ============================================================

const loadMaptilerSDK = () => {
  return new Promise((resolve, reject) => {
    if (window.maptilersdk) {
      resolve(window.maptilersdk)
      return
    }
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://cdn.maptiler.com/maptiler-sdk-js/v2.0.0/maptiler-sdk.css'
    document.head.appendChild(link)
    const script = document.createElement('script')
    script.src = 'https://cdn.maptiler.com/maptiler-sdk-js/v2.0.0/maptiler-sdk.umd.js'
    script.onload = () => { resolve(window.maptilersdk) }
    script.onerror = () => { reject(new Error('Failed to load Maptiler SDK')) }
    document.head.appendChild(script)
  })
}

// ============================================================
// 初始化地图
// ============================================================

const initMap = async () => {
  if (!mapContainer.value) return
  
  try {
    const maptilersdk = await loadMaptilerSDK()
    maptilersdk.config.apiKey = API_KEY
    
    map = new maptilersdk.Map({
      container: mapContainer.value,
      style: `https://api.maptiler.com/maps/${MAP_ID}/style.json?key=${API_KEY}`,
      center: [104.0, 35.0],
      zoom: 5,
      pitch: 0,
      bearing: 0
    })
    
    map.addControl(new maptilersdk.NavigationControl(), 'top-right')
    
    map.on('load', () => {
      console.log('✅ 地图加载完成')
      popup = new maptilersdk.Popup({
        closeButton: true,
        closeOnClick: false,
        maxWidth: '360px',
        className: 'risk-popup-container'
      })
      console.log('✅ Popup 已创建')
    })
    
  } catch (error) {
    console.error('❌ 地图加载失败:', error)
  }
}

// ============================================================
// 加载图层
// ============================================================

const loadNextLayer = async (index) => {
  if (isLoading.value !== null || currentLayerIndex.value >= index) return
  
  isLoading.value = index
  
  try {
    const layerId = layerButtons.value[index].id
    const layerLabel = layerButtons.value[index].label
    
    if (!map.getSource('china-boundary')) {
      statusMessage.value = '🗺️ 加载中国底图...'
      await loadChinaBaseMap(map)
    }
    
    statusMessage.value = `📦 加载 ${layerLabel}...`
    
    switch (layerId) {
      case 'china-base':
        activeLayers.value.push('🗺️ 中国底图')
        break
        
      case 'eco-redline':
        await loadEcoRedlineLayer(map, { 
          layerId: 'eco-redline',
          texturePath: '/images/eco-redline-texture.png'
        })
        activeLayers.value.push('🟢 生态红线地图')
        break
        
      case 'governance':
        await loadGovernanceLayer(map, statusMessage)
        activeLayers.value.push('🏛️ 生态治理体系地图')
        break
        
      case 'risk':
        showRiskLegend.value = true
        if (!popup) {
          await new Promise((resolve) => {
            let attempts = 0
            const checkPopup = setInterval(() => {
              attempts++
              if (popup) {
                clearInterval(checkPopup)
                resolve()
              } else if (attempts > 30) {
                clearInterval(checkPopup)
                resolve()
              }
            }, 100)
          })
        }
        await loadRiskLayer(map, {
          popup: popup,
          onLegendReady: (legendData) => {
            riskLegendData.value = legendData
          },
          onHover: (props, e) => {
            if (props) {
              statusMessage.value = `📍 ${props.name}`
            } else {
              statusMessage.value = ''
            }
          }
        })
        activeLayers.value.push('🔥 环境风险地图')
        break

      case 'trespasser':
        await loadTrespasserLayer(map, {
          popup: popup,
          onHover: (props, e) => {
            if (props) {
              statusMessage.value = `📍 ${props.name}`
            } else {
              statusMessage.value = ''
            }
          }
        })
        activeLayers.value.push('🚩 越界者地图')
        break

      case 'damage':
        showDamageLegend.value = true
        await loadDamageLayer(map, {
          popup: popup,
          onHover: (props, e) => {
            if (props) {
              statusMessage.value = `📍 ${props.label || props.type}`
            } else {
              statusMessage.value = ''
            }
          },
          onStatsReady: (stats) => {
            console.log('📊 损害统计:', stats)
          },
          onLegendReady: (legendData) => {
            damageLegendData.value = legendData
          }
        })
        activeLayers.value.push('🌿 生态损害地图')
        break

      case 'justice':
        await loadJusticeLayer(map, {
          popup: popup,
          onHover: (props, e) => {
            if (props) {
              statusMessage.value = `⚖️ ${props.icon || ''} ${props.name}`
            } else {
              statusMessage.value = ''
            }
          }
        })
        activeLayers.value.push('⚖️ 法治路径地图')
        break
        
      default:
        console.warn(`未知图层: ${layerId}`)
    }
    
    currentLayerIndex.value = index
    // 检查是否所有图层都已加载
    if (index === layerButtons.value.length - 1) {
      allLayersLoaded.value = true
      console.log('🎉 所有图层加载完成！')
    }
    console.log(`✅ 图层 ${index + 1} 加载完成`)
    statusMessage.value = `✅ ${layerLabel} 加载完成`
    
    setTimeout(() => {
      statusMessage.value = ''
    }, 3000)
    
  } catch (err) {
    console.error(`❌ 加载图层 ${index + 1} 失败:`, err)
    statusMessage.value = `❌ 加载失败: ${err.message || '未知错误'}`
  } finally {
    isLoading.value = null
  }
}

// ============================================================
// 其他功能
// ============================================================

const resetView = () => {
  if (!map) return
  map.flyTo({
    center: [104.0, 35.0],
    zoom: 5,
    duration: 1500
  })
}

const goBackHome = () => {
  router.push('/')
}

// ============================================================
// 生命周期
// ============================================================

onMounted(async () => {
  console.log('🔄 MapPage mounted, view:', route.query.view)
  await nextTick()
  await initMap()
  
  // 预加载无障碍模型
  try {
    await Promise.all([
      loadFaceMesh(),
      loadHandLandmarker()
    ])
    console.log('✅ 无障碍模型预加载完成')
    
    // 启动眼动追踪（用于检测眨眼开启）
    detectFace()
    
    // 邀请弹窗10秒后自动关闭
    inviteAutoCloseTimer = setTimeout(() => {
      if (showInvite.value) {
        dismissInvite()
      }
    }, 15000)
    
  } catch (error) {
    console.warn('⚠️ 无障碍模型加载失败:', error)
    showInvite.value = false
  }
  // 如果是从欢迎页跳转过来，自动展开引导
  if (route.query.from === 'welcome') {
    setTimeout(() => {
      guideAssistantRef.value?.startGuide()
    }, 1000)
  }
  
  // 无障碍模式下自动开始引导
  if (accessibilityMode.value) {
    setTimeout(() => {
      guideAssistantRef.value?.startGuide()
    }, 2000)
  }
})

onUnmounted(() => {
  console.log('🧹 清理MapPage资源')
  
  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = null
  }
  
  if (popup) {
    popup.remove()
    popup = null
  }
  
  if (map) {
    map.remove()
    map = null
  }
  
  if (cursorElement) {
    cursorElement.remove()
    cursorElement = null
  }
  
  if (gestureDebounceTimer) {
    clearTimeout(gestureDebounceTimer)
  }
  
  if (inviteAutoCloseTimer) {
    clearTimeout(inviteAutoCloseTimer)
  }
})
</script>

<style scoped>
/* ============================================================
   ===== MapPage 中国风样式 =====
   ============================================================ */

.map-page {
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background: linear-gradient(180deg, #f5efe0, #ede4d0);
}

.map {
  width: 100%;
  height: 100%;
}

/* ===== 中国风装饰 ===== */
.chinese-decoration {
  position: fixed;
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
  border-radius: 80px;
  background: rgba(200, 180, 150, 0.06);
  animation: cloudFloat 20s ease-in-out infinite;
}

.cloud::before,
.cloud::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  background: inherit;
}

.c1 {
  width: 180px;
  height: 55px;
  top: 8%;
  left: 3%;
  animation-duration: 22s;
}
.c1::before { width: 70px; height: 70px; top: -35px; left: 18px; }
.c1::after { width: 50px; height: 50px; top: -25px; left: 70px; }

.c2 {
  width: 140px;
  height: 45px;
  bottom: 15%;
  right: 3%;
  animation-duration: 25s;
  animation-direction: reverse;
}
.c2::before { width: 55px; height: 55px; top: -28px; left: 12px; }
.c2::after { width: 40px; height: 40px; top: -20px; left: 50px; }

@keyframes cloudFloat {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(25px); }
}

.border-corner {
  position: fixed;
  width: 45px;
  height: 45px;
  border-color: rgba(180, 120, 60, 0.12);
  border-style: solid;
  border-width: 0;
  z-index: 2;
}
.tl { top: 16px; left: 16px; border-top-width: 2px; border-left-width: 2px; }
.tr { top: 16px; right: 16px; border-top-width: 2px; border-right-width: 2px; }
.bl { bottom: 16px; left: 16px; border-bottom-width: 2px; border-left-width: 2px; }
.br { bottom: 16px; right: 16px; border-bottom-width: 2px; border-right-width: 2px; }

/* ===== 状态提示 - 中国风 ===== */
.status-tip {
  position: fixed;
  top: 130px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 248, 235, 0.85);
  backdrop-filter: blur(8px);
  color: #4a3a2a;
  padding: 8px 24px;
  border-radius: 30px;
  font-size: 14px;
  z-index: 100;
  border: 1px solid rgba(180, 120, 60, 0.15);
  font-family: '华文楷体', 'KaiTi', serif;
  letter-spacing: 1px;
  box-shadow: 0 2px 16px rgba(139, 115, 85, 0.06);
}

/* ===== 图层指示器 ===== */
.layer-indicator {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 100;
  background: rgba(255, 248, 235, 0.9);
  backdrop-filter: blur(8px);
  padding: 12px 16px;
  border-radius: 12px;
  box-shadow: 0 2px 16px rgba(139, 115, 85, 0.08);
  min-width: 160px;
  max-width: 220px;
  border: 1px solid rgba(180, 120, 60, 0.1);
}

.layer-indicator-title {
  font-size: 12px;
  font-weight: 600;
  color: #5a4a3a;
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(180, 120, 60, 0.1);
  font-family: '华文楷体', 'KaiTi', serif;
  letter-spacing: 1px;
}

.layer-tag {
  display: block;
  padding: 4px 10px;
  margin-bottom: 4px;
  background: rgba(200, 180, 150, 0.1);
  color: #5a4a3a;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  animation: slideIn 0.3s ease-out;
  border-left: 3px solid #8a7a5a;
  font-family: '华文楷体', 'KaiTi', serif;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

/* ===== 图例 - 中国风 ===== */
.risk-legend,
.damage-legend {
  position: fixed;
  bottom: 100px;
  right: 20px;
  z-index: 100;
  background: rgba(255, 248, 235, 0.9);
  backdrop-filter: blur(8px);
  padding: 16px 20px;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(139, 115, 85, 0.08);
  min-width: 200px;
  max-width: 280px;
  border: 1px solid rgba(180, 120, 60, 0.1);
}

.legend-title {
  font-size: 15px;
  font-weight: 700;
  color: #4a3a2a;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 2px solid rgba(180, 120, 60, 0.15);
  font-family: '华文楷体', 'KaiTi', serif;
  letter-spacing: 1px;
}

.legend-section { margin-bottom: 10px; }
.legend-sub-title {
  font-size: 12px;
  font-weight: 600;
  color: #6a5a4a;
  margin-bottom: 4px;
  font-family: '华文楷体', 'KaiTi', serif;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 3px 0;
  font-size: 12px;
}
.legend-color {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  flex-shrink: 0;
  border: 1px solid rgba(0, 0, 0, 0.06);
}
.legend-label {
  font-weight: 600;
  color: #4a3a2a;
  min-width: 70px;
  font-size: 12px;
}
.legend-desc {
  font-size: 10px;
  color: #8a7a6a;
  flex: 1;
}
.legend-divider { height: 1px; background: rgba(180, 120, 60, 0.1); margin: 8px 0; }
.legend-stats { font-size: 12px; color: #5a4a3a; line-height: 1.8; }
.legend-disclaimer {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(180, 120, 60, 0.1);
  font-size: 11px;
  color: #8a7a6a;
  line-height: 1.5;
  text-align: center;
}

/* ===== 控制按钮 - 中国风 ===== */
.controls {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  display: flex;
  gap: 16px;
  background: rgba(255, 248, 235, 0.9);
  backdrop-filter: blur(12px);
  padding: 12px 20px;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(139, 115, 85, 0.08);
  flex-wrap: wrap;
  justify-content: center;
  max-width: 90%;
  border: 1px solid rgba(180, 120, 60, 0.1);
}

.controls-left { display: flex; gap: 8px; flex-wrap: wrap; }
.controls-right { display: flex; gap: 8px; }

.control-btn {
  padding: 6px 16px;
  border: 1.5px solid rgba(180, 120, 60, 0.2);
  border-radius: 30px;
  background: rgba(255, 248, 235, 0.5);
  color: #5a4a3a;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  font-family: '华文楷体', 'KaiTi', serif;
  letter-spacing: 0.5px;
}

.control-btn:hover:not(:disabled) {
  background: rgba(180, 120, 60, 0.1);
  border-color: rgba(180, 120, 60, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(139, 115, 85, 0.08);
}

.control-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.layer-btn.btn-active {
  background: rgba(180, 120, 60, 0.15);
  border-color: rgba(180, 120, 60, 0.4);
  color: #3a2a1a;
}

.layer-btn.btn-loading {
  background: rgba(39, 174, 96, 0.15);
  border-color: rgba(39, 174, 96, 0.3);
  color: #27ae60;
}

.spinner-small {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(180, 120, 60, 0.2);
  border-top-color: #8a7a5a;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
}

/* ===== 返回按钮 ===== */
.back-home-btn {
  position: fixed;
  top: 20px;
  left: 20px;
  padding: 10px 22px;
  background: rgba(255, 248, 235, 0.85);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(180, 120, 60, 0.15);
  border-radius: 30px;
  font-size: 14px;
  font-weight: 500;
  color: #5a4a3a;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(139, 115, 85, 0.06);
  z-index: 100;
  transition: all 0.3s;
  font-family: '华文楷体', 'KaiTi', serif;
  letter-spacing: 0.5px;
}

.back-home-btn:hover {
  transform: translateX(-3px);
  background: rgba(255, 248, 235, 0.95);
  border-color: rgba(180, 120, 60, 0.3);
  box-shadow: 0 4px 20px rgba(139, 115, 85, 0.08);
}

/* ===== 无障碍弹窗 - 中国风 ===== */
.accessibility-invite {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.5s ease-out;
}

.invite-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(50, 40, 30, 0.4);
  backdrop-filter: blur(6px);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.invite-panel {
  position: relative;
  z-index: 1;
  background: linear-gradient(160deg, #f8f2e6, #f0e8d8);
  border-radius: 24px;
  padding: 36px 40px 28px;
  max-width: 480px;
  width: 92%;
  box-shadow: 0 20px 60px rgba(50, 40, 30, 0.2);
  animation: slideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1);
  border: 1px solid rgba(180, 120, 60, 0.12);
}

@keyframes slideUp {
  from { transform: translateY(30px) scale(0.96); opacity: 0; }
  to { transform: translateY(0) scale(1); opacity: 1; }
}

.invite-icon { font-size: 48px; text-align: center; margin-bottom: 8px; }
.invite-title {
  font-size: 22px;
  font-weight: 700;
  color: #3a2a1a;
  text-align: center;
  margin-bottom: 6px;
  font-family: '华文楷体', 'KaiTi', serif;
  letter-spacing: 2px;
}
.invite-desc { text-align: center; color: #6a5a4a; font-size: 14px; margin-bottom: 16px; font-family: '华文楷体', 'KaiTi', serif; }

.invite-features {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}
.invite-feature {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: rgba(255, 248, 235, 0.5);
  border-radius: 10px;
  font-size: 14px;
  color: #4a3a2a;
  line-height: 1.5;
  border: 1px solid rgba(180, 120, 60, 0.06);
}
.invite-feature-icon { font-size: 22px; flex-shrink: 0; }
.invite-feature strong { color: #3a2a1a; }

.invite-actions { display: flex; gap: 12px; flex-wrap: wrap; }
.invite-btn {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 120px;
  font-family: '华文楷体', 'KaiTi', serif;
  letter-spacing: 1px;
}
.invite-btn.primary {
  background: linear-gradient(135deg, #8a7a5a, #6a5a4a);
  color: white;
}
.invite-btn.primary:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 20px rgba(106, 90, 74, 0.25);
}
.invite-btn.secondary {
  background: rgba(200, 180, 150, 0.2);
  color: #6a5a4a;
}
.invite-btn.secondary:hover { background: rgba(200, 180, 150, 0.3); }

.invite-hint {
  text-align: center;
  font-size: 13px;
  color: #8a7a6a;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px dashed rgba(180, 120, 60, 0.15);
  animation: pulse-hint 2s infinite;
  font-family: '华文楷体', 'KaiTi', serif;
}

@keyframes pulse-hint {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

/* ===== 无障碍状态 ===== */
.accessibility-status {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  background: rgba(106, 90, 74, 0.9);
  backdrop-filter: blur(8px);
  color: #f5efe0;
  padding: 8px 20px;
  border-radius: 30px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid rgba(180, 120, 60, 0.2);
  font-family: '华文楷体', 'KaiTi', serif;
  letter-spacing: 0.5px;
}

.accessibility-status .status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #27ae60;
  animation: pulse-dot 1.5s infinite;
}

@keyframes pulse-dot {
  0%, 100% { box-shadow: 0 0 0 0 rgba(39, 174, 96, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(39, 174, 96, 0); }
}

.status-close {
  background: rgba(255, 248, 235, 0.15);
  border: none;
  color: #f5efe0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.status-close:hover { background: rgba(255, 248, 235, 0.25); }

/* ===== Popup ===== */
:deep(.risk-popup-container .maplibregl-popup-content) {
  padding: 0 !important;
  border-radius: 12px !important;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(50, 40, 30, 0.15);
  border: 1px solid rgba(180, 120, 60, 0.08);
}

.risk-popup {
  padding: 16px 18px;
  max-width: 340px;
  background: linear-gradient(160deg, #f8f2e6, #f0e8d8);
}

.popup-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding-bottom: 8px;
  border-bottom: 2px solid rgba(180, 120, 60, 0.15);
  padding-left: 10px;
}
.popup-name { font-size: 16px; font-weight: 700; color: #3a2a1a; flex: 1; font-family: '华文楷体', 'KaiTi', serif; }
.popup-badge { font-size: 11px; font-weight: 600; color: white; padding: 2px 10px; border-radius: 12px; white-space: nowrap; }
.popup-type { font-size: 13px; color: #6a5a4a; margin-top: 6px; padding-left: 10px; }
.popup-desc { font-size: 13px; color: #4a3a2a; line-height: 1.6; margin-top: 6px; padding: 8px 10px; background: rgba(255, 248, 235, 0.5); border-radius: 6px; }
.popup-row { font-size: 12px; color: #5a4a3a; padding: 2px 10px; line-height: 1.6; }
.popup-label { font-weight: 600; color: #3a2a1a; }
.popup-disclaimer { margin-top: 8px; padding-top: 8px; border-top: 1px dashed rgba(180, 120, 60, 0.15); font-size: 11px; color: #8a7a6a; text-align: center; font-style: italic; }

/* ===== 响应式 ===== */
@media (max-width: 768px) {
  .controls {
    flex-direction: column;
    align-items: center;
    padding: 10px 16px;
    bottom: 16px;
    max-width: 95%;
  }
  .controls-left { justify-content: center; }
  .controls-right { justify-content: center; }
  .control-btn { font-size: 11px; padding: 4px 12px; }
  .back-home-btn { top: 12px; left: 12px; padding: 6px 16px; font-size: 12px; }
  .layer-indicator { top: 70px; right: 10px; padding: 8px 12px; min-width: 120px; }
  .layer-tag { font-size: 10px; }
  .risk-legend, .damage-legend {
    bottom: 80px;
    right: 10px;
    padding: 12px 14px;
    min-width: 160px;
    max-width: 200px;
  }
  .legend-item { font-size: 10px; }
  .legend-color { width: 14px; height: 14px; }
  .legend-label { min-width: 50px; font-size: 10px; }
  .legend-desc { display: none; }
  .legend-disclaimer { font-size: 9px; }
  .risk-popup { padding: 12px 14px; }
  .popup-name { font-size: 14px; }
  .popup-desc { font-size: 12px; }
  .accessibility-status { top: 70px; font-size: 12px; padding: 6px 14px; }
  .status-tip { top: 120px; font-size: 12px; padding: 6px 16px; }
  .invite-panel { padding: 24px 20px 20px; }
  .invite-title { font-size: 18px; }
  .invite-feature { font-size: 13px; padding: 8px 12px; }
  .invite-btn { font-size: 13px; padding: 10px 16px; }
  .border-corner { width: 30px; height: 30px; }
  .tl, .tr { top: 12px; }
  .bl, .br { bottom: 12px; }
  .c1, .c2 { display: none; }
}

@media (max-width: 480px) {
  .invite-panel { padding: 20px 16px 16px; }
  .invite-feature { font-size: 12px; padding: 6px 10px; }
  .invite-btn { font-size: 12px; padding: 8px 12px; min-width: 80px; }
  .popup-content { border-radius: 14px; }
  .popup-scroll { padding: 0 14px 14px; }
  .popup-header h2 { font-size: 18px; }
  .popup-icon { font-size: 30px; }
}
</style>