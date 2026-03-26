import { createRouter, createWebHistory } from 'vue-router'
import Market from '../views/Market.vue'
import Chart from '../views/Chart.vue'
import NewsDetail from '../views/NewsDetail.vue'
import NewsList from '../views/NewsList.vue'
import Kline from '../views/Kline.vue'
import Tools from '../views/Tools.vue'
import Topics from '../views/Topics.vue'
import Flash from '../views/Flash.vue'
import Exchange from '../views/Exchange.vue'
import ExchangeDetail from '../views/ExchangeDetail.vue'

const routes = [
  { path: '/', name: 'Market', component: Market },
  { path: '/chart/:symbol', name: 'Chart', component: Chart },
  { path: '/news', name: 'NewsList', component: NewsList },
  { path: '/news/:id', name: 'NewsDetail', component: NewsDetail },
  { path: '/kline', name: 'Kline', component: Kline },
  { path: '/tools', name: 'Tools', component: Tools },
  { path: '/topics', name: 'Topics', component: Topics },
  { path: '/flash', name: 'Flash', component: Flash },
  { 
    path: '/exchange', 
    name: 'Exchange', 
    component: Exchange,
    meta: { keepAlive: true }
  },
  { 
    path: '/exchange/:id', 
    name: 'ExchangeDetail', 
    component: ExchangeDetail,
    meta: { keepAlive: false }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
