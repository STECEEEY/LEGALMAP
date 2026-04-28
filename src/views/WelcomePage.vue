<template>
  <div class="welcome-container">
    <div class="welcome-card">
      <div class="icon-wrapper">
        <span class="main-icon">⚖️</span>
      </div>
      <h1>LEGALMAP</h1>
      <h2>生态环境法典地图</h2>
      <p>探索中国生态环境法律法规体系，点击地图上的区域了解相关法律</p>
      <button @click="goToMap" class="enter-btn">
        开始探索
        <span class="arrow">→</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goToMap = () => {
  router.push('/map')
}
</script>

<style scoped>
.welcome-container {
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb4d);
  background-size: 200% 200%;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: gradientShift 3s ease infinite;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.welcome-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 32px;
  padding: 3rem 4rem;
  text-align: center;
  max-width: 500px;
  margin: 1rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
}

.icon-wrapper {
  margin-bottom: 1rem;
}

.main-icon {
  font-size: 4rem;
  display: inline-block;
  animation: bounce 2s ease infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.welcome-card h1 {
  font-size: 2.5rem;
  color: #1a2a6c;
  margin-bottom: 0.5rem;
  letter-spacing: 2px;
}

.welcome-card h2 {
  font-size: 1.3rem;
  color: #b21f1f;
  margin-bottom: 1rem;
  font-weight: 500;
}

.welcome-card p {
  color: #666;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.enter-btn {
  background: linear-gradient(135deg, #1a2a6c, #b21f1f);
  color: white;
  border: none;
  padding: 12px 32px;
  font-size: 1.1rem;
  border-radius: 50px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.enter-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.arrow {
  transition: transform 0.2s;
}

.enter-btn:hover .arrow {
  transform: translateX(5px);
}
</style>
