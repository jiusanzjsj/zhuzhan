import { createRouter, createWebHistory } from 'vue-router'
import Market from '../views/Market.vue'
import Chart from '../views/Chart.vue'
import NewsDetail from '../views/NewsDetail.vue'

const routes = [
  { path: '/', name: 'Market', component: Market },
  { path: '/chart/:symbol', name: 'Chart', component: Chart },
  { path: '/news/:id', name: 'NewsDetail', component: NewsDetail }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
