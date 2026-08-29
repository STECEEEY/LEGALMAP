<!-- src/components/Assistant.vue -->
<template>
    <div class="assistant-wrapper">
      <!-- 圆形头像 -->
      <div class="assistant-avatar" @click="toggleDialog">
        <img src="/images/character.jpg" alt="小助手" />
        <div class="assistant-status" :class="{ 'status-active': dialogVisible }"></div>
      </div>
  
      <!-- 对话框 -->
      <div class="assistant-dialog" v-show="dialogVisible" @click.stop>
        <div class="dialog-bubble">
          <!-- 背景图 -->
          <img src="/images/对话框.png" class="dialog-bg" alt="对话框" />
  
          <!-- 内容区域 - 固定在下半部分 -->
          <div class="dialog-content">
            <!-- 上半部分留空，只放一个拖拽提示 -->
            <div class="dialog-top-placeholder">
              <span class="drag-hint">⠿ 拖动调整内容位置</span>
            </div>
  
            <!-- 下半部分：实际内容 -->
            <div class="dialog-bottom">
              <div class="dialog-header">
                <span class="dialog-name">🌿 法典小助手</span>
                <button class="dialog-close" @click="closeDialog">✕</button>
              </div>
              <div class="dialog-messages" ref="messagesContainer">
                <div
                  v-for="(msg, index) in messages"
                  :key="index"
                  class="dialog-message"
                  :class="{ 'message-user': msg.role === 'user' }"
                >
                  <span v-if="msg.role === 'assistant'" class="msg-avatar">🌱</span>
                  <span class="msg-text">{{ msg.content }}</span>
                </div>
                <div v-if="isTyping" class="dialog-message typing-indicator">
                  <span>🌱</span>
                  <span class="typing-dots">
                    <span>.</span><span>.</span><span>.</span>
                  </span>
                </div>
              </div>
  
              <div class="dialog-input-area">
                <input
                  v-model="inputText"
                  @keydown.enter="sendMessage"
                  placeholder="输入问题，小助手为你解答..."
                  :disabled="isTyping"
                />
                <button @click="sendMessage" :disabled="isTyping || !inputText.trim()">
                  发送
                </button>
              </div>
  
              <div class="dialog-suggestions">
                <button
                  v-for="(suggestion, idx) in suggestions"
                  :key="idx"
                  @click="askSuggestion(suggestion)"
                  class="suggestion-btn"
                >
                  {{ suggestion }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, watch, nextTick, onMounted } from 'vue'
  
  const dialogVisible = ref(false)
  const inputText = ref('')
  const isTyping = ref(false)
  const messagesContainer = ref(null)
  
  
  
  // ============================================================
  // 消息数据
  // ============================================================
  
  const messages = ref([
    {
      role: 'assistant',
      content: '你好！我是法典小助手 🌱\n点击地图上的绿色区域，可以查看生态红线和环境风险信息。有什么关于生态环境法典的问题，尽管问我吧！'
    }
  ])
  
  const suggestions = ref([
    '什么是生态红线？',
    '秦岭案是怎么回事？',
    '法典对我有什么影响？',
    '垃圾分类怎么分？'
  ])
  
  const knowledgeBase = {
    '生态红线': {
      answer: '生态红线是《生态环境法典》确立的重要制度，是指依法在重点生态功能区、生态环境敏感区和脆弱区等区域划定的严格管控边界。生态红线区内禁止开发建设活动，是保障国家生态安全的底线和生命线。\n\n📖 依据：法典第287条、第290条'
    },
    '秦岭案': {
      answer: '2026年7月，西安铁路运输中级法院审理了陕西省首例个人非法组织穿越秦岭核心保护区民事公益诉讼案。\n\n📌 案情：某户外组织在2024年1月至2025年6月期间，25次组织148人次进入秦岭核心保护区，收费30,894元。\n\n⚖️ 判决：判令停止组织穿越、赔偿生态修复费用1万元、公开赔礼道歉。\n\n💡 意义：标志着法律对生态破坏行为的追责从行政监管延伸到了民事公益诉讼领域。'
    },
    '对我有什么影响': {
      answer: '生态环境法典与每个人的日常生活息息相关：\n\n🗑️ 垃圾分类：单位和个人负有分类投放义务（法典第499条、第506条）\n\n🌳 自然保护：禁止非法进入自然保护区核心区（法典第287条、第1152条）\n\n💧 水环境保护：禁止向水体排放污染物（法典第221条、第1176条）\n\n⚖️ 法律责任：破坏生态环境将承担民事赔偿甚至刑事责任'
    },
    '垃圾分类': {
      answer: '《生态环境法典》第499条规定，国家推行生活垃圾分类制度。\n\n📌 第506条明确：单位和个人负有生活垃圾分类投放义务，禁止随意倾倒、抛撒、堆放或者焚烧生活垃圾。\n\n💰 处罚标准（法典第1169条第3款）：个人随意倾倒生活垃圾，拒不改正的，处一百元以上一千元以下罚款。'
    }
  }
  
  // ============================================================
  // 方法
  // ============================================================
  
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
  
  watch(messages, () => {
    scrollToBottom()
  }, { deep: true })
  
  onMounted(() => {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && dialogVisible.value) {
        closeDialog()
      }
    })
  })
  </script>
  
  <style scoped>
  /* ============================================================
     ===== 小助手样式 =====
     ============================================================ */
  
  .assistant-wrapper {
    position: fixed;
    bottom: 30px;
    right: 100px;
    z-index: 9998;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 12px;
  }
  
  /* ===== 圆形头像 ===== */
  .assistant-avatar {
    width: 80px;
    height: 80px;
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
  
  /* ===== 对话框 ===== */
  .assistant-dialog {
    position: absolute;
    bottom: 95px;
    right: 0;
    width: 400px;
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
  
  /* ===== 内容容器 ===== */
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
  
  /* ===== 上半部分：留空，只放提示 ===== */
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
    font-family: '华文楷体', 'KaiTi', serif;
    letter-spacing: 1px;
    user-select: none;
  }
  
  /* ===== 下半部分：实际内容（固定高度） ===== */
  .dialog-bottom {
    flex-shrink: 0;
    height: 200px; /* 固定高度，只占下半部分 */
    width:350px;
    display: flex;
    flex-direction: column;
    padding: 0 4px;
    transform: translate(
      var(--content-offset-x, 0px),
      var(--content-offset-y, 0px)
    );
  }
  
  /* ===== 位置调节控制条 ===== */
  .position-control {
    display: flex;
    align-items: center;
    gap: 3px;
    flex-shrink: 0;
    justify-content: flex-end;
    opacity: 0.25;
    transition: opacity 0.3s;
    margin-bottom: 2px;
  }
  
  .dialog-bottom:hover .position-control {
    opacity: 1;
  }
  
  .pos-btn {
    width: 22px;
    height: 22px;
    border: 1px solid rgba(200, 180, 150, 0.2);
    border-radius: 4px;
    background: rgba(255, 248, 235, 0.6);
    color: #6a5a4a;
    font-size: 11px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: inherit;
    user-select: none;
  }
  
  .pos-btn:hover {
    background: rgba(200, 180, 150, 0.2);
    border-color: rgba(200, 180, 150, 0.4);
  }
  
  .pos-btn.reset {
    font-size: 13px;
    font-weight: 700;
  }
  
  /* ===== 对话框头部 ===== */
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
    font-family: '华文楷体', 'KaiTi', serif;
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
  
  /* ===== 消息列表 ===== */
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
    background: rgba(26, 42, 108, 0.06);
    border-color: rgba(26, 42, 108, 0.08);
  }
  
  /* ===== 打字指示器 ===== */
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
  
  /* ===== 输入区 ===== */
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
    border-color: rgba(139, 115, 85, 0.4);
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
    background: #8a7a5a;
    color: white;
    border-radius: 14px;
    font-size: 11px;
    cursor: pointer;
    transition: all 0.2s;
    font-family: '华文楷体', 'KaiTi', serif;
    letter-spacing: 0.5px;
    flex-shrink: 0;
  }
  .dialog-input-area button:hover:not(:disabled) {
    background: #6a5a4a;
    transform: scale(1.02);
  }
  .dialog-input-area button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  
  /* ===== 快捷建议 ===== */
  .dialog-suggestions {
    display: flex;
    flex-wrap: wrap;
    gap: 3px;
    padding-top: 3px;
    flex-shrink: 0;
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
    background: rgba(200, 180, 150, 0.15);
    border-color: rgba(200, 180, 150, 0.3);
    transform: translateY(-1px);
  }
  
  /* ============================================================
     ===== 响应式 =====
     ============================================================ */
  
  @media (max-width: 768px) {
    .assistant-wrapper {
      bottom: 20px;
      right: 75px;
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
    .dialog-bottom {
      height: 220px;
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
    .pos-btn {
      width: 18px;
      height: 18px;
      font-size: 9px;
    }
  }
  
  @media (max-width: 480px) {
    .assistant-wrapper {
      bottom: 16px;
      right: 60px;
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
    .pos-btn {
      width: 16px;
      height: 16px;
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
  }
  </style>