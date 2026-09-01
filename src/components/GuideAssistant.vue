<template>
    <div class="guide-assistant">
      <!-- 圆形头像 -->
      <div class="assistant-avatar" @click="toggleDialog" :class="{ pulse: isGuideActive }">
        <img src="/images/character.jpg" alt="引导小助手" />
        <div class="assistant-status" :class="{ 'status-active': dialogVisible || isGuideActive }"></div>
        <div class="notification-dot" v-if="hasNextStep && !dialogVisible && isGuideActive"></div>
      </div>
  
      <!-- 引导对话框 -->
      <div class="assistant-dialog" v-show="dialogVisible" @click.stop>
        <div class="dialog-bubble">
          <img src="/images/对话框.png" class="dialog-bg" alt="对话框" />
  
          <div class="dialog-content">
  
            <div class="dialog-bottom">
              <div class="dialog-header">
                <span class="dialog-name">🌿 探索向导</span>
                <div class="dialog-header-actions">
                  <button v-if="isGuideActive" class="header-btn" @click="toggleAutoPlay" :title="isAutoPlaying ? '暂停自动演示' : '自动演示'">
                    {{ isAutoPlaying ? '⏸️' : '▶️' }}
                  </button>
                  <button class="dialog-close" @click="closeDialog">✕</button>
                </div>
              </div>
  
              <!-- 进度条 -->
              <div class="guide-progress" v-if="isGuideActive">
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
                </div>
                <span class="progress-text">{{ currentStepIndex + 1 }} / {{ guideSteps.length }}</span>
              </div>
  
              <div class="dialog-messages" ref="messagesContainer">
                <div v-if="currentStep" class="dialog-message">
                  <span class="msg-avatar">{{ currentStep.icon || '🌱' }}</span>
                  <div class="msg-text-wrapper">
                    <span class="msg-text">{{ currentStep.message }}</span>
                    <span v-if="currentStep.hint" class="msg-hint">{{ currentStep.hint }}</span>
                    <span v-if="isGuideActive && !isLastStep && (isListening || accessibilityMode)" class="voice-hint">
                      🎤 说"下一页" 或 眨眼3次继续
                    </span>
                    <span v-else-if="isGuideActive && !isLastStep" class="voice-hint">
                      👆 点击"下一步"继续
                    </span>
                  </div>
                </div>
              </div>
  
              <!-- 操作按钮 -->
              <div class="dialog-actions">
                <button v-if="!isGuideActive" class="action-btn primary" @click="startGuide">
                  🚀 开始探索
                </button>
                <template v-else>
                  <button class="action-btn secondary" @click="prevStep" :disabled="currentStepIndex === 0">
                    ← 上一步
                  </button>
                  <button class="action-btn primary" @click="nextStep" :disabled="isLastStep">
                    {{ isLastStep ? '🎉 完成' : '下一步 →' }}
                  </button>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
  import { useRouter } from 'vue-router'
  
  const props = defineProps({
    steps: {
      type: Array,
      default: () => []
    },
    currentLayerIndex: {
      type: Number,
      default: -1
    },
    allLoaded: {
      type: Boolean,
      default: false
    },
    accessibilityMode: {
      type: Boolean,
      default: false
    },
    viewType: {
      type: String,
      default: 'national'
    }
  })
  
  const emit = defineEmits([
    'load-layer',
    'switch-view',
    'step-change',
    'guide-complete'
  ])
  
  const router = useRouter()
  
  // ===== 状态 =====
  const dialogVisible = ref(true)
  const isGuideActive = ref(false)
  const isAutoPlaying = ref(false)
  const currentStepIndex = ref(0)
  const messagesContainer = ref(null)
  const spokenSteps = ref(new Set())
  let autoPlayTimer = null
  
  // ===== 语音识别状态 =====
  const isListening = ref(false)
  const recognition = ref(null)
  const voiceCommand = ref('')
  
  // ===== 计算属性 =====
  const guideSteps = computed(() => props.steps)
  
  const currentStep = computed(() => {
    if (!isGuideActive.value || currentStepIndex.value >= guideSteps.value.length) {
      return null
    }
    return guideSteps.value[currentStepIndex.value]
  })
  
  const isLastStep = computed(() => {
    return currentStepIndex.value >= guideSteps.value.length - 1
  })
  
  const hasNextStep = computed(() => {
    return isGuideActive.value && !isLastStep.value
  })
  
  const progressPercent = computed(() => {
    if (guideSteps.value.length === 0) return 0
    return ((currentStepIndex.value + 1) / guideSteps.value.length) * 100
  })
  
  // ============================================================
  // 语音识别
  // ============================================================
  
  function checkSpeechSupport() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      console.warn('⚠️ 当前浏览器不支持语音识别')
      return false
    }
    return true
  }
  
  function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      console.warn('⚠️ 浏览器不支持语音识别')
      return false
    }
  
    recognition.value = new SpeechRecognition()
    recognition.value.lang = 'zh-CN'
    recognition.value.continuous = true
    recognition.value.interimResults = true
    recognition.value.maxAlternatives = 1
  
    recognition.value.onstart = () => {
      console.log('🎤 语音识别已启动，请说"下一页"')
      isListening.value = true
    }
  
    recognition.value.onend = () => {
      console.log('🎤 语音识别已停止')
      isListening.value = false
      // 如果引导还在进行中，自动重启语音识别
      if (isGuideActive.value) {
        setTimeout(() => {
          if (!isListening.value && isGuideActive.value) {
            try {
              recognition.value.start()
            } catch (e) {
              console.warn('⚠️ 重启语音识别失败:', e)
            }
          }
        }, 500)
      }
    }
  
    recognition.value.onerror = (event) => {
      console.warn('⚠️ 语音识别错误:', event.error)
  
      // aborted 错误是正常中断，不需要处理
      if (event.error === 'aborted') {
        console.log('ℹ️ 语音识别被正常中断')
        return
      }
  
      isListening.value = false
  
      // if (event.error === 'not-allowed') {
      //   speak('请允许使用麦克风权限')
      // }
  
      // 如果是网络问题，自动重试
      if (event.error === 'network' && isGuideActive.value) {
        setTimeout(() => {
          if (isGuideActive.value) {
            try {
              recognition.value.start()
            } catch (e) {}
          }
        }, 2000)
      }
    }
  
    recognition.value.onresult = (event) => {
      let finalTranscript = ''
      let interimTranscript = ''
  
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }
  
      const fullText = finalTranscript || interimTranscript
      console.log('🗣️ 识别到:', fullText)
  
      if (fullText) {
        handleVoiceCommand(fullText)
      }
    }
  
    return true
  }
  
  function startListening() {
    if (!recognition.value) {
      initSpeechRecognition()
    }
  
    if (recognition.value) {
      // 如果已经在监听，不重复启动
      if (isListening.value) {
        console.log('🎤 语音识别已在运行')
        return
      }
  
      try {
        recognition.value.start()
        console.log('🎤 语音识别已开启')
        // 给用户反馈
        setTimeout(() => {
          // speak('请说"下一页"继续探索')
        }, 500)
      } catch (e) {
        console.warn('⚠️ 语音识别启动失败:', e)
        // 如果已经在运行，忽略错误
        if (e.message && (e.message.includes('already started') || e.message.includes('aborted'))) {
          isListening.value = true
        }
      }
    }
  }
  
  function stopListening() {
    if (recognition.value && isListening.value) {
      try {
        recognition.value.stop()
        isListening.value = false
        console.log('🎤 语音识别已关闭')
      } catch (e) {
        console.warn('⚠️ 停止语音识别失败:', e)
      }
    }
  }
  
  // function speak(text, callback) {
  //   // 如果浏览器不支持语音合成，直接回调
  //   if (!window.speechSynthesis) {
  //     if (callback) callback()
  //     return
  //   }
  
    // 取消之前的语音
    window.speechSynthesis.cancel()
  
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'zh-CN'
    utterance.rate = 0.9
    utterance.pitch = 1
    utterance.onend = () => {
      if (callback) callback()
    }
    window.speechSynthesis.speak(utterance)
  
  
  function handleVoiceCommand(text) {
    console.log('🔍 处理语音指令:', text)
  
    // 下一页相关关键词
    const nextKeywords = [
      '下一页', '下一步', '继续', '下一个', '下一条',
      '下一', '下页', '往后', '前进', 'go', 'next'
    ]
  
    // 检查是否包含任一关键词
    const matched = nextKeywords.some(keyword => text.includes(keyword))
  
    // 额外检查：如果文本包含"页"或"步"或"续"，也可能是指令
    const partialMatch = text.includes('页') || text.includes('步') || text.includes('续')
  
    if ((matched || partialMatch) && isGuideActive.value) {
      console.log('✅ 检测到"下一页"指令')
  
      if (!isLastStep.value) {
        // 如果自动播放中，暂停自动播放
        if (isAutoPlaying.value) {
          isAutoPlaying.value = false
          if (autoPlayTimer) {
            clearTimeout(autoPlayTimer)
            autoPlayTimer = null
          }
        }
        // 播放确认音效
        // speak('好的')
        // 延迟一点执行下一步，让用户听到反馈
        setTimeout(() => {
          nextStep()
        }, 300)
      } else if (isLastStep.value) {
        completeGuide()
      }
    }
  }
  
  // ============================================================
  // 引导方法（使用 function 声明，会被提升）
  // ============================================================
  
  function nextStep() {
    if (isLastStep.value) {
      completeGuide()
      return
    }
    currentStepIndex.value++
    scrollToBottom()
    executeCurrentStep()
  }
  
  function prevStep() {
    if (currentStepIndex.value > 0) {
      currentStepIndex.value--
      scrollToBottom()
    }
  }
  
  function executeCurrentStep() {
    if (!currentStep.value) return
  
    const step = currentStep.value
    const stepIndex = currentStepIndex.value
  
    emit('step-change', stepIndex, step)
  
    // 执行步骤动作
    if (step.action) {
      step.action()
    }
  
    // 如果需要加载图层
    if (step.layerIndex !== undefined && step.layerIndex !== null) {
      emit('load-layer', step.layerIndex)
    }
  
    // 如果需要切换视图
    if (step.switchView) {
      emit('switch-view', step.switchView)
    }
  
    // 语音播报 - 只播报一次
    // if (props.accessibilityMode && !spokenSteps.value.has(stepIndex)) {
    //   const msg = step.message.replace(/[📌🟢🏛️🔥🚩🌿⚖️🎉🗺️🚀]/g, '').trim()
    //   if (msg) {
    //     speak(msg)
    //     spokenSteps.value.add(stepIndex)
    //   }
    }
  
    // 自动播放
    // if (isAutoPlaying.value && !isLastStep.value) {
    //   if (autoPlayTimer) clearTimeout(autoPlayTimer)
    //   autoPlayTimer = setTimeout(() => {
    //     nextStep()
    //   }, step.duration || 8000)
    // }
  
  
  function completeGuide() {
    isGuideActive.value = false
    isAutoPlaying.value = false
    if (autoPlayTimer) {
      clearTimeout(autoPlayTimer)
      autoPlayTimer = null
    }
    stopListening()
    spokenSteps.value.clear()
    emit('guide-complete')
  }
  
  function resetGuide() {
    isGuideActive.value = false
    isAutoPlaying.value = false
    currentStepIndex.value = 0
    if (autoPlayTimer) {
      clearTimeout(autoPlayTimer)
      autoPlayTimer = null
    }
    stopListening()
    spokenSteps.value.clear()
  }
  
  function goToStep(index) {
    if (index >= 0 && index < guideSteps.value.length) {
      currentStepIndex.value = index
      scrollToBottom()
      executeCurrentStep()
    }
  }
  
  function toggleAutoPlay() {
    isAutoPlaying.value = !isAutoPlaying.value
    if (isAutoPlaying.value) {
      if (isLastStep.value) {
        currentStepIndex.value = 0
        executeCurrentStep()
      } else {
        if (typeof nextStep === 'function') {
          nextStep()
        } else {
          console.warn('⚠️ nextStep 未定义')
        }
      }
    } else {
      if (autoPlayTimer) {
        clearTimeout(autoPlayTimer)
        autoPlayTimer = null
      }
    }
  }
  
  // ============================================================
  // UI 方法
  // ============================================================
  
  function toggleDialog() {
    dialogVisible.value = !dialogVisible.value
  }
  
  function closeDialog() {
    dialogVisible.value = false
  }
  
  function scrollToBottom() {
    nextTick(() => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    })
  }
  
  async function startGuide() {
    // 检查浏览器是否支持语音识别
    if (!checkSpeechSupport()) {
      // 不支持语音，直接开始引导，告诉用户手动操作
      isGuideActive.value = true
      currentStepIndex.value = 0
      dialogVisible.value = true
      scrollToBottom()
      executeCurrentStep()
      return
    }
  
    // 请求麦克风权限
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach(track => track.stop())
      console.log('🎤 麦克风权限已获取')
  
      initSpeechRecognition()
      startListening()
    } catch (error) {
      console.warn('⚠️ 麦克风权限被拒绝:', error)
      // speak('请允许使用麦克风，或点击"下一步"按钮手动操作')
    }
  
    isGuideActive.value = true
    currentStepIndex.value = 0
    dialogVisible.value = true
    scrollToBottom()
    executeCurrentStep()
  }
  
  function testVoice() {
    console.log('🎤 测试语音识别状态:', {
      isListening: isListening.value,
      hasRecognition: !!recognition.value
    })
  
    if (recognition.value && isListening.value) {
      // speak('请说"下一页"')
    } else {
      // 尝试重新启动
      startListening()
    }
  }
  
  // ============================================================
  // 眨眼检测触发
  // ============================================================
  
  function triggerBlinkDetected() {
    // 只有引导激活时才处理
    if (!isGuideActive.value) return
  
    const now = Date.now()
    // 使用静态变量记录眨眼次数
    if (!triggerBlinkDetected._lastTime) {
      triggerBlinkDetected._lastTime = 0
      triggerBlinkDetected._count = 0
    }
  
    if (now - triggerBlinkDetected._lastTime < 2000) {
      triggerBlinkDetected._count++
      if (triggerBlinkDetected._count >= 3) {
        // 3次眨眼！触发下一步
        triggerBlinkDetected._count = 0
        if (!isLastStep.value) {
          if (isAutoPlaying.value) {
            isAutoPlaying.value = false
            if (autoPlayTimer) {
              clearTimeout(autoPlayTimer)
              autoPlayTimer = null
            }
          }
          // speak('好的')
          setTimeout(() => {
            nextStep()
          }, 300)
        } else {
          completeGuide()
        }
      }
    } else {
      triggerBlinkDetected._count = 1
    }
    triggerBlinkDetected._lastTime = now
  }
  
  // ============================================================
  // 暴露方法
  // ============================================================
  
  defineExpose({
    startGuide,
    resetGuide,
    goToStep,
    toggleDialog,
    dialogVisible,
    triggerBlinkDetected
  })
  
  // ============================================================
  // 生命周期
  // ============================================================
  
  onMounted(() => {
    // 默认展开对话框
    setTimeout(scrollToBottom, 300)
  })
  
  onUnmounted(() => {
    if (autoPlayTimer) {
      clearTimeout(autoPlayTimer)
      autoPlayTimer = null
    }
    stopListening()
    // 取消语音合成
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
  })
  
  // ============================================================
  // 监听
  // ============================================================
  
  watch(() => props.allLoaded, (loaded) => {
    if (loaded && isGuideActive.value && isAutoPlaying.value) {
      setTimeout(completeGuide, 1500)
    }
  })
  </script>
  
  <style scoped>
  .guide-assistant {
    position: fixed;
    bottom: 30px;
    left: 30px;
    z-index: 9998;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  /* ===== 头像 ===== */
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
  
  .assistant-avatar.pulse {
    animation: avatarPulse 2s ease-in-out infinite;
  }
  
  @keyframes avatarPulse {
    0%, 100% { box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15); }
    50% { box-shadow: 0 4px 40px rgba(82, 140, 126, 0.4); }
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
  
  .notification-dot {
    position: absolute;
    top: -2px;
    right: -2px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #E53935;
    border: 2px solid white;
    animation: pulse-dot 1s infinite;
  }
  
  @keyframes pulse-dot {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.2); }
  }
  
  /* ===== 对话框 ===== */
  .assistant-dialog {
    position: absolute;
    bottom: 60px;
    left: 0;
    width: 420px;
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
    top: 80px;
    left: 0;
    width: 90%;
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
    min-height: 50px;
  }
  
  .drag-hint {
    font-size: 10px;
    color: rgba(139, 115, 85, 0.3);
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    letter-spacing: 1px;
    user-select: none;
  }
  
  .dialog-bottom {
    flex-shrink: 0;
    height: 290px;
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 0 4px;
  }
  
  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 4px;
    border-bottom: 1px solid rgba(139, 115, 85, 0.08);
    flex-shrink: 0;
  }
  
  .dialog-name {
    font-size: 14px;
    font-weight: 700;
    color: #3a2a1a;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    letter-spacing: 0.5px;
  }
  
  .dialog-header-actions {
    display: flex;
    gap: 4px;
    align-items: center;
  }
  
  .header-btn {
    background: rgba(139, 115, 85, 0.15);
    border: none;
    color: #5a4a3a;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .header-btn:hover {
    background: rgba(139, 115, 85, 0.3);
  }
  
  .dialog-close {
    background: rgba(139, 115, 85, 0.15);
    border: none;
    color: #5a4a3a;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .dialog-close:hover {
    background: rgba(139, 115, 85, 0.3);
    transform: rotate(90deg);
  }
  
  /* ===== 进度条 ===== */
  .guide-progress {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 4px 0 6px;
    flex-shrink: 0;
  }
  
  .progress-bar {
    flex: 1;
    height: 3px;
    background: rgba(200, 180, 150, 0.2);
    border-radius: 4px;
    overflow: hidden;
  }
  
  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #528c7e, #bad66e);
    border-radius: 4px;
    transition: width 0.5s ease;
  }
  
  .progress-text {
    font-size: 11px;
    color: #8a7a6a;
    font-weight: 500;
    flex-shrink: 0;
  }
  
  /* ===== 消息区 ===== */
  .dialog-messages {
    flex: 1;
    overflow-y: auto;
    padding: 4px 2px 6px;
    margin: 0;
    min-height: 80px;
    max-height: 120px;
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
    gap: 6px;
    margin-bottom: 2px;
    font-size: 13px;
    line-height: 1.6;
    color: #3a2a1a;
    animation: msgIn 0.3s ease-out;
  }
  
  @keyframes msgIn {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .dialog-message .msg-avatar {
    font-size: 18px;
    flex-shrink: 0;
    margin-top: 1px;
  }
  
  .msg-text-wrapper {
    background: rgba(255, 248, 235, 0.5);
    padding: 6px 12px;
    border-radius: 8px;
    border: 1px solid rgba(200, 180, 150, 0.06);
    max-width: 90%;
  }
  
  .msg-text {
    display: block;
    font-size: 13px;
    line-height: 1.6;
    color: #3a2a1a;
  }
  
  .msg-hint {
    display: block;
    font-size: 11px;
    color: #8a7a6a;
    margin-top: 3px;
    font-style: italic;
  }
  
  .voice-hint {
    display: block;
    font-size: 11px;
    color: #528c7e;
    margin-top: 4px;
    font-weight: 500;
    animation: pulse-hint 2s ease-in-out infinite;
    background: rgba(82, 140, 126, 0.08);
    padding: 2px 10px;
    border-radius: 12px;
    text-align: center;
  }
  
  @keyframes pulse-hint {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }
  
  /* ===== 操作按钮 ===== */
  .dialog-actions {
    display: flex;
    gap: 8px;
    padding-top: 6px;
    border-top: 1px solid rgba(200, 180, 150, 0.08);
    flex-shrink: 0;
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .action-btn {
    padding: 5px 18px;
    border: none;
    border-radius: 16px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: inherit;
  }
  
  .action-btn.primary {
    background: #528c7e;
    color: white;
  }
  .action-btn.primary:hover:not(:disabled) {
    background: #3d6b60;
    transform: scale(1.02);
  }
  .action-btn.primary:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  
  .action-btn.secondary {
    background: rgba(139, 115, 85, 0.15);
    color: #5a4a3a;
  }
  .action-btn.secondary:hover:not(:disabled) {
    background: rgba(139, 115, 85, 0.25);
  }
  .action-btn.secondary:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
  
  .test-btn:hover {
    background: #ddd !important;
  }
  
  /* ===== 响应式 ===== */
  @media (max-width: 768px) {
    .guide-assistant {
      bottom: 20px;
      left: 20px;
    }
    .assistant-avatar {
      width: 60px;
      height: 60px;
    }
    .assistant-status {
      width: 15px;
      height: 15px;
    }
    .assistant-dialog {
      bottom: 72px;
      left: 0;
      width: 88vw;
    }
    .dialog-bottom {
      height: 260px;
    }
    .dialog-messages {
      min-height: 60px;
      max-height: 90px;
    }
    .dialog-message {
      font-size: 12px;
    }
    .msg-text {
      font-size: 12px;
    }
    .dialog-name {
      font-size: 13px;
    }
    .action-btn {
      font-size: 11px;
      padding: 4px 14px;
    }
  }
  
  @media (max-width: 480px) {
    .guide-assistant {
      bottom: 16px;
      left: 16px;
    }
    .assistant-avatar {
      width: 52px;
      height: 52px;
    }
    .assistant-status {
      width: 13px;
      height: 13px;
    }
    .assistant-dialog {
      bottom: 62px;
      left: 0;
      width: 92vw;
    }
    .dialog-bottom {
      height: 220px;
    }
    .dialog-messages {
      min-height: 50px;
      max-height: 70px;
    }
    .dialog-message {
      font-size: 11px;
    }
    .msg-text {
      font-size: 11px;
    }
    .msg-hint {
      font-size: 10px;
    }
    .voice-hint {
      font-size: 10px;
    }
    .action-btn {
      font-size: 10px;
      padding: 3px 10px;
    }
    .dialog-top-placeholder {
      min-height: 35px;
      padding-top: 6px;
    }
    .drag-hint {
      font-size: 8px;
    }
  }
  </style>
