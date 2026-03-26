/**
 * 交易所数据状态管理
 * 确保数据获取的前提下进行速率优化
 */

import { ref } from 'vue'
import { apiCache } from '../utils/apiCache'

const API_KEY = 'CG-42Ty4UXdyANMSugcsqZSEU7Y'
const REQUEST_TIMEOUT = 10000 // 10秒超时

// 状态
const exchanges = ref([])
const exchangeDetailCache = ref({})
const loading = ref(false)
const error = ref(null)

/**
 * 带超时的fetch封装
 */
async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    return response
  } catch (err) {
    clearTimeout(timeoutId)
    throw err
  }
}

/**
 * 安全获取JSON（失败返回null，不抛出异常）
 */
async function safeJson(response) {
  try {
    return await response.json()
  } catch {
    return null
  }
}

/**
 * 获取交易所列表（带缓存）
 * 优先级：内存 > 缓存 > API
 */
export async function fetchExchanges(forceRefresh = false) {
  // 1. 内存缓存优先
  if (!forceRefresh && exchanges.value.length > 0) {
    return exchanges.value
  }

  // 2. API缓存
  if (!forceRefresh) {
    const cacheKey = 'exchanges_list'
    const cached = apiCache.get(cacheKey)
    if (cached && cached.length > 0) {
      exchanges.value = cached
      return cached
    }
  }

  // 3. 请求API
  try {
    loading.value = true
    error.value = null

    const response = await fetchWithTimeout(
      `https://api.coingecko.com/api/v3/exchanges?per_page=10&page=1`,
      {
        headers: {
          'Accept': 'application/json',
          'x-cg-demo-api-key': API_KEY
        }
      }
    )

    if (!response.ok) {
      throw new Error(`API错误: ${response.status}`)
    }

    const data = await response.json()
    
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('返回数据格式错误')
    }

    // 转换数据
    const result = data.map(ex => ({
      id: ex.id,
      name: ex.name || '未知交易所',
      image: ex.image || '',
      trust_score: ex.trust_score || 0,
      trust_score_rank: ex.trust_score_rank || 999,
      trade_volume_24h_btc: ex.trade_volume_24h_btc || 0,
      volume_change_24h: ex.volume_change_24h || 0,
      number_of_markets: ex.number_of_markets || 0,
      country: ex.country || '-',
      url: ex.url || '#'
    }))

    // 更新内存和缓存
    exchanges.value = result
    apiCache.set('exchanges_list', result)
    
    return result

  } catch (err) {
    console.error('获取交易所列表失败:', err)
    error.value = err.message
    
    // 失败时返回已有数据（哪怕过期）
    if (exchanges.value.length > 0) {
      return exchanges.value
    }
    
    throw err
  } finally {
    loading.value = false
  }
}

/**
 * 获取交易所详情
 * 使用Promise.allSettled确保部分失败不影响整体
 */
export async function fetchExchangeDetail(exchangeId, forceRefresh = false) {
  // 1. 内存缓存优先
  if (!forceRefresh && exchangeDetailCache.value[exchangeId]) {
    return exchangeDetailCache.value[exchangeId]
  }

  // 2. 并行请求详情和BTC价格（使用Settled确保一个失败不影响另一个）
  const results = await Promise.allSettled([
    fetchWithTimeout(
      `https://api.coingecko.com/api/v3/exchanges/${exchangeId}`,
      {
        headers: {
          'Accept': 'application/json',
          'x-cg-demo-api-key': API_KEY
        }
      }
    ),
    fetchWithTimeout(
      `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd`,
      { headers: { 'x-cg-demo-api-key': API_KEY } }
    ).then(r => r.json()).catch(() => ({ bitcoin: { usd: 50000 } }))
  ])

  const detailResult = results[0]
  const btcResult = results[1]

  // 验证详情响应
  if (detailResult.status === 'rejected' || !detailResult.value?.ok) {
    const errMsg = detailResult.status === 'rejected' 
      ? detailResult.reason.message 
      : `HTTP ${detailResult.value?.status}`
    throw new Error(`获取交易所详情失败: ${errMsg}`)
  }

  const detail = await detailResult.value.json()
  const btcPriceData = btcResult.status === 'fulfilled' ? btcResult.value : { bitcoin: { usd: 50000 } }
  const btcPrice = btcPriceData.bitcoin?.usd || 50000
  const volumeUsd = (detail.trade_volume_24h_btc || 0) * btcPrice

  const formattedDetail = {
    id: detail.id,
    name: detail.name || '未知交易所',
    logo: detail.image || '',
    rank: detail.trust_score_rank || '-',
    followers: detail.followers || 0,
    description: detail.description || '',
    officialUrl: detail.url || '#',
    twitter: detail.twitter_screen_name ? `https://twitter.com/${detail.twitter_screen_name}` : '',
    telegram: detail.telegram_screen_name ? `https://t.me/${detail.telegram_screen_name}` : '',
    region: detail.country || '-',
    tradingPairs: detail.number_of_markets || '-',
    apiEnabled: detail.has_trading_incentive || false,
    kyc: !!detail.kyc_level,
    volume24h: '$' + formatLargeNumber(volumeUsd),
    volumeBtc: detail.trade_volume_24h_btc || 0,
    volumeUsd
  }

  // 缓存
  exchangeDetailCache.value[exchangeId] = formattedDetail
  return formattedDetail
}

/**
 * 获取交易对列表（使用 CoinCap API + CORS代理）
 */
export async function fetchTradingPairs(exchangeId) {
  try {
    // 使用 allorigins CORS 代理
    const proxyUrl = 'https://api.allorigins.win/raw?url='
    const targetUrl = encodeURIComponent(`https://api.coincap.io/v2/exchanges/${exchangeId}/markets?limit=50`)
    
    const response = await fetchWithTimeout(
      `${proxyUrl}${targetUrl}`,
      { headers: { 'Accept': 'application/json' } }
    )

    if (!response.ok) {
      throw new Error(`获取交易对失败: ${response.status}`)
    }

    const data = await response.json()
    const markets = data.data
    
    if (!Array.isArray(markets)) {
      return []
    }

    return markets.slice(0, 20).map(m => ({
      symbol: `${m.baseSymbol || '-'}/${m.quoteSymbol || '-'}`,
      coinIcon: `https://assets.coincap.io/assets/icons/${(m.baseSymbol || '').toLowerCase()}@2x.png`,
      price: m.price ? `$${Number(m.price).toLocaleString()}` : '-',
      platformPrice: m.price ? `$${Number(m.price).toLocaleString()}` : '-',
      volume24h: m.volumeUsd ? formatLargeNumber(Number(m.volumeUsd)) : '-',
      volume24hCny: m.volumeUsd ? `¥${formatLargeNumber(Number(m.volumeUsd) * 7.2)}` : '-',
      percent: m.pricePercent ? m.pricePercent.toFixed(2) : '0.00',
      updateTime: new Date().toLocaleTimeString()
    }))

  } catch (err) {
    console.error('获取交易对失败:', err)
    return [] // 返回空数组而不是抛出异常
  }
}

/**
 * 翻译缓存
 */
const translationCache = new Map()

/**
 * 翻译函数（多引擎，带缓存、超时、错误处理）
 */
export async function translateToZh(text, cacheKey = null) {
  // 空文本处理
  if (!text || text.length === 0) return ''
  
  // 清理HTML实体和特殊字符
  const cleanText = text
    .replace(/<[^>]*>/g, '')  // 移除HTML标签
    .replace(/&[a-z]+;/gi, ' ') // 移除HTML实体
    .replace(/\s+/g, ' ')       // 合并空白
    .trim()
    .substring(0, 500)           // 限制长度
  
  if (!cleanText) return ''
  
  // 检查缓存
  const key = cacheKey || cleanText
  if (translationCache.has(key)) {
    return translationCache.get(key)
  }
  
  // 尝试多个翻译引擎
  const engines = [
    // MyMemory (免费但有限制)
    async () => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      try {
        const res = await fetch(
          `https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanText)}&langpair=en|zh`,
          { signal: controller.signal }
        )
        clearTimeout(timeoutId)
        if (!res.ok) return null
        const data = await res.json()
        return data.responseData?.translatedText || null
      } catch {
        clearTimeout(timeoutId)
        return null
      }
    },
    // LibreTranslate (免费开源)
    async () => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      try {
        const res = await fetch(
          'https://libretranslate.com/translate',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              q: cleanText,
              source: 'en',
              target: 'zh'
            }),
            signal: controller.signal
          }
        )
        clearTimeout(timeoutId)
        if (!res.ok) return null
        const data = await res.json()
        return data.translatedText || null
      } catch {
        clearTimeout(timeoutId)
        return null
      }
    }
  ]
  
  // 尝试各个翻译引擎
  for (const engine of engines) {
    try {
      const result = await engine()
      if (result && !result.includes('<') && result.length > 0 && result !== cleanText) {
        translationCache.set(key, result)
        console.log('[翻译成功]', result.substring(0, 30))
        return result
      }
    } catch (err) {
      console.warn('[翻译引擎失败]', err.message)
    }
  }
  
  // 所有引擎都失败，返回原文
  console.warn('[翻译失败] 使用原文')
  return cleanText
}

/**
 * 清理翻译缓存
 */
export function clearTranslationCache() {
  translationCache.clear()
}

// 交易所描述缓存
const exchangeDescCache = new Map()

/**
 * 从 CoinGecko 获取描述
 */
async function fetchFromCoinGecko(exchangeId) {
  try {
    const response = await fetchWithTimeout(
      `https://api.coingecko.com/api/v3/exchanges/${exchangeId}`,
      {
        headers: {
          'Accept': 'application/json',
          'x-cg-demo-api-key': API_KEY
        }
      }
    )
    
    if (response.ok) {
      const data = await response.json()
      if (data.description && data.description.length > 20) {
        return data.description
      }
    }
  } catch (err) {
    console.warn('CoinGecko 获取描述失败:', err.message)
  }
  return ''
}

/**
 * 获取交易所描述（多来源优先级 + 预设描述）
 */
export async function fetchExchangeDescription(exchangeId) {
  console.log('[Exchange] 开始获取描述:', exchangeId)
  
  // 检查缓存
  if (exchangeDescCache.has(exchangeId)) {
    console.log('[Exchange] 从缓存获取描述')
    return exchangeDescCache.get(exchangeId)
  }
  
  let description = ''
  
  // 1. 优先从 CoinGecko 获取
  console.log('[Exchange] 尝试 CoinGecko...')
  description = await fetchFromCoinGecko(exchangeId)
  console.log('[Exchange] CoinGecko 结果:', description ? description.substring(0, 50) + '...' : '无')
  
  // 2. 如果没有，使用预设描述
  if (!description) {
    console.log('[Exchange] 使用预设描述...')
    description = getPresetDescription(exchangeId)
    console.log('[Exchange] 预设描述:', description ? description.substring(0, 50) + '...' : '无')
  } else {
    // 如果获取到的是英文描述，尝试翻译
    const translated = translateCommonDescription(description)
    if (translated) {
      description = translated
      console.log('[Exchange] 英文描述已翻译:', description)
    }
  }
  
  // 缓存结果
  if (description) {
    exchangeDescCache.set(exchangeId, description)
    console.log('[Exchange] 描述已缓存')
  } else {
    console.log('[Exchange] 所有来源均无描述')
  }
  
  return description
}

/**
 * 清除交易所描述缓存
 */
export function clearExchangeDescCache() {
  exchangeDescCache.clear()
}

// 预设交易所完整信息（名称+描述）
const EXCHANGE_INFO_ZH = {
  binance: { name: '币安', desc: '全球最大加密货币交易所，支持币币、合约、法币交易' },
  okx: { name: 'OKX交易所', desc: '全球领先的加密货币交易所，现货、合约、期权交易' },
  huobi: { name: '火必', desc: '全球知名加密货币交易所，提供全面数字资产交易服务' },
  kraken: { name: 'Kraken', desc: '美国头部加密货币交易所，以安全性和合规性著称' },
  kucoin: { name: '库币', desc: '全球性加密货币交易所，支持多种数字资产交易' },
  gateio: { name: '芝麻开门', desc: '全球加密货币交易平台，提供现货和合约交易' },
  bitfinex: { name: 'Bitfinex', desc: '历史悠久的加密货币交易所，提供高级交易服务' },
  coinbase: { name: 'Coinbase', desc: '美国最大加密货币交易所，纳斯达克上市企业' },
  bitstamp: { name: 'Bitstamp', desc: '欧洲最古老的加密货币交易所之一' },
  mexc: { name: 'MEXC', desc: '全球加密货币交易所，专注现货和合约交易' },
  bitget: { name: 'Bitget', desc: '全球领先的合约跟单交易所' },
  bybit: { name: 'Bybit', desc: '全球加密货币交易所，专注衍生品交易' },
  deribit: { name: 'Deribit', desc: '加密货币衍生品交易所，专注期权合约' },
  cryptocom: { name: 'Crypto.com', desc: '全球加密货币平台，提供交易、支付服务' },
  lbank: { name: 'LBank', desc: '全球加密货币交易平台' },
  poloniex: { name: 'Poloniex', desc: '加密货币交易所，提供多种代币交易' },
  upbit: { name: 'Upbit', desc: '韩国头部加密货币交易所' },
  bithumb: { name: 'Bithumb', desc: '韩国知名加密货币交易所' },
  coinone: { name: 'Coinone', desc: '韩国加密货币交易所' },
  korbit: { name: 'Korbit', desc: '韩国早期加密货币交易所' },
  bitflyer: { name: 'BitFlyer', desc: '日本合规加密货币交易所' },
  liquid: { name: 'Liquid', desc: '全球加密货币交易平台' },
  coinsbit: { name: 'Coinsbit', desc: '加密货币交易平台' },
  probit: { name: 'ProBit', desc: '全球加密货币交易所' },
  exmo: { name: 'EXMO', desc: '欧洲加密货币交易所' },
  bittrex: { name: 'Bittrex', desc: '美国加密货币交易所，以安全性著称' },
  coinexchange: { name: 'CoinExchange', desc: '专注于加密货币交易的平台' }
}

/**
 * 获取交易所中文名称
 */
export function getExchangeNameZh(exchangeId) {
  if (!exchangeId) return ''
  const id = exchangeId.toLowerCase()
  return EXCHANGE_INFO_ZH[id]?.name || ''
}

/**
 * 获取交易所中文描述（用于列表页展示）
 */
export function getExchangeDescZh(exchangeId) {
  if (!exchangeId) return ''
  const id = exchangeId.toLowerCase()
  return EXCHANGE_INFO_ZH[id]?.desc || ''
}

/**
 * 获取交易所完整中文信息
 */
export function getExchangeInfoZh(exchangeId) {
  if (!exchangeId) return { name: '', desc: '' }
  const id = exchangeId.toLowerCase()
  return EXCHANGE_INFO_ZH[id] || { name: '', desc: '' }
}

// 预设交易所描述（当API无数据时使用）
const EXCHANGE_DESCRIPTIONS = {
  binance: '币安（Binance）是全球最大的加密货币交易所之一，提供币币交易、合约交易、法币交易等服务，拥有超过1.5亿用户。',
  okx: 'OKX是一家全球领先的加密货币交易所，提供现货交易、合约交易、期权交易等多种加密资产服务。',
  huobi: '火必（HTX）是全球知名的加密货币交易所，提供全面的数字资产交易服务。',
  coinexchange: 'CoinExchange是一家专注于加密货币交易的平台。',
  kraken: 'Kraken是美国的加密货币交易所，以安全性和合规性著称。',
  kucoin: 'KuCoin是一家全球性的加密货币交易所，提供多种数字资产的交易服务。',
  gateio: 'Gate.io是一家提供加密货币交易的全球平台。',
  bitfinex: 'Bitfinex是历史悠久的加密货币交易所之一。',
  coinbase: 'Coinbase是美国最大的加密货币交易所，在纳斯达克上市。',
  bitstamp: 'Bitstamp是欧洲最古老的加密货币交易所之一。'
}

// 常见英文描述的翻译映射
const DESCRIPTION_TRANSLATIONS = {
  "one of the world's largest cryptocurrency exchange": '全球最大的加密货币交易所之一',
  "a secure bitcoin trading platform": '安全的比特币交易平台',
  "leading cryptocurrency exchange": '领先的加密货币交易所',
  "global cryptocurrency exchange": '全球加密货币交易所',
  "professional cryptocurrency exchange": '专业加密货币交易所',
  "trusted cryptocurrency exchange": '可信赖的加密货币交易所'
}

/**
 * 翻译常见英文描述
 */
function translateCommonDescription(text) {
  if (!text) return ''
  const lower = text.toLowerCase().trim()
  for (const [en, zh] of Object.entries(DESCRIPTION_TRANSLATIONS)) {
    if (lower.includes(en) || en.includes(lower)) {
      return zh
    }
  }
  return ''
}

/**
 * 获取预设交易所描述
 */
export function getPresetDescription(exchangeId) {
  const id = exchangeId?.toLowerCase()
  return EXCHANGE_DESCRIPTIONS[id] || ''
}

/**
 * 格式化大数字
 */
function formatLargeNumber(num) {
  if (!num && num !== 0) return '-'
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B'
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M'
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K'
  return num.toFixed(2)
}

// 导出状态
export { exchanges, exchangeDetailCache, loading, error }

// 导航时传递数据（替代history.state，更可靠）
const navigationData = ref(null)

export function setNavigationExchange(exchange) {
  navigationData.value = exchange
}

export function getNavigationExchange() {
  const data = navigationData.value
  navigationData.value = null
  return data
}
