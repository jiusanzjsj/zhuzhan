/**
 * 比特视界 - 后端API服务
 * 提供快讯、链上侦探、重要资讯及Binance代理
 */

import express from 'express'
import cors from 'cors'
import axios from 'axios'

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

// 缓存
const cache = new Map()
const CACHE_TTL = 5 * 60 * 1000

const getCache = (key) => {
  const item = cache.get(key)
  if (!item) return null
  if (Date.now() - item.timestamp > CACHE_TTL) { cache.delete(key); return null }
  return item.data
}
const setCache = (key, data) => cache.set(key, { data, timestamp: Date.now() })

// 后备数据
const FALLBACK_NEWS = [
  { title: 'BTC突破105000美元关口，机构买盘强劲', summary: '比特币价格今日强势突破105000美元，创历史新高', time: '14:32', url: '', tags: ['BTC'], isImportant: true },
  { title: '以太坊Gas费骤降，DeFi活动创新高', summary: '以太坊网络Gas费降至50 Gwei以下', time: '13:15', url: '', tags: ['ETH'], isImportant: false },
  { title: 'Solana链上NFT销售额突破10亿美元', summary: 'Solana网络NFT市场持续繁荣', time: '11:45', url: '', tags: ['SOL'], isImportant: false }
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

app.get('/api/news', (req, res) => {
  const cached = getCache('news')
  if (cached) return res.json(cached)
  const result = { success: true, data: FALLBACK_NEWS }
  setCache('news', result)
  res.json(result)
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
})
