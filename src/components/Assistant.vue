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
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  isAI: { type: Boolean, default: false }
})

const dialogVisible = ref(false)
const inputText = ref('')
const isTyping = ref(false)
const messagesContainer = ref(null)

// 🔴 刚才截图里的核心信息
const API_TOKEN = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjAyNmY4ZGViLTcxY2UtNDQwMS1iMzAyLTAxYmIyYWY1Y2VkNSJ9.eyJpc3MiOiJodHRwczovL2FwaS5jb3plLmNuIiwiYXVkIjpbIm54YldyY085bHFnckRvQWpwY3ZPajR0c0ZoZVFPcWFiIl0sImV4cCI6ODIxMDI2Njg3Njc5OSwiaWF0IjoxNzk0NzI4Nzk1LCJzdWIiOiJzcGlmZmU6Ly9hcGkuY296ZS5jbi93b3JrbG9hZF9pZGVudGl0eS9pZDo3NzA4MTA1NTczMzg3OTkzMTI2Iiwic3JjIjoiaW5ib3VuZF9hdXRoX2FjY2Vzc190b2tlbl9pZDo3NzA4MzAxNDgyNzUxMTY0NDQyIn0.G0e_2gObj6pXLq3nZyFbAiZQI5myTfPZjrKQD70PWjC4O6DirHwifCM6wuSgXv2hWb3cSWn7BZjjvM1gUJ47YONSiKA78b_dFzVLpIzDe42aYQ4xO74Pr0cR9Lv9-98iTz442AnhTzYcXF3K9I5RrttoD3fMzsfyINnYIlZgT9QNhjyIwm0Je7rNVTvxzOegiNwT_8sw93_e2TXCe6_teqnx5zPp8o2XCxl2oLMj-YsQv-NvQ-_Y0WCMAm79Aq07T3ofcWCvt4LZvnWL8-MUvIVqlSc_4-BPSLqcTSECF1ap5rsZtPDm9CRBmUtIqxSXWMQfA2B0p6xEMD5-x9nNQg' 
const API_URL = 'https://winter-tooth-2466.2122855316.workers.dev' // 从截图中获取的地址

const messages = ref([
  {
    role: 'assistant',
    content: '你好！我是法典小助手 🌱\n点击地图上的绿色区域，可以查看生态红线和环境风险信息。有什么关于生态环境法典的问题，尽管问我吧！'
  }
])

const suggestions = ref(['什么是生态红线？', '秦岭案是怎么回事？', '法典对我有什么影响？', '垃圾分类怎么分？'])

// 本地知识库 (保持不变)
const knowledgeBase = { /* ... 把你原来的直接复制过来 ... */ }

const toggleDialog = () => {
  dialogVisible.value = !dialogVisible.value
  if (dialogVisible.value) scrollToBottom()
}

const closeDialog = () => { dialogVisible.value = false }

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// 🔴 核心修改：用 fetch 发送流式请求
const sendMessage = async () => {
  const text = inputText.value.trim()
  if (!text || isTyping.value) return

  messages.value.push({ role: 'user', content: text })
  inputText.value = ''
  scrollToBottom()
  isTyping.value = true

  // 模式 A：调用 API
  if (props.isAI) {
    // 预先插入一个空的 assistant 消息，用来接收打字机效果
    messages.value.push({ role: 'assistant', content: '' })
    const currentMsgIndex = messages.value.length - 1

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify({
          content: {
            query: {
              prompt: [{ type: 'text', content: { text: text } }]
            }
          },
          type: 'query',
          session_id: 'session_' + Date.now(), 
          project_id: '7707986728497365043'
        })
      })

      if (!res.ok) {
        throw new Error('请求失败')
      }

      // 解析流式数据
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let replyContent = ''

            while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n').filter(line => line.trim() !== '')

        for (const line of lines) {
          if (line.startsWith('data:')) {
            const jsonStr = line.replace('data:', '').trim()
            if (jsonStr === '[DONE]') continue;

            try {
              const dataObj = JSON.parse(jsonStr)
              
              // 🔴 核心修改：深入解析扣子返回的流式数据
              let msgContent = '';
              // 有些版本返回的是 event.content
              if (typeof dataObj.content === 'string') {
                msgContent = dataObj.content;
              } 
              // 有些返回的是 event.message.content
              else if (dataObj.message && typeof dataObj.message.content === 'string') {
                msgContent = dataObj.message.content;
              }
              // 有些是数组格式 [{type: 'text', text: '...'}]
              else if (Array.isArray(dataObj.content)) {
                 msgContent = dataObj.content.map(c => c.text || '').join('');
              }

              // 如果找到了文字，就拼接到屏幕上
              if (msgContent && msgContent !== '[object Object]') {
                replyContent += msgContent
                messages.value[currentMsgIndex].content = replyContent
                scrollToBottom()
              }
            } catch (e) {
              console.warn('解析单行数据失败:', e)
            }
          }
        }
      }
    } catch (error) {
      console.error('AI 请求失败:', error)
      messages.value[currentMsgIndex].content = '网络开小差了，请稍后再试。'
    } finally {
      isTyping.value = false
    }
    return
  }

  // 模式 B：本地匹配 (保持不变)
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
  }, 500)
}

const askSuggestion = (suggestion) => {
  inputText.value = suggestion
  sendMessage()
}

watch(messages, () => { scrollToBottom() }, { deep: true })

onMounted(() => {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && dialogVisible.value) closeDialog()
  })
})
</script>

<style scoped>
/* 你的原有样式完全保留，不需要任何修改 */
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
  font-family: '华文楷体', 'KaiTi', serif;
  letter-spacing: 1px;
  user-select: none;
}
.dialog-bottom {
  flex-shrink: 0;
  height: 200px;
  width: 350px;
  display: flex;
  flex-direction: column;
  padding: 0 4px;
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
.dialog-messages {
  flex: 1;
  overflow-y: auto;
  padding: 2px 2px 2px;
  margin: 0;
  min-height: 90px;
  max-height: 130px;
}
.dialog-messages::-webkit-scrollbar { width: 3px; }
.dialog-messages::-webkit-scrollbar-track { background: rgba(200, 180, 150, 0.1); border-radius: 4px; }
.dialog-messages::-webkit-scrollbar-thumb { background: #c4a86a; border-radius: 4px; }
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
.dialog-message .msg-avatar { font-size: 13px; flex-shrink: 0; margin-top: 1px; }
.dialog-message .msg-text {
  background: rgba(255, 248, 235, 0.4);
  padding: 3px 10px;
  border-radius: 6px;
  white-space: pre-line;
  word-break: break-word;
  max-width: 90%;
  border: 1px solid rgba(200, 180, 150, 0.06);
}
.dialog-message.message-user { flex-direction: row-reverse; }
.dialog-message.message-user .msg-text {
  background: rgba(26, 42, 108, 0.06);
  border-color: rgba(26, 42, 108, 0.08);
}
.typing-indicator .typing-dots { display: inline-flex; gap: 2px; padding: 0 4px; }
.typing-indicator .typing-dots span { animation: dotJump 1.2s infinite; }
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
.dialog-input-area input:focus { border-color: rgba(139, 115, 85, 0.4); background: rgba(255, 248, 235, 0.6); }
.dialog-input-area input::placeholder { color: #8a7a6a; font-size: 10px; }
.dialog-input-area input:disabled { opacity: 0.5; }
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
.dialog-input-area button:hover:not(:disabled) { background: #6a5a4a; transform: scale(1.02); }
.dialog-input-area button:disabled { opacity: 0.4; cursor: not-allowed; }
.dialog-suggestions { display: flex; flex-wrap: wrap; gap: 3px; padding-top: 3px; flex-shrink: 0; }
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
.suggestion-btn:hover { background: rgba(200, 180, 150, 0.15); border-color: rgba(200, 180, 150, 0.3); transform: translateY(-1px); }

/* 响应式保留你原来的 */
@media (max-width: 768px) {
  .assistant-wrapper { bottom: 20px; right: 75px; }
  .assistant-avatar { width: 64px; height: 64px; }
  .assistant-status { width: 15px; height: 15px; }
  .assistant-dialog { bottom: 75px; width: 85vw; right: -10px; }
  .dialog-bottom { height: 220px; }
  .dialog-messages { min-height: 70px; max-height: 100px; }
  .dialog-message { font-size: 11px; }
  .dialog-name { font-size: 12px; }
  .dialog-top-placeholder { min-height: 40px; padding-top: 6px; }
  .drag-hint { font-size: 9px; }
}
@media (max-width: 480px) {
  .assistant-wrapper { bottom: 16px; right: 60px; }
  .assistant-avatar { width: 54px; height: 54px; }
  .assistant-status { width: 13px; height: 13px; }
  .assistant-dialog { bottom: 65px; width: 90vw; right: -6px; }
  .dialog-bottom { height: 190px; }
  .dialog-messages { min-height: 55px; max-height: 80px; padding: 1px; }
  .dialog-message { font-size: 10px; gap: 3px; }
  .dialog-message .msg-text { padding: 2px 6px; }
  .dialog-top-placeholder { min-height: 30px; padding-top: 4px; }
  .drag-hint { font-size: 8px; }
  .dialog-input-area input { font-size: 10px; padding: 2px 8px; }
  .dialog-input-area button { font-size: 10px; padding: 2px 8px; }
  .suggestion-btn { font-size: 8px; padding: 1px 6px; }
}
</style>
