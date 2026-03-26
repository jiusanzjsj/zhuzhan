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
 * 获取交易所描述（仅从本地获取，不调用API）
 */
export async function fetchExchangeDescription(exchangeId) {
  // 检查缓存
  if (exchangeDescCache.has(exchangeId)) {
    return exchangeDescCache.get(exchangeId)
  }
  
  // 直接从本地获取
  const description = getPresetDescription(exchangeId)
  
  // 缓存结果
  if (description) {
    exchangeDescCache.set(exchangeId, description)
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

// 预设交易所描述（本地写死，不从API获取）
const EXCHANGE_DESCRIPTIONS = {
  binance: '币安(Binance)，国际领先的区块链数字资产国际站，向全球提供广泛的数字货币交易、区块链教育、区块链项目孵化、区块链资产发行平台、区块链研究院以及区块链公益慈善等服务，目前用户覆盖全球180多个国家和地区，以140万单/秒的核心内存撮合技术，是全球加密货币交易速度最快的平台之一，也是全球加密货币交易量最大的平台之一。 币安始终坚持将用户利益放在第一位，致力于提供安全、公平、开放、高效的区块链数字资产交易环境。同时以区块链为核心，建立全方位的区块链生态系统，Binance将和Binance用户一起开创新的区块链世界，共同创造历史。',
  bybit: 'Bybit成立于2018年3月，注册在英属维京群岛。是一家全球性的数字资产衍生品交易服务平台。用户遍布全球200多个国家，覆盖北美、欧洲、亚太等地区，为个人用户及专业机构提供专业的数字资产衍生品交易服务。 Bybit通过数字资产与传统金融的结合，引领数字资产的生态发展。提供一流的流动性，致力于打造业内最安全、公平、高效及人性化的交易服务平台。',
  gate_io: 'Gate.io 成⽴于2013年，是全球领先的加密货币交易所，拥有2200万⽤⼾，币种交易量与流动性⻓期 稳居全球前三。Gate.io ⽬前24⼩时现货交易量排名全球第⼆，⽀持超过3800种加密货币的现货交易、 期货合约、杠杆交易及理财产品。平台提供多样化的数字资产交易及区块链应⽤相关服务，平台总储 备⾦超过 100 亿美元，位列全球第四，总储备⾦率⾼达 128.58%，并采⽤零知识技术以确保⽤⼾资产 的100%可验证性。 2025年，Gate.io正式启动品牌升级，中⽂名称焕新为"⼤⻔"，寓意信任、安全与未来的⼊⼝。此次 升级全⽅位涵盖平台的技术、服务与未来发展战略⽅向，Gate.io将始终以⽤⼾为核⼼，推动技术⾰新 与⽣态建设，与⽤⼾携⼿迈向加密领域的全新未来。',
  coinbase: 'Coinbase Pro总部设立在美国，为用户提供安全的平台，方便用户进行各种数字资产投资。Coinbase Pro平台界面简洁易用，包括实时订单查询、图表工具、交易历史记录和简单的订单流程。',
  okx: '欧易OKX是全球领先的加密生态建设者，成立于2017.5.31。拥有全球顶尖的加密资产交易平台、Web3.0入口-Web3 Wallet及旨在为下一代 Web3 应用提供安全可编程的智能合约平台的OKC，创立了统一交易账户等全球领先的Crypto交易系统。 欧易OKX面向全球用户提供比特币、以太坊等多种加密数字资产的现货、衍生品交易及金融产品等服务，帮助用户方便快捷地管理和投资加密数字资产；Web3 Wallet提供多链None-custody钱包、NFT市场、DEX、DApps等产品；OKC作为欧易的自研公链，生态建设也初露头角，能够满足用户多种加密数字资产业务需求。后续欧易OKX将持续向元宇宙、Web3.0、DeFi、GameFi等领域进发，欧易Blockdream Ventures已在全球投资了数百个区块链项目，推动加密经济的繁荣。 目前欧易OKX在全球拥有超2000万用户体量，覆盖超过200个国家和地区；全球拥有美国、马耳他、迪拜等8个地区办公室，员工达2200人；年营收突破10亿美元，累计交易量突破10万亿美元。',
  kraken: '总部位于旧金山的Kraken成立于2011年，是欧元交易量最大的比特币国际站，也可用加拿大元、美元、英镑和日元交易。Kraken一直被独立新闻媒体评为最佳和最安全的比特币国际站。Kraken是第一个在彭博终端上显示交易价格和交易量的比特币国际站，第一个通过了加密验证的外汇储备审计，是第一家加密货币银行的合伙人。 2014年3月获300万美元天使轮融资，主要投资者为蜂鸟风险投资公司（Hummingbird Ventures）。目前，Kraken已跻身美国最活跃的数字货币国际站阵列，根据Bitcoin Charts目前的数据显示，Kraken平台的日成交量为4,579 BTC，这一数据超过了竞争对手ANX以及BTC-e。 优点： 交易费合理 提款费较低 全球化程度高 缺点： 支付手段有限 不适合新手',
  bitget: 'Bitget 成立于2018年，是世界领先的加密货币交易所和 Web 3 公司。目前，Bitget 为全球200多个国家和地区提供服务，Bitget生态全球用户数已突破1亿，日均交易量达到 100亿美元，成为全球交易量排名第四的加密货币交易所。 Bitget 携手西班牙足球甲级联赛(LALIGA)、阿根廷传奇足球运动员梅西和电竞赛事官方组 织 PGL 等可靠合作伙伴，鼓励人们拥抱加密货币。',
  mexc: 'MEXC中文名抹茶交易所成功打造了数字资产一站式交易服务，能够同时向用户提供包括现货、杠杆、ETF、合约在内的交易服务。安全方面，MEXC组建了业内顶尖的技术团队，同时与多家业内顶尖安全机构开展深度合作，保障用户资产安全。',
  kucoin: 'KuCoin是全球知名的数字货币交易服务平台，KuCoin支持多种数字资产交易。成立于2017年9月，已成长为最受欢迎的数字货币交易服务平台之一，目前为全球207个国家和地区的500万用户提供币币，法币、合约、Pool-X、借贷等一站式服务。以"全民的交易服务平台"著称，KuCoin的运营地为塞舌尔，为用户提供多语言、7X24小时客服团队，同时，KuCoin在韩国、日本、西班牙、意大利、越南、土耳其、俄罗斯、印度等地建立了本地化社群，为各地用户提供最本地化的服务。2018年11月，KuCoin获得来自IDG资本和经纬创投的2000万美元A轮融资。',
  crypto_com: 'Crypto.com最初于2016年6月在香港成立，3年后推出Crypto.com交易所。现在总部设在新加坡，该平台在90多个国家拥有超过5000万客户，包括欧洲、美国、加拿大、俄罗斯、澳大利亚、拉丁美洲和一些亚洲国家。 该公司为客户提供以下产品：移动应用程序、Crypto.com Visa卡、移动钱包、Crypto.com Earn、Crypto.com Pay、Crypto.com NFT、Crypto.com Credit。集中式交易所（CEX）提供现货交易、保证金交易和衍生品交易。Crypto.com还提供DeFi产品，如DeFi钱包和Crypto.org链上由其原生代币Cronos（CRO）驱动的生态系统。'
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
