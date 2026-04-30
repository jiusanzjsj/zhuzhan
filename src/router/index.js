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
import About from '../views/About.vue'

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
  },
  {
    path: '/about',
    name: 'About',
    component: About
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// ═══════════ 统一 SEO 配置矩阵 ═══════════
const BASE = 'https://openupbtc.com'
const SITE_NAME = '比特视界'
const DEFAULT_IMAGE = `${BASE}/logo.png`

/**
 * SEO 配置：
 * - title: 页面标题（包含长尾词）
 * - desc: 150-160 字符描述，含长尾高转化词
 * - keys: 逗号分隔关键词
 * - image: OG 分享图
 * - type: og:type (website/article)
 * - schema: 可选的结构化数据注入函数
 */
const SEO_CONFIG = {
  '/': {
    title: '比特视界 | 加密货币实时行情_BTC价格_ETH走势_合约交易_DePIN/RWA/Layer2赛道追踪',
    desc: '比特视界——2026年一站式加密货币行情仪表盘。实时追踪BTC、ETH、SOL、BNB价格与涨跌；集成恐慌贪婪指数、K线技术分析、全球交易所排名；深度覆盖DePIN、RWA资产、Layer2生态热门币种。Web3投资必备工具。',
    keys: '比特币实时价格,加密货币行情,BTC价格美元,ETH走势,SOL价格,K线图表,恐慌贪婪指数,DePIN币种,RWA代币,Layer2生态,交易所排名,币安邀请码,OKX注册,加密货币入门,区块链资讯,合约交易',
    image: DEFAULT_IMAGE,
    type: 'website'
  },
  '/news': {
    title: '加密货币资讯_区块链快讯_DePIN/RWA/Layer2热点追踪 | 比特视界',
    desc: '比特视界资讯频道——7×24小时区块链快讯。覆盖比特币BTC、以太坊ETH、Solana SOL等主流币种动态；深度追踪DePIN赛道、RWA资产、Layer2扩容、Meme币热点。实时更新，永不掉队。',
    keys: '加密货币资讯,区块链快讯,BTC新闻,ETH动态,DePIN热点,RWA赛道,Layer2资讯,Meme币,合约爆仓,Web3新闻',
    image: DEFAULT_IMAGE,
    type: 'website'
  },
  '/exchange': {
    title: '加密货币交易所排名_币安_OKX_Bybit_Bitget_HTX对比 | 比特视界',
    desc: '比特视界交易所频道——全球Top加密货币交易所排名对比。币安、OKX、Bybit、Bitget、HTX、Gate.io深度评测：手续费、交易对、KYC要求、邀请返佣。附专属注册邀请链接，享最高手续费折扣。',
    keys: '加密货币交易所排名,币安邀请码,OKX注册链接,Bybit返佣,Bitget邀请,HTX注册,Gate.io交易所,交易所手续费对比,合约交易所推荐,加密货币交易平台',
    image: DEFAULT_IMAGE,
    type: 'website'
  },
  '/kline': {
    title: '加密货币K线行情图_技术分析指标_BTC/ETH/SOL走势 | 比特视界',
    desc: '比特视界K线行情——专业加密货币技术分析图表。支持BTC、ETH、SOL、BNB等多币种K线走势，多时间周期切换。集成MA均线、MACD、RSI、布林带等技术指标。实时数据，毫秒级刷新。',
    keys: 'K线图,技术分析,BTC走势图,ETH行情分析,加密货币K线,MACD指标,RSI指标,比特币技术分析,支撑位阻力位,币圈看盘工具',
    image: DEFAULT_IMAGE,
    type: 'website'
  },
  '/tools': {
    title: '加密货币工具_区块浏览器_Gas费查询_汇率换算 | 比特视界',
    desc: '比特视界工具站——Web3常用工具箱。区块浏览器查询链上交易记录、Gas费实时查询、加密货币汇率换算、合约地址验证。一站式满足链上数据查询需求。',
    keys: '区块浏览器,Gas费查询,加密货币汇率,USDT汇率,链上工具,合约验证,区块链浏览器,以太坊Gas,手续费查询',
    image: DEFAULT_IMAGE,
    type: 'website'
  },
  '/topics': {
    title: '加密货币入门教程_Web3新手教学_DeFi/NFT/合约交易完全指南 | 比特视界',
    desc: '比特视界学习专题——从零到一的加密货币入门教程。比特币基础、以太坊生态、DeFi挖矿、NFT指南、合约交易教学、项目深度测评。适合Web3新手和进阶玩家。',
    keys: '加密货币入门教程,Web3新手教学,比特币怎么买,DeFi教程,NFT指南,合约交易入门,以太坊生态,区块链科普,加密货币投资,币圈入门',
    image: DEFAULT_IMAGE,
    type: 'website',
    schema: injectTopicsSchema
  },
  '/flash': {
    title: '加密货币快讯_7×24小时币圈资讯 | 比特视界资讯',
    desc: '比特视界资讯——7×24小时实时加密货币快讯。链上侦探、融资动态、AI赛道、预测市场，多维度覆盖区块链行业最新动态。',
    keys: '加密货币快讯,币圈资讯,链上侦探,区块链融资,AI加密,预测市场,Web3资讯,加密货币新闻',
    image: DEFAULT_IMAGE,
    type: 'website'
  },
  '/about': {
    title: '关于比特视界 | 专业加密货币行情平台_联系我们_商务合作',
    desc: '比特视界——专业加密货币实时行情与资讯平台。提供BTC/ETH/SOL价格追踪、恐慌指数、K线分析、交易所排名。欢迎交易所、项目方、媒体洽谈合作。',
    keys: '比特视界,加密货币平台,区块链数据,联系我们,商务合作,交易所推广,加密货币媒体',
    image: DEFAULT_IMAGE,
    type: 'website',
    schema: injectAboutSchema
  }
}

/**
 * 为「加密学习/热门专题」页注入 Course + EducationalOrganization Schema
 */
function injectTopicsSchema() {
  removeSchema('TopicsSchema')
  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.id = 'TopicsSchema'
  script.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'EducationalOrganization',
        'name': '比特视界加密学院',
        'url': `${BASE}/topics`,
        'logo': DEFAULT_IMAGE,
        'description': '提供加密货币、Web3、区块链系统性入门教程——从比特币基础到DeFi/NFT/合约交易全栈指南',
        'knowsAbout': ['Cryptocurrency', 'Blockchain', 'DeFi', 'NFT', 'Smart Contract', 'Web3', 'Bitcoin', 'Ethereum']
      },
      {
        '@type': 'ItemList',
        'itemListElement': [
          {
            '@type': 'ListItem', 'position': 1,
            'item': {
              '@type': 'Course',
              'name': '比特币入门完全指南',
              'description': '从零开始了解比特币：挖矿原理、钱包使用、交易所买卖、链上交易确认。适合完全零基础的加密货币新手。',
              'provider': { '@type': 'EducationalOrganization', 'name': '比特视界加密学院' },
              'educationalLevel': 'beginner',
              'about': { '@type': 'Thing', 'name': 'Bitcoin' }
            }
          },
          {
            '@type': 'ListItem', 'position': 2,
            'item': {
              '@type': 'Course',
              'name': '以太坊生态与Layer2完全解析',
              'description': '深入理解以太坊智能合约、Gas机制、Layer2扩容方案(Arbitrum/Optimism/zkSync)、DeFi生态全景。',
              'provider': { '@type': 'EducationalOrganization', 'name': '比特视界加密学院' },
              'educationalLevel': 'intermediate',
              'about': { '@type': 'Thing', 'name': 'Ethereum' }
            }
          },
          {
            '@type': 'ListItem', 'position': 3,
            'item': {
              '@type': 'Course',
              'name': 'DeFi去中心化金融实战教程',
              'description': 'Uniswap、Aave、Curve等头部DeFi协议实操指南。包含流动性挖矿、借贷策略、无常损失避坑。',
              'provider': { '@type': 'EducationalOrganization', 'name': '比特视界加密学院' },
              'educationalLevel': 'intermediate',
              'about': { '@type': 'Thing', 'name': 'DeFi' }
            }
          },
          {
            '@type': 'ListItem', 'position': 4,
            'item': {
              '@type': 'Course',
              'name': '加密货币合约交易从入门到精通',
              'description': '永续合约、交割合约全面解析。仓位管理、止损策略、资金费率套利、爆仓风险控制。',
              'provider': { '@type': 'EducationalOrganization', 'name': '比特视界加密学院' },
              'educationalLevel': 'advanced',
              'about': { '@type': 'Thing', 'name': 'Futures Trading' }
            }
          },
          {
            '@type': 'ListItem', 'position': 5,
            'item': {
              '@type': 'Course',
              'name': 'NFT与数字收藏品完全指南',
              'description': 'NFT铸造、OpenSea交易、蓝筹项目分析、版税机制、Gas优化策略。',
              'provider': { '@type': 'EducationalOrganization', 'name': '比特视界加密学院' },
              'educationalLevel': 'beginner',
              'about': { '@type': 'Thing', 'name': 'NFT' }
            }
          },
          {
            '@type': 'ListItem', 'position': 6,
            'item': {
              '@type': 'Course',
              'name': 'Web3热门项目深度测评',
              'description': 'DePIN、RWA、AI×Crypto等前沿赛道项目基本面分析。代币经济模型、团队背景、估值方法论。',
              'provider': { '@type': 'EducationalOrganization', 'name': '比特视界加密学院' },
              'educationalLevel': 'advanced',
              'about': { '@type': 'Thing', 'name': 'Web3' }
            }
          }
        ]
      }
    ]
  })
  document.head.appendChild(script)
}

/**
 * 为「关于我们」页注入 Organization E-E-A-T Schema
 */
function injectAboutSchema() {
  removeSchema('AboutSchema')
  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.id = 'AboutSchema'
  script.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': '比特视界',
    'url': BASE,
    'logo': DEFAULT_IMAGE,
    'description': '专业加密货币行情数据与资讯平台，提供BTC/ETH/SOL实时价格、恐慌指数、K线分析、交易所排名。',
    'contactPoint': {
      '@type': 'ContactPoint',
      'contactType': 'customer support',
      'availableLanguage': ['Chinese'],
      'url': `${BASE}/about`
    },
    'areaServed': 'Worldwide',
    'knowsAbout': ['Cryptocurrency', 'Bitcoin', 'Ethereum', 'Blockchain', 'DeFi', 'NFT', 'Web3']
  })
  document.head.appendChild(script)
}

function removeSchema(id) {
  const el = document.getElementById(id)
  if (el) el.remove()
}

/**
 * 动态注入页面级 BreadcrumbList Schema
 */
function injectBreadcrumb(items) {
  removeSchema('Breadcrumb')
  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.id = 'Breadcrumb'
  script.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, i) => ({
      '@type': 'ListItem',
      'position': i + 1,
      'name': item.name,
      'item': item.url
    }))
  })
  document.head.appendChild(script)
}

/**
 * 核心 Meta 更新函数（消除重复，统一管理）
 */
const updateMeta = (toPath) => {
  const config = SEO_CONFIG[toPath] || SEO_CONFIG['/']
  const canonicalUrl = `${BASE}${toPath}`

  document.title = config.title

  const setMeta = (name, content, isProperty = false) => {
    if (!content) return
    const attr = isProperty ? 'property' : 'name'
    let el = document.querySelector(`meta[${attr}="${name}"]`)
    if (!el) {
      el = document.createElement('meta')
      el.setAttribute(attr, name)
      document.head.appendChild(el)
    }
    el.setAttribute('content', content)
  }

  const setLink = (rel, href) => {
    if (!href) return
    let el = document.querySelector(`link[rel="${rel}"]`)
    if (!el) {
      el = document.createElement('link')
      el.setAttribute('rel', rel)
      document.head.appendChild(el)
    }
    el.setAttribute('href', href)
  }

  // 标准 Meta
  setMeta('description', config.desc)
  setMeta('keywords', config.keys)

  // Open Graph
  setMeta('og:title', config.title, true)
  setMeta('og:description', config.desc, true)
  setMeta('og:image', config.image || DEFAULT_IMAGE, true)
  setMeta('og:url', canonicalUrl, true)
  setMeta('og:type', config.type || 'website', true)
  setMeta('og:site_name', SITE_NAME, true)
  setMeta('og:locale', 'zh_CN', true)

  // Twitter Card
  setMeta('twitter:card', 'summary_large_image')
  setMeta('twitter:title', config.title)
  setMeta('twitter:description', config.desc)
  setMeta('twitter:image', config.image || DEFAULT_IMAGE)

  // Canonical
  setLink('canonical', canonicalUrl)

  // 面包屑导航
  const pathParts = toPath.split('/').filter(Boolean)
  const breadItems = [{ name: '比特视界', url: BASE }]
  if (pathParts.length > 0) {
    let currentPath = ''
    const breadMap = {
      'news': '资讯',
      'exchange': '交易所',
      'kline': 'K线行情',
      'tools': '工具',
      'topics': '热门专题',
      'flash': '资讯',
      'about': '关于我们',
      'chart': '行情图表'
    }
    for (const part of pathParts) {
      currentPath += `/${part}`
      breadItems.push({ name: breadMap[part] || part, url: `${BASE}${currentPath}` })
    }
  }
  injectBreadcrumb(breadItems)

  // 执行路由特有的 Schema 注入
  if (config.schema && typeof config.schema === 'function') {
    config.schema()
  }
}

router.afterEach((to) => {
  // 行情详情页动态 SEO
  if (to.path.startsWith('/chart/')) {
    const symbol = (to.params.symbol || 'BTC').toUpperCase()
    updateChartMeta(symbol)
    return
  }
  // 交易所详情页动态 SEO
  if (to.path.startsWith('/exchange/') && to.params.id) {
    updateExchangeMeta(to.params.id)
    return
  }
  updateMeta(to.path)
})

/**
 * 行情详情页动态 SEO — 注入实时 FOMO 描述
 */
function updateChartMeta(symbol) {
  const canonicalUrl = `${BASE}/chart/${symbol}`
  const coinNames = {
    BTC: '比特币', ETH: '以太坊', SOL: 'Solana', BNB: 'BNB',
    XRP: '瑞波币', DOGE: '狗狗币', ADA: '艾达币', AVAX: '雪崩',
    DOT: '波卡', LINK: 'Chainlink', MATIC: 'Polygon', UNI: 'Uniswap',
    SHIB: '柴犬币', TRX: '波场', LTC: '莱特币', ATOM: 'Cosmos',
    FIL: 'Filecoin', NEAR: 'NEAR', OP: 'Optimism', ARB: 'Arbitrum',
    APT: 'Aptos', SUI: 'Sui', TON: 'Toncoin', PEPE: 'Pepe'
  }
  const name = coinNames[symbol] || symbol
  const title = `${name}(${symbol})实时价格_K线行情_24小时涨跌 | 比特视界`
  const desc = `实时追踪${name}(${symbol})最新美元价格、24小时涨跌幅、成交量与市值排名。专业K线技术分析图表，多时间周期切换。${symbol}合约交易、现货买卖必备行情工具。数据来自币安API，毫秒级刷新。`

  document.title = title
  setMetaTag('description', desc)
  setMetaTag('keywords', `${symbol}价格,${name}实时行情,${symbol}K线图,${name}走势分析,${symbol}合约交易,${symbol}现货,${name}市值,${symbol}24小时涨跌`)
  setMetaTag('og:title', title, true)
  setMetaTag('og:description', desc, true)
  setMetaTag('og:url', canonicalUrl, true)
  setMetaTag('og:type', 'website', true)
  setMetaTag('og:image', DEFAULT_IMAGE, true)
  setMetaTag('og:site_name', SITE_NAME, true)
  setMetaTag('twitter:card', 'summary_large_image')
  setMetaTag('twitter:title', title)
  setMetaTag('twitter:description', desc)
  setMetaTag('twitter:image', DEFAULT_IMAGE)
  setLinkTag('canonical', canonicalUrl)

  injectBreadcrumb([
    { name: '比特视界', url: BASE },
    { name: `${name}(${symbol})行情`, url: canonicalUrl }
  ])
}

/**
 * 交易所详情页动态 SEO
 */
function updateExchangeMeta(id) {
  const canonicalUrl = `${BASE}/exchange/${id}`
  const exchangeNames = {
    binance: '币安', okx: 'OKX', bybit: 'Bybit', bitget: 'Bitget',
    gate: 'Gate.io', kucoin: 'KuCoin', kraken: 'Kraken',
    htx: 'HTX', bybitspot: 'Bybit Spot'
  }
  const name = exchangeNames[id] || id
  const title = `${name}交易所评测_手续费_注册邀请链接_2026最新版 | 比特视界`
  const desc = `${name}交易所2026年深度评测：交易手续费对比、合约杠杆倍数、KYC认证流程、出入金方式、邀请返佣比例。附${name}专属注册邀请链接，享最高手续费折扣。专业加密货币交易所排名。`

  document.title = title
  setMetaTag('description', desc)
  setMetaTag('og:title', title, true)
  setMetaTag('og:description', desc, true)
  setMetaTag('og:url', canonicalUrl, true)
  setMetaTag('og:type', 'website', true)
  setMetaTag('og:image', DEFAULT_IMAGE, true)
  setMetaTag('twitter:card', 'summary_large_image')
  setMetaTag('twitter:title', title)
  setMetaTag('twitter:description', desc)
  setLinkTag('canonical', canonicalUrl)

  injectBreadcrumb([
    { name: '比特视界', url: BASE },
    { name: '交易所排名', url: `${BASE}/exchange` },
    { name, url: canonicalUrl }
  ])
}

// 公共辅助函数（与 updateMeta 内部复用）
function setMetaTag(name, content, isProperty = false) {
  if (!content) return
  const attr = isProperty ? 'property' : 'name'
  let el = document.querySelector(`meta[${attr}="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}
function setLinkTag(rel, href) {
  if (!href) return
  let el = document.querySelector(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

// 初始化首页 SEO
updateMeta('/')

export default router
