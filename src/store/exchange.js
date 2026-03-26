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
      `https://api.coingecko.com/api/v3/exchanges?per_page=20&page=1`,
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
 * 获取交易对列表
 */
export async function fetchTradingPairs(exchangeId) {
  try {
    const response = await fetchWithTimeout(
      `https://api.coingecko.com/api/v3/exchanges/${exchangeId}/markets?per_page=50&page=1&sparkline=false`,
      {
        headers: {
          'Accept': 'application/json',
          'x-cg-demo-api-key': API_KEY
        }
      }
    )

    if (!response.ok) {
      throw new Error(`获取交易对失败: ${response.status}`)
    }

    const markets = await response.json()
    
    if (!Array.isArray(markets)) {
      return []
    }

    return markets.slice(0, 20).map(m => ({
      symbol: m.symbol?.toUpperCase() || '-',
      coinIcon: m.image || '',
      price: m.current_price ? `$${m.current_price.toLocaleString()}` : '-',
      platformPrice: m.current_price ? `$${m.current_price.toLocaleString()}` : '-',
      volume24h: formatLargeNumber(m.total_volume),
      volume24hCny: `¥${formatLargeNumber((m.total_volume || 0) * 7.2)}`,
      percent: m.price_change_percentage_24h ? m.price_change_percentage_24h.toFixed(2) : '0.00',
      updateTime: new Date().toLocaleTimeString()
    }))

  } catch (err) {
    console.error('获取交易对失败:', err)
    return [] // 返回空数组而不是抛出异常
  }
}

/**
 * 翻译函数（失败时返回原文）
 */
export async function translateToZh(text) {
  if (!text || text.length === 0) return '暂无描述'
  
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.substring(0, 500))}&langpair=en|zh`,
      { signal: controller.signal }
    )
    
    clearTimeout(timeoutId)
    
    if (!res.ok) throw new Error('翻译API错误')
    
    const data = await res.json()
    return data.responseData?.translatedText || text
    
  } catch (err) {
    console.error('翻译失败:', err)
    return text // 失败时返回原文
  }
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
