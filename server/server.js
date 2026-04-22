/**
 * 比特视界 - 后端API服务
 * 提供快讯、链上侦探、重要资讯及Binance代理
 */

import express from 'express'
import cors from 'cors'
import axios from 'axios'
import * as cheerio from 'cheerio'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = 3001
const CRYPTOPANIC_TOKEN = '8c820bb21bc5acdc1dcca538410b3a478e26ccc8'
const CHAINTHINK_URL = 'https://chainthink.cn/zh-CN/article'
const CHAIN_DATA_FILE = path.join(__dirname, 'chainthink-news.json')
const POSTS_FILE = path.join(__dirname, 'posts.json')
const KEEP_DAYS = 7
const FETCH_INTERVAL = 2 * 60 * 60 * 1000 // 2小时
const CLEANUP_INTERVAL = 24 * 60 * 60 * 1000 // 24小时

app.use(cors())
app.use(express.json())

// ========== 工具函数 ==========

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

function normalizeImage(src) {
  if (!src) return ''
  const value = String(src).trim()
  if (value.startsWith('http://') || value.startsWith('https://')) return value
  if (value.startsWith('/_next/image?url=')) {
    try {
      const parsed = new URL(value, 'https://chainthink.cn')
      const rawUrl = parsed.searchParams.get('url')
      return rawUrl ? decodeURIComponent(rawUrl) : parsed.toString()
    } catch {
      return `https://chainthink.cn${value}`
    }
  }
  if (value.startsWith('//')) return `https:${value}`
  if (value.startsWith('/')) return `https://chainthink.cn${value}`
  return value
}

function formatPublishTime(ts) {
  const n = Number(ts)
  if (!Number.isFinite(n)) return ''
  const d = new Date(n * 1000)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${mm}-${dd} ${hh}:${mi}`
}

function decodeNextFPayload(htmlText) {
  const pushMarker = 'self.__next_f.push([1,"'
  const start = htmlText.lastIndexOf(pushMarker)
  if (start === -1) throw new Error('未找到 Next.js payload 起始位置')
  const payloadStart = start + pushMarker.length
  let end = htmlText.indexOf('"])</script>', payloadStart)
  if (end === -1) end = htmlText.indexOf('"])', payloadStart)
  if (end === -1 || end <= payloadStart) throw new Error('未找到 Next.js payload 结束位置')
  const raw = htmlText.slice(payloadStart, end)
  return raw.replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\\\/g, '\\')
}

function extractJsonObjectAfterKey(text, keyWithQuotes) {
  const idx = text.indexOf(keyWithQuotes)
  if (idx === -1) throw new Error(`未找到键: ${keyWithQuotes}`)
  const after = text.slice(idx + keyWithQuotes.length)
  const objStart = after.indexOf('{"')
  if (objStart === -1) throw new Error(`未找到 ${keyWithQuotes} 对应 JSON 对象起点`)
  let pos = objStart; let depth = 0; let inString = false; let escape = false
  while (pos < after.length) {
    const ch = after[pos]
    if (inString) {
      if (escape) { escape = false }
      else if (ch === '\\') { escape = true }
      else if (ch === '"') { inString = false }
    } else {
      if (ch === '"') { inString = true }
      else if (ch === '{' || ch === '[') { depth++ }
      else if (ch === '}' || ch === ']') {
        depth--
        if (depth === 0) {
          return JSON.parse(after.slice(objStart, pos + 1))
        }
      }
    }
    pos++
  }
  throw new Error(`未能完整提取 ${keyWithQuotes} 对应 JSON 对象`)
}

async function httpGet(url, timeout = 15000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      signal: controller.signal
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.text()
  } finally {
    clearTimeout(timer)
  }
}

// ========== 爬取完整实现 ==========

async function fetchDetail(detailId) {
  if (!detailId) return { content: '', image: '', images: [], blocks: [] }
  try {
    const page = await httpGet(`${CHAINTHINK_URL.replace('/zh-CN/article', '')}/zh-CN/article/${detailId}`)
    const imageMatch = page.match(/"coverImage":"([^"]+)"/)
    const mainImage = normalizeImage(imageMatch?.[1] || '')
    let blocks = []
    const richContentMatch = page.match(/<div class="[^"]*rich_text_content[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<div class="/)
    if (richContentMatch) {
      const segments = richContentMatch[1].split(/(<p[^>]*>[\s\S]*?<\/p>)/gi)
      for (const segment of segments) {
        if (!segment.trim()) continue
        let imgUrl = null
        const imgMatch = segment.match(/<img[^>]*src="([^"]+)"[^>]*>/i)
        if (imgMatch) {
          let url = imgMatch[1]
          if (url.startsWith('//')) url = 'https:' + url
          else if (url.startsWith('/')) url = `https://chainthink.cn${url}`
          if (url && !url.includes('data:')) { imgUrl = url }
        }
        let text = segment.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim()
        if (text.length > 10 || imgUrl) blocks.push({ text, image: imgUrl })
      }
    }
    if (blocks.length === 0) {
      const initDetalisMatch = page.match(/"initDetalis":(\{[\s\S]*?\}])\}\}\}/)
      if (initDetalisMatch) {
        try {
          const initData = JSON.parse('{' + initDetalisMatch[1] + '}}')
          if (initData?.info?.text) {
            const content = initData.info.text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
            blocks = content ? [{ text: content, image: null }] : []
          }
        } catch {}
      }
    }
    const images = []
    if (mainImage) images.push(mainImage)
    blocks.forEach(b => { if (b.image && !images.includes(b.image)) images.push(b.image) })
    return { content: blocks.map(b => b.text).join('\n'), image: mainImage, images, blocks }
  } catch (err) {
    return { content: '', image: '', images: [], blocks: [] }
  }
}

async function fetchChainThinkNews(withDetail = true) {
  try {
    const htmlText = await httpGet(CHAINTHINK_URL)
    const payload = decodeNextFPayload(htmlText)
    const latest = extractJsonObjectAfterKey(payload, '"initialLatestData"')
    const items = Array.isArray(latest.list) ? latest.list : []
    const results = []
    const limit = 20

    for (const item of items.slice(0, limit)) {
      const info = item?.info || {}
      const articleId = String(item?.id || '')
      const title = String(info?.title || '').trim()
      if (!title) continue
      if (['ChainThink链智库', 'ChainThink', '链智库'].some(word => title.includes(word))) continue

      const result = {
        id: articleId,
        title,
        summary: String(info?.abstract || '').trim(),
        time: formatPublishTime(item?.publishTime),
        published_at: item?.publishTime || null,
        url: articleId ? `${CHAINTHINK_URL}/${articleId}` : CHAINTHINK_URL,
        tags: Array.isArray(item?.contentTags) ? item.contentTags.map(tag => tag?.tagName).filter(Boolean) : [],
        isImportant: Boolean(item?.isGood),
        coverImage: normalizeImage(info?.coverImage || ''),
        content: '',
        source: 'ChainThink',
      }

      if (withDetail && articleId) {
        const detail = await fetchDetail(articleId)
        if (detail.image && !result.coverImage) result.coverImage = detail.image
        if (detail.content) result.content = detail.content
        if (detail.images && detail.images.length > 0) result.images = detail.images
        if (detail.blocks && detail.blocks.length > 0) result.blocks = detail.blocks
        await sleep(200)
      }

      results.push(result)
    }
    return results
  } catch (e) {
    console.error('fetchChainThinkNews 失败:', e.message)
    return []
  }
}

// ========== 文件读写 & 清理 ==========

function cleanupOldArticles(items) {
  const cutoff = Date.now() - KEEP_DAYS * 24 * 60 * 60 * 1000
  return items.filter(item => {
    const ts = Number(item.published_at) * 1000
    return Number.isFinite(ts) && ts > cutoff
  })
}

function loadChainData() {
  try {
    if (existsSync(CHAIN_DATA_FILE)) {
      const raw = readFileSync(CHAIN_DATA_FILE, 'utf8')
      const json = JSON.parse(raw)
      if (json?.data?.length > 0) return json
    }
  } catch {}
  return null
}

function saveChainData(items) {
  const filtered = cleanupOldArticles(items)
  const output = {
    success: true,
    source: 'node-chainthink-scraper',
    generatedAt: new Date().toISOString(),
    count: filtered.length,
    data: filtered
  }
  writeFileSync(CHAIN_DATA_FILE, JSON.stringify(output, null, 2), 'utf8')
  return output
}

function isDataEqual(oldData, newData) {
  if (!oldData || !newData) return false
  const oldMap = new Map((oldData.data || []).map(i => [i.id, i.published_at]))
  const newMap = new Map((newData.data || []).map(i => [i.id, i.published_at]))
  if (oldMap.size !== newMap.size) return false
  for (const [id, ts] of oldMap) {
    if (!newMap.has(id)) return false
    if (String(newMap.get(id)) !== String(ts)) return false
  }
  return true
}

// ========== 论坛存储 ==========

const loadPosts = () => {
  try {
    if (existsSync(POSTS_FILE)) return JSON.parse(readFileSync(POSTS_FILE, 'utf8'))
  } catch {}
  return []
}

const savePosts = (posts) => {
  try {
    writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2), 'utf8')
  } catch (e) {
    console.error('保存帖子失败:', e.message)
  }
}

// ========== 缓存 ==========

const cache = new Map()
const CACHE_TTL = 5 * 60 * 1000

const getCache = (key) => {
  const item = cache.get(key)
  if (!item) return null
  if (Date.now() - item.timestamp > (item.ttl || CACHE_TTL)) { cache.delete(key); return null }
  return item.data
}

const setCache = (key, data, ttl) => cache.set(key, { data, timestamp: Date.now(), ttl })

// ========== 定时任务 ==========

const prefetchNews = async () => {
  try {
    const newData = await fetchChainThinkNews(true)
    const oldData = loadChainData()
    if (!isDataEqual(oldData, { data: newData })) {
      const saved = saveChainData(newData)
      console.log(`[${new Date().toLocaleTimeString()}] 快讯已刷新，共 ${saved.count} 条`)
    } else {
      console.log(`[${new Date().toLocaleTimeString()}] 数据无变化，跳过写入`)
    }
    setCache('news', { success: true, data: newData })
    setCache('chainthink', { success: true, data: newData })
  } catch (e) {
    console.error('定时抓取快讯失败:', e.message)
  }
}

const prefetchChain = async () => {
  try {
    const cached = getCache('chainthink')
    if (cached?.data?.length) {
      setCache('chain', { success: true, data: cached.data.slice(0, 5).map(i => ({ title: i.title, time: i.time, url: i.url })) })
      setCache('important', { success: true, data: cached.data.slice(0, 3).map(i => ({ title: i.title, url: i.url })) })
    }
  } catch {}
}

// ========== 启动时执行 ==========

const cachedData = loadChainData()
if (cachedData && cachedData.data?.length > 0) {
  setCache('news', cachedData)
  setCache('chainthink', cachedData)
  console.log(`[启动] 从文件恢复快讯 ${cachedData.count} 条`)
  prefetchChain()
} else {
  console.log('[启动] 无本地缓存，即将首次抓取...')
  prefetchNews().then(() => prefetchChain())
}

// 每2小时抓取一次
setInterval(prefetchNews, FETCH_INTERVAL)
setInterval(prefetchChain, FETCH_INTERVAL)

// 每24小时清理一次
setInterval(() => {
  try {
    const json = loadChainData()
    if (json?.data) {
      const cleaned = cleanupOldArticles(json.data)
      if (cleaned.length !== json.data.length) {
        saveChainData(cleaned)
        console.log(`[${new Date().toLocaleTimeString()}] 自动清理完成，保留 ${cleaned.length} 条`)
      }
    }
  } catch (e) {
    console.error('自动清理失败:', e.message)
  }
}, CLEANUP_INTERVAL)

// ========== 后备数据 ==========

const FALLBACK_NEWS = (() => {
  const now = new Date()
  const pad = n => String(n).padStart(2, '0')
  const hh = pad(now.getHours())
  const mm = pad(now.getMinutes())
  return [
    { title: '以太坊Gas费骤降，DeFi活动创新高', summary: '以太坊网络Gas费降至50 Gwei以下，DeFi协议活跃度大幅提升', time: `${hh}:${mm}`, url: '', tags: ['ETH'], isImportant: false },
    { title: 'Solana链上NFT销售额突破10亿美元', summary: 'Solana网络NFT市场持续繁荣，本月销售额已突破10亿美元', time: `${pad((now.getHours() - 1 + 24) % 24)}:${mm}`, url: '', tags: ['SOL'], isImportant: false },
    { title: '美国SEC批准以太坊现货ETF，多家机构提交申请', summary: '美国证券交易委员会批准以太坊现货ETF，机构投资者热情高涨', time: `${pad((now.getHours() - 2 + 24) % 24)}:${mm}`, url: '', tags: ['ETH'], isImportant: true },
    { title: '加密货币总市值突破3万亿美元', summary: '全球加密货币市场总市值今日突破3万亿美元大关，创历史记录', time: `${pad((now.getHours() - 3 + 24) % 24)}:${mm}`, url: '', tags: ['BTC'], isImportant: true },
    { title: 'Polygon推出新开发者工具，ZK-Rollup技术再进一步', summary: 'Polygon发布新一代开发者工具，进一步简化ZK-Rollup应用开发', time: `${pad((now.getHours() - 4 + 24) % 24)}:${mm}`, url: '', tags: ['MATIC'], isImportant: false },
  ]
})()

const FALLBACK_CHAIN = [
  { title: '某巨鲸地址转移5000枚BTC至交易所', time: '14:20', url: '' },
  { title: '未知钱包地址增持10000枚ETH', time: '13:45', url: '' },
]
const FALLBACK_IMPORTANT = [
  { title: '美国SEC批准以太坊现货ETF', url: '' },
  { title: '比特币减半倒计时：预计还有30天', url: '' },
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
  MKRUSUSDT: { lastPrice: '2800.00', priceChangePercent: '1.50' },
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

// ========== API 路由 ==========

app.get('/api/news', async (req, res) => {
  const skipCache = req.query._ != null
  if (!skipCache) {
    const cached = getCache('news')
    if (cached) return res.json(cached)
  }
  try {
    const items = await fetchChainThinkNews(true)
    if (items.length > 0) {
      const result = { success: true, data: items }
      if (!skipCache) {
        setCache('news', result)
      } else {
        cache.set('news', { data: result, timestamp: Date.now(), ttl: CACHE_TTL })
      }
      return res.json(result)
    }
  } catch (e) { console.error('获取快讯失败:', e.message) }
  try {
    const response = await axios.get(
      `https://cryptopanic.com/api/developer/v2/posts/?auth_token=${CRYPTOPANIC_TOKEN}&regions=zh`,
      { timeout: 8000 }
    )
    if (response.data?.results?.length > 0) {
      const news = response.data.results.slice(0, 20).map(item => ({
        title: item.title, summary: item.description || '',
        time: item.published_at ? new Date(item.published_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : '',
        url: item.url || '', tags: item.tags?.map(t => t.name) || [],
        isImportant: item.title.includes('重要') || item.title.includes('突发'),
        source: item.source?.name || 'CryptoPanic'
      }))
      const result = { success: true, data: news }
      if (!skipCache) {
        setCache('news', result)
      } else {
        cache.set('news', { data: result, timestamp: Date.now(), ttl: CACHE_TTL })
      }
      return res.json(result)
    }
  } catch (e) { console.error('获取快讯失败:', e.message) }
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
    const items = await fetchChainThinkNews(true)
    const result = { success: true, data: items }
    setCache('chainthink', result)
    return res.json(result)
  } catch (e) {
    console.error('获取 ChainThink 快讯失败:', e.message)
    return res.json({ success: true, data: [] })
  }
})

app.get('/binance-api/*', async (req, res) => {
  const path = req.params[0]
  const targets = ['https://api.binance.com', 'https://api.binanceu.com', 'https://api1.binance.com', 'https://api2.binance.com', 'https://api3.binance.com']
  for (const target of targets) {
    try {
      const response = await axios.get(`${target}/${path}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 3000
      })
      return res.json(response.data)
    } catch {}
  }
  const symbol = (req.query.symbol || '').toUpperCase()
  res.json(BINANCE_FALLBACK[symbol] || { lastPrice: '100.00', priceChangePercent: '0.00' })
})

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ========== 论坛模块 ==========

app.get('/api/forum/:articleId', (req, res) => {
  const allPosts = loadPosts()
  const filtered = allPosts
    .filter(p => String(p.articleId) === String(req.params.articleId))
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 50)
  res.json({ success: true, data: filtered, total: filtered.length })
})

app.post('/api/forum', (req, res) => {
  const { articleId, nickname, content } = req.body
  if (!content?.trim()) return res.status(400).json({ success: false, message: '内容不能为空' })
  const nick = (nickname || '').trim() || '游客#' + Math.floor(1000 + Math.random() * 9000)
  const clientIp = req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress || ''
  const posts = loadPosts()
  const newPost = {
    id: Date.now(),
    articleId: String(articleId || ''),
    nickname: nick,
    content: String(content).trim().slice(0, 500),
    timestamp: Date.now(),
    time: new Date().toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
    ip: clientIp
  }
  posts.push(newPost)
  savePosts(posts)
  res.json({ success: true, data: newPost })
})

app.delete('/api/forum/:id', (req, res) => {
  const { id } = req.params
  const clientIp = req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress || ''
  const posts = loadPosts()
  const target = posts.find(p => String(p.id) === String(id))
  if (!target) return res.status(404).json({ success: false, message: '帖子不存在' })
  // IP绑定验证：同一IP方可删除
  if (target.ip !== clientIp) return res.status(403).json({ success: false, message: '仅发帖IP可删除' })
  savePosts(posts.filter(p => String(p.id) !== String(id)))
  res.json({ success: true })
})

app.listen(PORT, () => {
  console.log(`🚀 比特视界API服务已启动: http://localhost:${PORT}`)
})