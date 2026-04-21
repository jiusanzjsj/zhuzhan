/**
 * 比特视界 - 后端API服务
 * 提供快讯、链上侦探、重要资讯及Binance代理
 */

import express from 'express'
import cors from 'cors'
import axios from 'axios'
import cheerio from 'cheerio'

const app = express()
const PORT = 3001
const CRYPTOPANIC_TOKEN = '8c820bb21bc5acdc1dcca538410b3a478e26ccc8'
const CHAINTHINK_URL = 'https://chainthink.cn/zh-CN/article'

app.use(cors())
app.use(express.json())

// 缓存
const cache = new Map()
const CACHE_TTL = 5 * 60 * 1000
const FETCH_INTERVAL = 2 * 60 * 60 * 1000 // 2小时

// 主动预缓存（启动时 + 每2小时抓取一次）
const prefetchNews = async () => {
  try {
    const chainthink = await fetchChainThinkNews()
    if (chainthink.length > 0) {
      setCache('news', { success: true, data: chainthink }, FETCH_INTERVAL)
      console.log(`[${new Date().toLocaleTimeString()}] 快讯已刷新，共 ${chainthink.length} 条`)
    }
  } catch (e) {
    console.error('定时抓取快讯失败:', e.message)
  }
}

const prefetchChain = async () => {
  try {
    const items = await fetchChainThinkNews()
    setCache('chain', { success: true, data: items.slice(0, 5).map(i => ({ title: i.title, time: i.time, url: i.url })) }, FETCH_INTERVAL)
  } catch {}
}

const prefetchImportant = async () => {
  try {
    const items = await fetchChainThinkNews()
    setCache('important', { success: true, data: items.slice(0, 3).map(i => ({ title: i.title, url: i.url })) }, FETCH_INTERVAL)
  } catch {}
}

// 启动时立即抓取一次
prefetchNews()
prefetchChain()
prefetchImportant()

// 每2小时定时抓取
setInterval(prefetchNews, FETCH_INTERVAL)
setInterval(prefetchChain, FETCH_INTERVAL)
setInterval(prefetchImportant, FETCH_INTERVAL)

const getCache = (key) => {
  const item = cache.get(key)
  if (!item) return null
  const ttl = item.ttl || CACHE_TTL
  if (Date.now() - item.timestamp > ttl) { cache.delete(key); return null }
  return item.data
}
const setCache = (key, data, ttl = CACHE_TTL) => cache.set(key, { data, timestamp: Date.now(), ttl })

// 后备数据
const FALLBACK_NEWS = [
  { title: '以太坊Gas费骤降，DeFi活动创新高', summary: '以太坊网络Gas费降至50 Gwei以下，DeFi协议活跃度大幅提升', time: '10:15', url: '', tags: ['ETH'], isImportant: false },
  { title: 'Solana链上NFT销售额突破10亿美元', summary: 'Solana网络NFT市场持续繁荣，本月销售额已突破10亿美元', time: '09:45', url: '', tags: ['SOL'], isImportant: false },
  { title: '币安将在迪拜设立全球合规中心', summary: '币安宣布将在迪拜设立全球合规中心，以应对各国监管要求', time: '09:20', url: '', tags: ['BNB'], isImportant: false },
  { title: '美国SEC批准以太坊现货ETF，多家机构提交申请', summary: '美国证券交易委员会批准以太坊现货ETF，机构投资者热情高涨', time: '08:50', url: '', tags: ['ETH'], isImportant: true },
  { title: '狗狗币社区发起新营销活动，价格小幅上涨', summary: '狗狗币社区发起新营销活动，吸引大量新投资者关注', time: '08:30', url: '', tags: ['DOGE'], isImportant: false },
  { title: 'Cardano主网升级即将完成，智能合约功能增强', summary: 'Cardano主网升级进入最后阶段，将大幅提升网络性能', time: '08:00', url: '', tags: ['ADA'], isImportant: false },
  { title: 'Ripple与多家银行达成合作，XRP应用场景扩大', summary: 'Ripple宣布与多家国际银行建立合作关系，XRP采用率提升', time: '07:40', url: '', tags: ['XRP'], isImportant: false },
  { title: '加密货币总市值突破3万亿美元', summary: '全球加密货币市场总市值今日突破3万亿美元大关，创历史记录', time: '07:20', url: '', tags: ['BTC'], isImportant: true },
  { title: 'Polygon推出新开发者工具，ZK-Rollup技术再进一步', summary: 'Polygon发布新一代开发者工具，进一步简化ZK-Rollup应用开发', time: '07:00', url: '', tags: ['MATIC'], isImportant: false }
]
const FALLBACK_CHAIN = [
  { title: '某巨鲸地址转移5000枚BTC至交易所', time: '14:20', url: '' },
  { title: '未知钱包地址增持10000枚ETH', time: '13:45', url: '' }
]
const FALLBACK_IMPORTANT = [
  { title: '美国SEC批准以太坊现货ETF', url: '' },
  { title: '比特币减半倒计时：预计还有30天', url: '' }
]
const BINANCE_FALLBACK = {
  BTCUSDT: { lastPrice: '105000.00', priceChangePercent: '1.50' },
  ETHUSDT: { lastPrice: '3200.00', priceChangePercent: '2.30' },
  BNBUSDT: { lastPrice: '650.00', priceChangePercent: '1.20' },
  SOLUSDT: { lastPrice: '175.00', priceChangePercent: '3.50' },
  XRPUSDT: { lastPrice: '2.45', priceChangePercent: '0.80' },
  TRXUSDT: { lastPrice: '0.28', priceChangePercent: '-0.50' },
  DOGEUSDT: { lastPrice: '0.32', priceChangePercent: '1.80' },
  ADAUSDT: { lastPrice: '0.95', priceChangePercent: '-1.20' },
  AVAXUSDT: { lastPrice: '38.00', priceChangePercent: '2.10' },
  DOTUSDT: { lastPrice: '18.00', priceChangePercent: '0.90' },
  LINKUSDT: { lastPrice: '18.00', priceChangePercent: '1.50' },
  MATICUSDT: { lastPrice: '0.85', priceChangePercent: '-0.80' },
  LTCUSDT: { lastPrice: '120.00', priceChangePercent: '0.50' },
  SHIBUSDT: { lastPrice: '0.000022', priceChangePercent: '-2.10' },
  PEPEUSDT: { lastPrice: '0.000012', priceChangePercent: '5.20' },
  WIFUSDT: { lastPrice: '2.80', priceChangePercent: '3.80' },
  SUIUSDT: { lastPrice: '1.80', priceChangePercent: '2.50' },
  APTUSDT: { lastPrice: '12.00', priceChangePercent: '1.20' },
  ARBUSDT: { lastPrice: '1.20', priceChangePercent: '-0.50' },
  OPUSDT: { lastPrice: '2.50', priceChangePercent: '1.80' },
  INJUSDT: { lastPrice: '28.00', priceChangePercent: '0.90' },
  FILUSDT: { lastPrice: '8.50', priceChangePercent: '-1.00' },
  RUNEUSDT: { lastPrice: '5.50', priceChangePercent: '2.20' },
  NEARUSDT: { lastPrice: '8.00', priceChangePercent: '1.50' },
  ATOMUSDT: { lastPrice: '10.00', priceChangePercent: '0.80' },
  UNIUSDT: { lastPrice: '12.00', priceChangePercent: '1.20' },
  AAVEUSDT: { lastPrice: '280.00', priceChangePercent: '2.00' },
  MKRUSDT: { lastPrice: '2800.00', priceChangePercent: '1.50' },
  CRVUSDT: { lastPrice: '0.60', priceChangePercent: '-1.80' },
  BCHUSDT: { lastPrice: '480.00', priceChangePercent: '0.30' },
  TONUSDT: { lastPrice: '6.50', priceChangePercent: '1.20' },
  NOTUSDT: { lastPrice: '0.025', priceChangePercent: '-3.50' },
  PNUTUSDT: { lastPrice: '2.10', priceChangePercent: '5.20' },
  VINEUSDT: { lastPrice: '3.50', priceChangePercent: '8.20' },
  AI16ZUSDT: { lastPrice: '1.80', priceChangePercent: '12.50' },
  GOATUSDT: { lastPrice: '0.80', priceChangePercent: '3.20' },
  VIRTUALUSDT: { lastPrice: '2.20', priceChangePercent: '4.50' },
  FETUSDT: { lastPrice: '2.00', priceChangePercent: '2.80' },
  RENDERUSDT: { lastPrice: '8.50', priceChangePercent: '3.20' },
  GRTUSDT: { lastPrice: '0.25', priceChangePercent: '1.00' },
  STXUSDT: { lastPrice: '2.20', priceChangePercent: '-0.80' },
  IMXUSDT: { lastPrice: '2.00', priceChangePercent: '1.50' },
  ENSUSDT: { lastPrice: '25.00', priceChangePercent: '0.50' },
  BLURUSDT: { lastPrice: '0.40', priceChangePercent: '-2.00' },
}

async function fetchChainThinkNews() {
  const response = await axios.get(CHAINTHINK_URL, { timeout: 8000 })
  const $ = cheerio.load(response.data)
  const results = []

  $('a').each((_, el) => {
    const href = $(el).attr('href') || ''
    const text = $(el).text().replace(/\s+/g, ' ').trim()
    if (!href || !/\/zh-CN\/article\//.test(href)) return
    if (text.length < 8) return

    const title = text.slice(0, 80)
    const summary = ''
    const fullUrl = href.startsWith('http') ? href : `https://chainthink.cn${href}`
    if (!results.some(i => i.url === fullUrl)) {
      results.push({
        title,
        summary,
        time: '',
        url: fullUrl,
        tags: ['ChainThink'],
        isImportant: false,
        source: 'ChainThink'
      })
    }
  })

  return results.slice(0, 12)
}

app.get('/api/news', async (req, res) => {
  const cached = getCache('news')
  if (cached) return res.json(cached)
  
  // 优先抓取 ChainThink
  try {
    const chainthink = await fetchChainThinkNews()
    if (chainthink.length > 0) {
      const result = { success: true, data: chainthink }
      setCache('news', result)
      return res.json(result)
    }
  } catch (e) {
    console.error('获取 ChainThink 失败:', e.message)
  }

  // 尝试从CryptoPanic获取实时数据
  try {
    const response = await axios.get(
      `https://cryptopanic.com/api/developer/v2/posts/?auth_token=${CRYPTOPANIC_TOKEN}&regions=zh`,
      { timeout: 8000 }
    )
    if (response.data?.results?.length > 0) {
      const news = response.data.results.slice(0, 20).map(item => ({
        title: item.title,
        summary: item.description || '',
        time: item.published_at ? new Date(item.published_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : '',
        url: item.url || '',
        tags: item.tags?.map(t => t.name) || [],
        isImportant: item.title.includes('重要') || item.title.includes('突发'),
        source: item.source?.name || 'CryptoPanic'
      }))
      const result = { success: true, data: news }
      setCache('news', result)
      return res.json(result)
    }
  } catch (e) {
    console.error('获取快讯失败:', e.message)
  }
  
  // 后备静态数据
  res.json({ success: true, data: FALLBACK_NEWS })
})

app.get('/api/news/chain', (req, res) => {
  const cached = getCache('chain')
  if (cached) return res.json(cached)
  const result = { success: true, data: FALLBACK_CHAIN }
  setCache('chain', result)
  res.json(result)
})

app.get('/api/news/important', (req, res) => {
  const cached = getCache('important')
  if (cached) return res.json(cached)
  const result = { success: true, data: FALLBACK_IMPORTANT }
  setCache('important', result)
  res.json(result)
})

app.get('/api/news/chainthink', async (req, res) => {
  const cached = getCache('chainthink')
  if (cached) return res.json(cached)

  try {
    const items = await fetchChainThinkNews()
    const result = { success: true, data: items }
    setCache('chainthink', result)
    return res.json(result)
  } catch (e) {
    console.error('获取 ChainThink 快讯失败:', e.message)
    return res.json({ success: true, data: [] })
  }
})

/**
 * Binance代理 → 尝试连接，失败则返回后备数据
 */
app.get('/binance-api/*', async (req, res) => {
  const path = req.params[0]
  const targets = [
    'https://api.binance.com',
    'https://api.binanceu.com',
    'https://api1.binance.com',
    'https://api2.binance.com',
    'https://api3.binance.com',
  ]
  for (const target of targets) {
    try {
      const response = await axios.get(`${target}/${path}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 3000
      })
      return res.json(response.data)
    } catch (e) {
      // 跳过失败，尝试下一个
    }
  }
  // 全部失败，返回后备数据
  const symbol = (req.query.symbol || '').toUpperCase()
  const data = BINANCE_FALLBACK[symbol]
  res.json(data || { lastPrice: '100.00', priceChangePercent: '0.00' })
})

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`🚀 比特视界API服务已启动: http://localhost:${PORT}`)
  console.log(`🚀 比特视界API服务已启动: http://localhost:${PORT}`)
})
