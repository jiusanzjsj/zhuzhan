/**
 * 简单的中英文翻译工具
 * 使用免费翻译API + 本地缓存
 */

const TRANSLATE_API = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-CN&dt=t&q='

// 常用词汇本地缓存（避免重复调用API）
const localCache = new Map()

/**
 * 翻译文本（带缓存）
 * @param {string} text - 要翻译的英文文本
 * @returns {Promise<string>} - 翻译后的中文文本
 */
export async function translate(text) {
  if (!text || typeof text !== 'string') return text
  
  // 空字符串或太短的文本不翻译
  const trimmed = text.trim()
  if (trimmed.length < 2) return trimmed
  
  // 检查缓存
  if (localCache.has(trimmed)) {
    return localCache.get(trimmed)
  }
  
  try {
    // 调用Google翻译API
    const url = TRANSLATE_API + encodeURIComponent(trimmed)
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`翻译API错误: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data && data[0]) {
      // 翻译API返回格式: [[ translations ], original, ...]
      const translated = data[0].map(item => item[0]).join('')
      localCache.set(trimmed, translated)
      return translated
    }
    
    return trimmed
  } catch (err) {
    console.warn('翻译失败，使用原文:', err.message)
    return trimmed
  }
}

/**
 * 批量翻译（用于列表）
 * @param {Array} items - 要翻译的文本数组
 * @returns {Promise<Array>} - 翻译后的文本数组
 */
export async function translateBatch(items) {
  return Promise.all(items.map(item => translate(item)))
}

/**
 * 同步翻译（使用本地词汇表快速翻译）
 * 适用于常见加密货币术语
 */
const cryptoTerms = {
  'bitcoin': '比特币',
  'ethereum': '以太坊',
  'crypto': '加密货币',
  'blockchain': '区块链',
  'defi': '去中心化金融',
  'nft': 'NFT',
  'dao': '去中心化组织',
  'web3': 'Web3',
  'token': '代币',
  'coin': '币',
  'price': '价格',
  'market': '市场',
  'trading': '交易',
  'exchange': '交易所',
  'launch': '发布',
  'update': '更新',
  'news': '新闻',
  'report': '报告',
  'analysis': '分析',
  'announces': '宣布',
  'says': '表示',
  'raises': '融资',
  'drops': '下跌',
  'rises': '上涨',
  'surge': '暴涨',
  'crash': '暴跌',
  'bullish': '看涨',
  'bearish': '看跌',
  'regulatory': '监管',
  'regulation': '监管',
  'government': '政府',
  'security': '安全',
  'hack': '黑客',
  'scam': '骗局',
  'fraud': '欺诈',
  'partnership': '合作',
  'investment': '投资',
  'fund': '基金',
  'million': '百万',
  'billion': '十亿',
  'dollar': '美元',
  'usd': '美元',
  'usdt': '泰达币',
  'stablecoin': '稳定币',
  'institutional': '机构',
  'retail': '零售',
  'adoption': '采用',
  'innovation': '创新',
  'technology': '技术',
  'protocol': '协议',
  'network': '网络',
  'wallet': '钱包',
  'mining': '挖矿',
  'staking': '质押',
  'yield': '收益',
  'farm': '农场',
  'swap': '兑换',
  'pool': '池子',
  'bridge': '跨链桥',
  'layer': '层',
  'scaling': '扩展',
  'solution': '解决方案',
  'testnet': '测试网',
  'mainnet': '主网',
  'upgrade': '升级',
  'merge': '合并',
  'fork': '分叉',
  'airdrop': '空投',
  'reward': '奖励',
  'incentive': '激励',
  'governance': '治理',
  'vote': '投票',
  'proposal': '提案',
  'whale': '巨鲸',
  'volume': '成交量',
  'cap': '市值',
  'supply': '供应量',
  'demand': '需求',
  'breakout': '突破',
  'resistance': '阻力位',
  'support': '支撑位',
  'trend': '趋势',
  'signal': '信号',
  'alert': '警报',
  'warning': '警告',
  'safe': '安全',
  'risk': '风险',
  'analysis': '分析',
  'weekly': '周报',
  'daily': '日报',
  'monthly': '月报',
  'quarter': '季度',
  'halving': '减半',
  'cycle': '周期',
  'bull': '牛市',
  'bear': '熊市',
  'rally': '反弹',
  'pullback': '回调',
  'correction': '回调',
  ' ATH': '历史新高',
  'ATL': '历史新低',
}

/**
 * 快速翻译（同步，仅处理已知术语）
 * @param {string} text
 * @returns {string}
 */
export function quickTranslate(text) {
  if (!text || typeof text !== 'string') return text
  
  let result = text
  
  // 优先替换已知术语
  Object.entries(cryptoTerms).forEach(([en, zh]) => {
    const regex = new RegExp(`\\b${en}\\b`, 'gi')
    result = result.replace(regex, zh)
  })
  
  return result
}

/**
 * 组合翻译：先用Google API完整翻译，再用本地词汇表优化加密货币术语
 * @param {string} text - 要翻译的英文文本
 * @param {boolean} useApi - 是否调用API翻译
 * @returns {Promise<string>} - 翻译后的中文文本
 */
export async function smartTranslate(text, useApi = false) {
  if (!text) return text
  
  let result = text
  
  // 如果启用API，先调用Google完整翻译
  if (useApi) {
    try {
      result = await translate(text)
    } catch (err) {
      console.warn('API翻译失败，使用本地词典:', err.message)
    }
  }
  
  // 再用本地词汇表优化加密货币术语（API可能翻译不准确的）
  result = quickTranslate(result)
  
  return result
}
