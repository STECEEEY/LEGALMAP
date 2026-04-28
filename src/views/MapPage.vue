<template>
  <div class="map-page">
    <div id="map" ref="mapContainer" class="map"></div>
    
    <!-- 右下角小人按钮 -->
    <button @click="showLawDialog = true" class="character-btn">
      <span class="character">🧑‍⚖️</span>
      <span class="tooltip">法律科普</span>
    </button>

    <!-- 法律科普弹窗 -->
    <div v-if="showLawDialog" class="dialog-overlay" @click="showLawDialog = false">
      <div class="dialog-content" @click.stop>
        <div class="dialog-header">
          <span class="icon">📚</span>
          <h3>生态环境法典 · 科普</h3>
          <button class="close-btn" @click="showLawDialog = false">✕</button>
        </div>
        <div class="dialog-body">
          <div class="law-card">
            <h4>🌿 中华人民共和国环境保护法</h4>
            <p>为保护和改善环境，防治污染和其他公害，保障公众健康，推进生态文明建设，促进经济社会可持续发展而制定的法律。</p>
          </div>
          <div class="law-card">
            <h4>💧 中华人民共和国水污染防治法</h4>
            <p>保护水资源，防治水污染，保障饮用水安全，维护公众健康，推进生态文明建设。</p>
          </div>
          <div class="law-card">
            <h4>🌬️ 中华人民共和国大气污染防治法</h4>
            <p>保护和改善环境，防治大气污染，保障公众健康，推进生态文明建设。</p>
          </div>
          <div class="law-card">
            <h4>🗑️ 中华人民共和国固体废物污染环境防治法</h4>
            <p>防治固体废物污染环境，保障公众健康，维护生态安全，推进生态文明建设。</p>
          </div>
          <div class="law-card">
            <h4>🌱 中华人民共和国土壤污染防治法</h4>
            <p>保护和改善生态环境，防治土壤污染，保障公众健康，推动土壤资源永续利用。</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as maptilersdk from '@maptiler/sdk'
import '@maptiler/sdk/dist/maptiler-sdk.css'

// 状态
const showLawDialog = ref(false)
const mapContainer = ref(null)
let map = null

// Maptiler 配置
const MAP_ID = '019cf982-4976-7dd7-9ac1-c31257405804'
const API_KEY = 'cUeIpGNy8YxAK7lLuEB6'

// 初始化地图
const initMap = () => {
  if (!mapContainer.value) return
  
  maptilersdk.config.apiKey = API_KEY
  
  map = new maptilersdk.Map({
    container: mapContainer.value,
    style: `https://api.maptiler.com/maps/${MAP_ID}/style.json?key=${API_KEY}`,
    center: [0, 0],
    zoom: 1,
    pitch: 0,
    bearing: 0
  })
  
  map.addControl(new maptilersdk.NavigationControl(), 'top-right')
}

onMounted(() => {
  initMap()
})

onUnmounted(() => {
  if (map) {
    map.remove()
  }
})
</script>

<style scoped>
.map-page {
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
}

.map {
  width: 100%;
  height: 100%;
}

/* 右下角小人按钮 */
.character-btn {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1a2a6c, #b21f1f);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s, box-shadow 0.2s;
  z-index: 100;
}

.character-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
}

.character {
  font-size: 2rem;
}

.tooltip {
  position: absolute;
  bottom: 80px;
  right: 0;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.2s;
  pointer-events: none;
}

.character-btn:hover .tooltip {
  opacity: 1;
}

/* 弹窗样式 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.dialog-content {
  background: white;
  border-radius: 24px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dialog-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 1.25rem 1.5rem;
  background: linear-gradient(135deg, #1a2a6c, #b21f1f);
  color: white;
}

.dialog-header .icon {
  font-size: 1.8rem;
}

.dialog-header h3 {
  flex: 1;
  margin: 0;
  font-size: 1.2rem;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.dialog-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem 1.5rem;
  max-height: 60vh;
}

.law-card {
  background: #f8f9fa;
  border-radius: 16px;
  padding: 1rem;
  margin-bottom: 1rem;
  border-left: 4px solid #b21f1f;
}

.law-card h4 {
  margin: 0 0 0.5rem 0;
  color: #1a2a6c;
  font-size: 1rem;
}

.law-card p {
  margin: 0;
  color: #555;
  font-size: 0.85rem;
  line-height: 1.5;
}
</style>
