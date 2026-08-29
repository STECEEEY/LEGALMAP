import { createRouter, createWebHistory } from 'vue-router'
import WelcomePage from '../views/WelcomePage.vue'
import MapPage from '../views/MapPage.vue'

const routes = [
  {
    path: '/',
    name: 'Welcome',
    component: WelcomePage
  },
  {
    path: '/map',
    name: 'Map',
    component: MapPage
  },
  {
    path: '/ecology-code',
    name: 'EcologyCode',
    // 懒加载科普页面
    component: () => import('../views/EcologyCodePage.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
