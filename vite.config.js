import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    open: true
  },
  // 添加对 GeoJSON 文件的处理
  assetsInclude: ['**/*.geojson'],
  // 确保构建时正确处理
  build: {
    rollupOptions: {
      // 让 rollup 能处理 geojson 文件
    }
  },
  // ===== 🔥 新增：路径别名 =====
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})