<template>
  <div class="container">
    <header>
      <h1>⚖️ LEGALMAP</h1>
      <p class="subtitle">法律知识导航地图</p>
    </header>

    <main>
      <div class="card">
        <h2>欢迎使用 LEGALMAP</h2>
        <p>这是一个使用 Vue 3 + Vite 构建的法律信息平台。</p>
        
        <div class="feature-grid">
          <div class="feature">
            <span class="icon">📚</span>
            <h3>法律法规</h3>
            <p>最新法律法规查询</p>
          </div>
          <div class="feature">
            <span class="icon">⚡</span>
            <h3>典型案例</h3>
            <p>精选司法案例解析</p>
          </div>
          <div class="feature">
            <span class="icon">🤝</span>
            <h3>法律咨询</h3>
            <p>专业律师在线解答</p>
          </div>
        </div>

        <button @click="count++" class="btn">
          点击次数: {{ count }}
        </button>
      </div>
    </main>

    <footer>
      <p>© 2025 LEGALMAP | 让法律触手可及</p>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const count = ref(0)
</script>

<style scoped>
.container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

header {
  text-align: center;
  padding: 3rem 1rem;
  background: linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb4d);
  background-size: 200% 200%;
  color: white;
}

h1 {
  font-size: 3rem;
  margin: 0;
  letter-spacing: 2px;
}

.subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin-top: 0.5rem;
}

main {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 10px 40px rgba(0,0,0,0.1);
  text-align: center;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.feature {
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 12px;
  transition: transform 0.2s;
}

.feature:hover {
  transform: translateY(-5px);
}

.feature .icon {
  font-size: 2.5rem;
}

.btn {
  background: #1a2a6c;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btn:hover {
  background: #b21f1f;
}

footer {
  text-align: center;
  padding: 1.5rem;
  background: #1a1a2e;
  color: #888;
  font-size: 0.9rem;
}
</style>
