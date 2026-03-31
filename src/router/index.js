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
  { 
    path: '/news', 
    name: 'NewsList', 
    component: NewsList,
    meta: { keepAlive: true }
  },
  { 
    path: '/news/:id', 
    name: 'NewsDetail', 
    component: NewsDetail,
    meta: { keepAlive: false }
  },
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

// SEO 导航守卫
const SEO_CONFIG = {
  '/': { title: '比特视界 - 加密货币实时行情', desc: '专业加密货币行情数据平台，提供比特币、以太坊、Solana等主流币种实时价格、24小时涨跌统计、K线走势图', keys: '比特币,以太坊,加密货币,行情,实时价格,BTC,ETH,K线', img: 'https://openupbtc.com/logo.png' },
  '/news': { title: '快讯 - 比特视界', desc: '最新加密货币快讯、链上动态、重要资讯实时更新', keys: '加密货币,快讯,链上,新闻,资讯', img: 'https://openupbtc.com/logo.png' },
  '/exchange': { title: '交易所 - 比特视界', desc: '全球加密货币交易所排名、交易量、详细信息对比', keys: '交易所,币安,OKX,火币,CoinGecko', img: 'https://openupbtc.com/logo.png' },
  '/kline': { title: 'K线行情 - 比特视界', desc: '专业K线图表，支持多种时间周期和技术指标分析', keys: 'K线,技术分析,图表,TradingView', img: 'https://openupbtc.com/logo.png' },
  '/tools': { title: '工具 - 比特视界', desc: '区块浏览器、汇率转换、Gas费查询等加密货币常用工具', keys: '工具,区块浏览器,汇率转换,Gas', img: 'https://openupbtc.com/logo.png' },
  '/topics': { title: '热门专题 - 比特视界', desc: '比特币入门、以太坊生态、DeFi教程等热门专题', keys: '专题,教程,DeFi,NFT,入门', img: 'https://openupbtc.com/logo.png' },
  '/flash': { title: '快讯 - 比特视界', desc: '最新加密货币快讯、链上动态、重要资讯实时更新', keys: '加密货币,快讯,链上,新闻', img: 'https://openupbtc.com/logo.png' },
}

const updateMeta = (toPath) => {
  const base = 'https://openupbtc.com'
  const config = SEO_CONFIG[toPath] || SEO_CONFIG['/']

  document.title = config.title

  // 更新或创建 meta 标签
  const updateMetaTag = (name, content, property = false) => {
    const attr = property ? 'property' : 'name'
    let el = document.querySelector(`meta[${attr}="${name}"]`)
    if (!el) {
      el = document.createElement('meta')
      el.setAttribute(attr, name)
      document.head.appendChild(el)
    }
    el.setAttribute('content', content)
  }

  updateMetaTag('description', config.desc)
  updateMetaTag('keywords', config.keys)
  updateMetaTag('og:title', config.title, true)
  updateMetaTag('og:description', config.desc, true)
  updateMetaTag('og:image', config.img || SEO_CONFIG['/'].img, true)
  updateMetaTag('og:url', `${base}${toPath}`, true)
  updateMetaTag('og:type', 'website', true)
  updateMetaTag('og:site_name', '比特视界', true)
  updateMetaTag('twitter:card', 'summary')
  updateMetaTag('twitter:title', config.title)
  updateMetaTag('twitter:description', config.desc)
  updateMetaTag('twitter:image', config.img || SEO_CONFIG['/'].img)
}

router.afterEach((to) => {
  updateMeta(to.path)
})

// 初始化首页 SEO
updateMeta('/')

export default router
