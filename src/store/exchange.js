/**
 * 交易所数据状态管理
 * 确保数据获取的前提下进行速率优化
 */

import { ref } from 'vue'
import { apiCache } from '../utils/apiCache'

// 交易所描述数据（直接内联，不从外部文件读取）
const EXCHANGE_DESCRIPTIONS = {
    binance:'币安(Binance)，国际领先的区块链数字资产国际站，向全球提供广泛的数字货币交易、区块链教育、区块链项目孵化、区块链资产发行平台、区块链研究院以及区块链公益慈善等服务，目前用户覆盖全球180多个国家和地区，以140万单/秒的核心内存撮合技术，是全球加密货币交易速度最快的平台之一，也是全球加密货币交易量最大的平台之一。 币安始终坚持将用户利益放在第一位，致力于提供安全、公平、开放、高效的区块链数字资产交易环境。同时以区块链为核心，建立全方位的区块链生态系统，Binance将和Binance用户一起开创新的区块链世界，共同创造历史。',
	bybitspot:'Bybit成立于2018年3月，注册在英属维京群岛。是一家全球性的数字资产衍生品交易服务平台。用户遍布全球200多个国家，覆盖北美、欧洲、亚太等地区，为个人用户及专业机构提供专业的数字资产衍生品交易服务。 Bybit通过数字资产与传统金融的结合，引领数字资产的生态发展。提供一流的流动性，致力于打造业内最安全、公平、高效及人性化的交易服务平台。',
	gateio:'Gate.io 成⽴于2013年，是全球领先的加密货币交易所，拥有2200万⽤⼾，币种交易量与流动性⻓期 稳居全球前三。Gate.io ⽬前24⼩时现货交易量排名全球第⼆，⽀持超过3800种加密货币的现货交易、 期货合约、杠杆交易及理财产品。平台提供多样化的数字资产交易及区块链应⽤相关服务，平台总储 备⾦超过 100 亿美元，位列全球第四，总储备⾦率⾼达 128.58%，并采⽤零知识技术以确保⽤⼾资产 的100%可验证性。 2025年，Gate.io正式启动品牌升级，中⽂名称焕新为“⼤⻔”，寓意信任、安全与未来的⼊⼝。此次 升级全⽅位涵盖平台的技术、服务与未来发展战略⽅向，Gate.io将始终以⽤⼾为核⼼，推动技术⾰新 与⽣态建设，与⽤⼾携⼿迈向加密领域的全新未来。',
	okex:'欧易OKX是全球领先的加密生态建设者，成立于2017.5.31。拥有全球顶尖的加密资产交易平台、Web3.0入口-Web3 Wallet及旨在为下一代 Web3 应用提供安全可编程的智能合约平台的OKC，创立了统一交易账户等全球领先的Crypto交易系统。 欧易OKX面向全球用户提供比特币、以太坊等多种加密数字资产的现货、衍生品交易及金融产品等服务，帮助用户方便快捷地管理和投资加密数字资产；Web3 Wallet提供多链None-custody钱包、NFT市场、DEX、DApps等产品；OKC作为欧易的自研公链，生态建设也初露头角，能够满足用户多种加密数字资产业务需求。后续欧易OKX将持续向元宇宙、Web3.0、DeFi、GameFi等领域进发，欧易Blockdream Ventures已在全球投资了数百个区块链项目，推动加密经济的繁荣。 目前欧易OKX在全球拥有超2000万用户体量，覆盖超过200个国家和地区；全球拥有美国、马耳他、迪拜等8个地区办公室，员工达2200人；年营收突破10亿美元，累计交易量突破10万亿美元。',
	bitget:'Bitget 成立于2018年，是世界领先的加密货币交易所和 Web 3 公司。目前，Bitget 为全球200多个国家和地区提供服务，Bitget生态全球用户数已突破1亿，日均交易量达到 100亿美元，成为全球交易量排名第四的加密货币交易所。 Bitget 携手西班牙足球甲级联赛(LALIGA)、阿根廷传奇足球运动员梅西和电竞赛事官方组 织 PGL 等可靠合作伙伴，鼓励人们拥抱加密货币。',
	htx:'火币HTX是一个全面的区块链业务生态系统，涵盖数字资产交易、金融衍生品、钱包、研究、投资、孵化和其他业务。火币HTX服务于全球超过160个国家，服务对象包括机构、做市商、经纪商和个人用户。平台支持700+种优质数字资产的现货和衍生品交易服务，每天的交易量达40亿美元，累计注册用户数4,500万+。平台的业务包括现货、合约、杠杆、理财、托管、交易机器人等，且拥有多个全年无休的客服支持渠道，让客户享受一流的专业服务。 火币HTX的愿景是“让全世界八十亿人实现金融自由”。作为全球领先的Web3.0门户，火币HTX秉承全球扩张、生态繁荣、财富效应、安全合规的发展战略，为世界虚拟货币爱好者提供全面、安全、可靠的价值与服务。 火币HTX的前身Huobi Global由李林 (Leon Li) 于 2013 年在北京创办。李林于2013年毕业于清华大学的自动化专业。在创办Huobi Global前，李林在美国最大的级软件公司之一——甲骨文担任计算机工程师。 2022年9月，Huobi Global进行品牌升级，更名为火币HTX。火币HTX全球顾问委员会指导火币HTX的战略布局与发展，其成员包括波场TRON创始人孙宇晨、百域资本创始人、原景林资产创始合伙人Ted Chen、火币HTX联合创始人杜均、Valkyrie投资联合创始人、比特币首批ETF创始人Leah Wald等。 火币HTX位于何处？ 该公司总部位于巴拿马，并在全球多地设有办事处。 以下司法管辖区的用户禁止使用所有服务： 中国大陆 、美国、古巴、伊朗、朝鲜、苏丹、叙利亚、委内瑞拉、中国香港和新加坡。 以下司法管辖区的用户禁止进行衍生品交易：中国台湾、以色列、伊拉克、孟加拉国、玻利维亚、厄瓜多尔、吉尔吉斯斯坦、塞瓦斯托波尔、西班牙、英国（仅限零售用户）和新西兰。 火币HTX 可支持哪些币种？ 火币HTX支持700种以上数字资产与加密货币，包括最热门的BTC、DOGE、ETH、LTC、XMR、HTX、USDT等。 火币HTX的手续费如何？ 火币HTX手续费具有等级架构，交易费用视用户等级而定。平台基本挂单吃单费用为0.2%，用户可使用HTX或TRX抵扣手续费。 火币HTX上可使用杠杆或保证金交易吗？ 火币HTX可针对多种加密货币使用保证金交易，让用户借用资金进行最多5倍杠杆的全仓模式保证金交易。其利率按小时计算。 用户可以使用最高200倍杠杆，进行BTC和ETH等加密期货合约交易。',
	huobi:'火币HTX是全球领先的加密货币交易所，成立于2013年，服务全球超过160个国家，提供700+种数字资产的现货和衍生品交易。'
	
}

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
      `https://api.coingecko.com/api/v3/exchanges?per_page=15&page=1`,
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

  // 处理交易对（从 tickers 字段获取）
  const tickers = detail.tickers || []
  const tradingPairsList = tickers.slice(0, 20).map((t) => {
    const base = t.base || '-'
    const target = t.target || '-'
    const lastPrice = t.last || 0
    const volume = t.volume || 0
    const converted = t.converted_last || {}
    const priceUsd = converted.usd || lastPrice
    const coinMcap = t.coin_mcap_usd || 0
    
    return {
      symbol: `${base}/${target}`,
      coinIcon: '',
      price: `$${lastPrice.toLocaleString()}`,
      platformPrice: priceUsd ? `$${priceUsd.toLocaleString()}` : '-',
      volume24h: volume ? formatLargeNumber(volume) : '-',
      marketCap: coinMcap ? `$${formatLargeNumber(coinMcap)}` : '-',
      percent: '0.00',
      updateTime: new Date().toLocaleTimeString()
    }
  })

  // 交易所官网链接映射（优先使用硬编码的推广链接）
  const EXCHANGE_URL_OVERRIDE = {
    binance: 'https://accounts.bmwweb.solutions/zh-CN/register?return_to=aHR0cHM6Ly93d3cuYm13d2ViLnNvbHV0aW9ucy96aC1DTi9qb2luP3JlZj1KTkpOSk4&ref=JNJNJN',
    okex: 'https://www.xqmnobxky.com/join/JNJNJN',
    bitget: 'https://www.hdmune.cn/zh-CN/expressly?channelCode=jfsg&vipCode=JN007&languageType=1&groupId=651147'
  }

  const formattedDetail = {
    id: detail.id,
    name: detail.name || '未知交易所',
    logo: detail.image || '',
    rank: detail.trust_score_rank || '-',
    followers: detail.followers || 0,
    description: detail.description || '',
    officialUrl: EXCHANGE_URL_OVERRIDE[exchangeId] || detail.url || '#',
    twitter: detail.twitter_screen_name ? `https://twitter.com/${detail.twitter_screen_name}` : '',
    telegram: detail.telegram_screen_name ? `https://t.me/${detail.telegram_screen_name}` : '',
    region: detail.country || '-',
    tradingPairs: detail.number_of_markets || '-',
    apiEnabled: detail.has_trading_incentive || false,
    kyc: !!detail.kyc_level,
    volume24h: '$' + formatLargeNumber(volumeUsd),
    volumeBtc: detail.trade_volume_24h_btc || 0,
    volumeUsd,
    tradingPairsList  // 同时返回交易对列表
  }

  // 缓存
  exchangeDetailCache.value[exchangeId] = formattedDetail
  return formattedDetail
}

// 预设交易所完整信息（名称+描述）
const EXCHANGE_INFO_ZH = {
  binance: { name: '币安', desc: '全球最大加密货币交易所，支持币币、合约、法币交易' },
  okex: { name: 'OKX', desc: '全球领先的加密货币交易所，现货、合约、期权交易' },
  huobi: { name: '火币', desc: '全球知名加密货币交易所，提供全面数字资产交易服务' },
  
  gateio: { name: '芝麻', desc: '全球加密货币交易平台，提供现货和合约交易' },
  
 
  bitget: { name: 'Bitget', desc: '全球领先的合约跟单交易所' },
  bybitspot: { name: 'Bybit', desc: '全球加密货币交易所，专注衍生品交易' },
  
  htx: { name: '火币HTX', desc: '全球领先加密货币交易所' }
 
}

/**
 * CoinGecko 返回的 ID 与本地 key 的映射表
 * key: CoinGecko 返回的原始 ID（normalize 后）
 * value: 本地 EXCHANGE_INFO_ZH / EXCHANGE_DESCRIPTIONS 中的标准 key
 */
const COINGECKO_ID_MAP = {
  // CoinGecko 原始 ID → store key 映射（针对 store key 与 CoinGecko ID 不一致的情况）
  // EXCHANGE_INFO_ZH / EXCHANGE_DESCRIPTIONS 中实际使用的 key
  'okx': 'okex',
  'bybit': 'bybitspot',
  'bybits': 'bybitspot',
  'bybit-spot': 'bybitspot',
  'coinbase': 'gdax',
  'mexc': 'mxc',
  'gdax': 'gdax',
  'coinbase-exchange': 'gdax',
  // 名称不一致的交易所 ID 映射
  gate: 'gateio',
  'coinbase exchange': 'gdax',
  'crypto.com': 'crypto_com',
  'cryptocom': 'crypto_com',
  'crypto_com': 'crypto_com',
  'crypto-com': 'crypto_com',
  htx: 'huobi',
  huobi: 'huobi',
  'binance-us': 'binance',
  'binance-pegged': 'binance',
  'crypto-com-exchange': 'crypto_com',
  'lbank-info': 'lbank',
  'bullish': 'bullishcom',
  'bullish-exchange': 'bullishcom',
  'block-one': 'bullishcom',
  'blockone': 'bullishcom',
  'bingx': 'bingx',
  'bing-x': 'bingx',
}

/**
 * 标准化交易所 ID
 * 1. 直接匹配
 * 2. 通过 COINGECKO_ID_MAP 映射
 * 3. 去除下划线后匹配（gate_io → gateio）
 * 4. 名称反向模糊匹配（兜底）
 * @param {string} exchangeId - CoinGecko 返回的交易所 ID
 * @param {object} localMap - 本地数据映射表
 * @returns {string} - 匹配到的 key 或 ''
 */
function normalizeExchangeId(exchangeId, localMap) {
  if (!exchangeId || typeof exchangeId !== 'string') return ''
  const raw = exchangeId.toLowerCase().trim().replace(/\s+/g, '-').replace(/_/g, '')
  if (!raw) return ''

  // 1. 直接匹配
  if (localMap[raw]) return raw

  // 2. 通过映射表匹配
  const mapped = COINGECKO_ID_MAP[raw]
  if (mapped && localMap[mapped]) return mapped

  // 3. 去除下划线后匹配
  const noExtra = raw.replace(/_/g, '')
  const found = Object.keys(localMap).find(k => k.replace(/_/g, '').replace(/\s+/g, '-') === noExtra)
  if (found) return found

  // 4. 名称反向模糊匹配（兜底）
  const reverseMatch = Object.entries(localMap).find(([k, v]) => {
    const nameField = (v.name || v.desc || k).replace(/[_\s\.]+/g, '')
    return nameField.includes(noExtra) || noExtra.includes(nameField)
  })
  if (reverseMatch) return reverseMatch[0]

  return ''
}

/**
 * 获取交易所中文名称
 */
export function getExchangeNameZh(exchangeId) {
  if (!exchangeId || typeof exchangeId !== 'string') return ''
  const key = normalizeExchangeId(exchangeId, EXCHANGE_INFO_ZH)
  if (!key) return ''
  const info = EXCHANGE_INFO_ZH[key]
  return (info && info.name && typeof info.name === 'string') ? info.name : ''
}

/**
 * 获取交易所中文描述（用于列表页展示）
 */
export function getExchangeDescZh(exchangeId) {
  if (!exchangeId || typeof exchangeId !== 'string') return ''
  const key = normalizeExchangeId(exchangeId, EXCHANGE_INFO_ZH)
  if (!key) return ''
  const info = EXCHANGE_INFO_ZH[key]
  return (info && info.desc && typeof info.desc === 'string') ? info.desc : ''
}

/**
 * 获取交易所完整中文信息
 */
export function getExchangeInfoZh(exchangeId) {
  if (!exchangeId || typeof exchangeId !== 'string') return ''
  const key = normalizeExchangeId(exchangeId, EXCHANGE_INFO_ZH)
  if (!key) return { name: '', desc: '' }
  return EXCHANGE_INFO_ZH[key] || { name: '', desc: '' }
}

/**
 * 获取预设交易所描述（按小写交易所ID匹配）
 */
export function getPresetDescription(exchangeId) {
  if (!exchangeId || typeof exchangeId !== 'string') return ''
  const key = normalizeExchangeId(exchangeId, EXCHANGE_DESCRIPTIONS)
  if (!key) return ''
  const desc = EXCHANGE_DESCRIPTIONS[key]
  return (desc && typeof desc === 'string' && desc.length > 0) ? desc : ''
}

/**
 * 国家代码转中文名称
 */
const countryToZh = {
  'CN': '中国', 'US': '美国', 'HK': '中国香港', 'TW': '中国台湾',
  'JP': '日本', 'KR': '韩国', 'SG': '新加坡', 'VN': '越南',
  'TH': '泰国', 'MY': '马来西亚', 'IN': '印度', 'ID': '印度尼西亚',
  'PH': '菲律宾', 'AU': '澳大利亚', 'NZ': '新西兰',
  'CA': '加拿大', 'MX': '墨西哥', 'BR': '巴西', 'AR': '阿根廷',
  'CL': '智利', 'VE': '委内瑞拉', 'CO': '哥伦比亚', 'PE': '秘鲁',
  'GB': '英国', 'DE': '德国', 'FR': '法国', 'IT': '意大利',
  'ES': '西班牙', 'NL': '荷兰', 'SE': '瑞典', 'CH': '瑞士',
  'PL': '波兰', 'RU': '俄罗斯', 'UA': '乌克兰', 'TR': '土耳其',
  'CY': '塞浦路斯', 'AE': '阿联酋', 'IL': '以色列', 'SA': '沙特阿拉伯',
  'KE': '肯尼亚', 'NG': '尼日利亚', 'ZA': '南非', 'EG': '埃及',
  'KY': '开曼群岛', 'BS': '巴哈马', 'PA': '巴拿马', 'VG': '英属维尔京群岛',
  'SC': '塞舌尔', 'MT': '马耳他', 'LU': '卢森堡', 'EE': '爱沙尼亚',
  'BM': '百慕大', 'GG': '根西岛', 'JE': '泽西岛', 'AD': '安道尔',
  'GI': '直布罗陀', 'LI': '列支敦士登', 'MC': '摩纳哥', 'SM': '圣马力诺'
}

export function getCountryZh(countryCode) {
  if (!countryCode || typeof countryCode !== 'string') return '-'
  const code = countryCode.toUpperCase().trim()
  if (!code) return '-'
  return countryToZh[code] || countryCode
}

/**
 * 交易所 ID → 本地预设国家/地区（优先于 API 数据）
 * 格式：exchangeId（小写）: '中文国家/地区名'
 */
const EXCHANGE_COUNTRY_ZH = {
  binance: '马耳他',
  bybitspot: '英属维尔京群岛',
  gateio: '开曼群岛',
  gdax: '美国',
  okex: '马耳他',
  kraken: '美国',
  bitget: '塞舌尔',
  mxc: '塞舌尔',
  kucoin: '塞舌尔',
  cryptocom: '马耳他',
  bitfinex: '英属维尔京群岛',
  upbit: '韩国',
  htx: '巴拿马',
  deribit: '荷兰',
  gemini: '美国',
  bithumb: '韩国',
  deepcoin: '塞舌尔',
  biking: '新加坡',
  bittap: '塞舌尔',
  hyperliquid: '美国',
  bitflyer: '日本',
  bitstamp: '卢森堡',
  bittrex: '美国',
  coinexchange: '英国',
  coinone: '韩国',
  coinsbit: '爱沙尼亚',
  exmo: '英国',
  huobi: '塞舌尔',
  korbit: '韩国',
  lbank: '中国香港',
  liquid: '日本',
  poloniex: '塞舌尔',
  probit: '韩国',
  bullishcom: '英属维尔京群岛',
  bingx: '新加坡',
}

export function getExchangeCountryZh(exchangeId) {
  if (!exchangeId || typeof exchangeId !== 'string') return ''
  const key = normalizeExchangeId(exchangeId, EXCHANGE_COUNTRY_ZH)
  if (!key) return ''
  const country = EXCHANGE_COUNTRY_ZH[key]
  return (country && typeof country === 'string') ? country : ''
}

/**
 * 交易所类型映射（交易所ID → 类型描述）
 */
const EXCHANGE_TYPE_ZH = {
  binance: '法币、期货、场外、现货',
  bybitspot: '期货、现货',
  gateio: '期货、场外、现货',
  gdax: '法币、现货',
  okex: '法币、期货、期权、现货',
  kraken: '法币、期货、现货',
  bitget: '合约、现货',
  mxc: '现货、ETF、合约',
  kucoin: '法币、期货、现货',
  cryptocom: '法币、期货、现货',
  crypto_com: '法币、期货、现货',
  bitfinex: '法币、现货',
  upbit: '法币、现货',
  htx: '法币、期货、现货',
  deribit: '期权、期货',
  gemini: '法币、现货',
  bithumb: '法币、现货',
  deepcoin: '合约、现货',
  biking: '合约、现货',
  bittap: '合约、现货',
  hyperliquid: 'DEX、现货',
  bitflyer: '法币、现货',
  bitstamp: '法币、现货',
  bittrex: '法币、现货',
  coinexchange: '现货',
  coinone: '法币、现货',
  coinsbit: '现货',
  exmo: '法币、现货',
  huobi: '法币、期货、现货',
  korbit: '法币、现货',
  lbank: '法币、现货',
  liquid: '法币、现货',
  poloniex: '现货',
  probit: '法币、现货',
  bullishcom: 'DEX、现货',
  bingx: '合约、现货',
}

export function getExchangeTypeZh(exchangeId) {
  if (!exchangeId || typeof exchangeId !== 'string') return ''
  // 使用 normalizeExchangeId 的完整匹配流程（与 getExchangeNameZh 一致）
  const key = normalizeExchangeId(exchangeId, EXCHANGE_TYPE_ZH)
  if (!key) return ''
  const type = EXCHANGE_TYPE_ZH[key]
  return (type && typeof type === 'string') ? type : ''
}

/**
 * 交易所KYC状态映射（交易所ID → 是否需要KYC）
 * '是' = 需要KYC认证，'否' = 不需要（DEX等），'未知' = 暂无公开信息
 */
const EXCHANGE_KYC_ZH = {
  binance: '是',
  bybitspot: '是',
  gateio: '是',
  gdax: '是',
  okex: '是',
  kraken: '是',
  bitget: '是',
  mxc: '是',
  kucoin: '是',
  cryptocom: '是',
  bitfinex: '是',
  upbit: '是',
  htx: '是',
  deribit: '是',
  gemini: '是',
  bithumb: '是',
  deepcoin: '是',
  biking: '未知',
  bittap: '未知',
  hyperliquid: '否',
  bitflyer: '是',
  bitstamp: '是',
  bittrex: '是',
  coinexchange: '未知',
  coinone: '是',
  coinsbit: '未知',
  exmo: '是',
  huobi: '是',
  korbit: '是',
  lbank: '未知',
  liquid: '是',
  poloniex: '是',
  probit: '是',
  bullishcom: '否',
  bingx: '是',
}

export function getExchangeKycZh(exchangeId) {
  if (!exchangeId || typeof exchangeId !== 'string') return ''
  const id = exchangeId.toLowerCase().trim()
  if (!id) return ''
  const mapped = COINGECKO_ID_MAP[id]
  const lookupKey = mapped || id
  return EXCHANGE_KYC_ZH[lookupKey] || '未知'
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
