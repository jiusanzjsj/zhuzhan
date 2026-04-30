import fs from 'fs'
import path from 'path'

const baseUrl = 'https://openupbtc.com'
const distDir = path.resolve('dist')
const indexPath = path.join(distDir, 'index.html')

const staticRoutes = {
  '/': {
    title: '比特视界 - 加密货币实时行情',
    description: '专业加密货币行情数据平台，提供比特币、以太坊、Solana等主流币种实时价格、24小时涨跌统计、K线走势图',
    keywords: '比特币,以太坊,加密货币,行情,实时价格,BTC,ETH,K线',
    type: 'website'
  },
  '/news': {
    title: '资讯 - 比特视界',
    description: '最新加密货币资讯、链上动态、重要资讯实时更新',
    keywords: '加密货币,资讯,链上,新闻,资讯',
    type: 'website'
  },
  '/exchange': {
    title: '交易所 - 比特视界',
    description: '全球加密货币交易所排名、交易量、详细信息对比',
    keywords: '交易所,币安,OKX,火币,CoinGecko',
    type: 'website'
  },
  '/kline': {
    title: 'K线行情 - 比特视界',
    description: '专业K线图表，支持多种时间周期和技术指标分析',
    keywords: 'K线,技术分析,图表,TradingView',
    type: 'website'
  },
  '/tools': {
    title: '工具 - 比特视界',
    description: '区块浏览器、汇率转换、Gas费查询等加密货币常用工具',
    keywords: '工具,区块浏览器,汇率转换,Gas',
    type: 'website'
  },
  '/topics': {
    title: '热门专题 - 比特视界',
    description: '比特币入门、以太坊生态、DeFi教程等热门专题',
    keywords: '专题,教程,DeFi,NFT,入门',
    type: 'website'
  },
  '/flash': {
    title: '资讯 - 比特视界',
    description: '最新加密货币资讯、链上动态、重要资讯实时更新',
    keywords: '加密货币,资讯,链上,新闻',
    type: 'website'
  }
}

const chartSymbols = ['BTC', 'ETH', 'SOL']
const exchangeRoutes = [
  { id: 'binance', name: '币安' },
  { id: 'okx', name: 'OKX' },
  { id: 'kraken', name: 'Kraken' },
  { id: 'kucoin', name: '库币' },
  { id: 'bitget', name: 'Bitget' },
  { id: 'gate', name: 'Gate.io' }
]

const routeMeta = new Map(Object.entries(staticRoutes))

for (const symbol of chartSymbols) {
  routeMeta.set(`/chart/${symbol}`, {
    title: `${symbol}实时价格走势 - ${symbol}行情K线图表 - 比特视界`,
    description: `查看${symbol}实时价格、24小时涨跌幅、成交量和专业K线走势图，快速了解${symbol}/USDT市场行情与技术分析。`,
    keywords: `${symbol},${symbol}价格,${symbol}行情,${symbol}实时价格,${symbol}K线,加密货币行情`,
    type: 'website'
  })
}

for (const exchange of exchangeRoutes) {
  routeMeta.set(`/exchange/${exchange.id}`, {
    title: `${exchange.name}交易所详情 - 排名、交易对与成交额 - 比特视界`,
    description: `查看${exchange.name}交易所详情，包括排名、24小时成交额、交易对数量、地区与KYC信息。`,
    keywords: `${exchange.name},${exchange.id},加密货币交易所,交易所排名,交易平台,比特视界`,
    type: 'website'
  })
}

function upsertMeta(html, matcher, replacement, fallback) {
  if (matcher.test(html)) {
    return html.replace(matcher, replacement)
  }
  return html.replace('</head>', `${fallback}\n  </head>`)
}

function injectMeta(template, route, meta) {
  const canonical = `${baseUrl}${route}`
  let html = template

  html = html.replace(/<title>.*?<\/title>/, `<title>${meta.title}</title>`)
  html = upsertMeta(
    html,
    /<meta\s+name="description"\s+content=".*?"\s*\/?>/,
    `<meta name="description" content="${meta.description}" />`,
    `<meta name="description" content="${meta.description}" />`
  )
  html = upsertMeta(
    html,
    /<meta\s+name="keywords"\s+content=".*?"\s*\/?>/,
    `<meta name="keywords" content="${meta.keywords}" />`,
    `<meta name="keywords" content="${meta.keywords}" />`
  )
  html = upsertMeta(
    html,
    /<link\s+rel="canonical"\s+href=".*?"\s*\/?>/,
    `<link rel="canonical" href="${canonical}" />`,
    `<link rel="canonical" href="${canonical}" />`
  )

  const tags = [
    { key: 'og:title', value: meta.title, property: true },
    { key: 'og:description', value: meta.description, property: true },
    { key: 'og:image', value: `${baseUrl}/logo.png`, property: true },
    { key: 'og:url', value: canonical, property: true },
    { key: 'og:type', value: meta.type || 'website', property: true },
    { key: 'og:site_name', value: '比特视界', property: true },
    { key: 'twitter:card', value: 'summary', property: false },
    { key: 'twitter:title', value: meta.title, property: false },
    { key: 'twitter:description', value: meta.description, property: false },
    { key: 'twitter:image', value: `${baseUrl}/logo.png`, property: false }
  ]

  for (const tag of tags) {
    const attr = tag.property ? 'property' : 'name'
    const regex = new RegExp(`<meta\\s+${attr}="${tag.key.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}"\\s+content=".*?"\\s*\\/?>`)
    const replacement = `<meta ${attr}="${tag.key}" content="${tag.value}" />`
    html = upsertMeta(html, regex, replacement, replacement)
  }

  return html
}

if (!fs.existsSync(indexPath)) {
  console.error('dist/index.html 不存在，请先执行 vite build')
  process.exit(1)
}

const template = fs.readFileSync(indexPath, 'utf8')

for (const [route, meta] of routeMeta.entries()) {
  const outputDir = route === '/' ? distDir : path.join(distDir, route.replace(/^\//, ''))
  fs.mkdirSync(outputDir, { recursive: true })
  const html = injectMeta(template, route, meta)
  fs.writeFileSync(path.join(outputDir, 'index.html'), html, 'utf8')
}

console.log(`Prerendered ${routeMeta.size} routes into dist/`)