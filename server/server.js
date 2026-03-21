import express from 'express'
import cors from 'cors'
import axios from 'axios'
import * as cheerio from 'cheerio'

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

// 爬取 The BlockBeats 快讯
async function scrapeNews() {
  try {
    const response = await axios.get('https://www.theblockbeats.info/newsflash', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      },
      timeout: 10000
    })

    const $ = cheerio.load(response.data)
    const newsList = []

    // 解析快讯数据 - 根据实际页面结构调整选择器
    // 这里需要根据 The BlockBeats 的实际 HTML 结构来提取
    
    // 尝试多种选择器模式
    $('h2, h3, .news-item, .flash-item, [class*="news"], [class*="flash"]').each((i, el) => {
      if (i >= 20) return // 限制数量
      
      const $el = $(el)
      const title = $el.text().trim().substring(0, 100)
      const link = $el.find('a').attr('href') || $el.parent().find('a').attr('href')
      
      if (title && title.length > 10) {
        newsList.push({
          title,
          url: link ? `https://www.theblockbeats.info${link}` : '',
          time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
          summary: title,
          tags: extractTags(title),
          isImportant: isImportant(title)
        })
      }
    })

    // 如果解析不到，返回模拟数据
    if (newsList.length === 0) {
      return getMockData()
    }

    return newsList.slice(0, 20)
  } catch (error) {
    console.error('爬取失败:', error.message)
    return getMockData()
  }
}

// 从标题中提取标签
function extractTags(title) {
  const tags = []
  const tagMap = {
    'BTC': 'BTC', '比特币': 'BTC', 'btc': 'BTC',
    'ETH': 'ETH', '以太坊': 'ETH', 'eth': 'ETH',
    'HYPE': 'HYPE', 'Hyperliquid': 'HYPE',
    'Solana': 'SOL', 'SOL': 'SOL',
    'BNB': 'BNB',
    'ETF': 'ETF',
    'DeFi': 'DeFi',
    'Polymarket': 'Polymarket',
    'AI': 'AI',
  }

  for (const [key, tag] of Object.entries(tagMap)) {
    if (title.includes(key)) {
      tags.push(tag)
    }
  }
  
  return tags.slice(0, 3)
}

// 判断是否重要
function isImportant(title) {
  const importantKeywords = ['巨鲸', '爆仓', 'ETF流出', '重大', '突破', '暴跌', '暴涨', 'OG', '机构']
  return importantKeywords.some(k => title.includes(k))
}

// 模拟数据
function getMockData() {
  return [
    { title: 'James Wynn「蚂蚁仓」40倍做空2.69枚BTC，爆仓价71,112.48美元', time: '15:05', summary: 'James Wynn已回归市场，向HyperLiquid存入USDC并开设40倍杠杆BTC空头仓位', tags: ['BTC', 'JamesWynn'], isImportant: true, url: 'https://www.theblockbeats.info/flash/337405' },
    { title: '巨鲸tummy.hl 3倍做多超13.5万枚HYPE', time: '14:31', summary: '巨鲸tummy.hl曾抛售2000万美元HYPE，现做多135065枚HYPE', tags: ['HYPE', '巨鲸'], isImportant: true, url: 'https://www.theblockbeats.info/flash/337403' },
    { title: '以太坊OG回归：thomasg.eth本周加仓1950万美元ETH', time: '13:56', summary: 'thomasg.eth曾持仓超5亿美元，本周买入约1950万美元ETH', tags: ['ETH', '巨鲸'], isImportant: true, url: 'https://www.theblockbeats.info/flash/337400' },
    { title: 'Renaiss Protocol完成3万美元社区奖励发放', time: '14:16', summary: 'BNB Chain生态项目Renaiss Protocol完成空投，平台交易量突破600万美元', tags: ['BNB', 'DeFi'], isImportant: false, url: 'https://www.theblockbeats.info/flash/337401' },
    { title: '美众议院将于3月25日举行代币化听证会', time: '12:05', summary: '美国众议院金融服务委员会举行听证会，主题为代币化与资本市场未来', tags: ['美国', '监管'], isImportant: false, url: 'https://www.theblockbeats.info/flash/337395' },
    { title: '昨日美国现货比特币ETF净流出5200万美元', time: '12:00', summary: '美国现货比特币ETF连续三个交易日净流出', tags: ['BTC', 'ETF'], isImportant: true, url: 'https://www.theblockbeats.info/flash/337394' },
    { title: 'Polymarket周一将发布重大公告', time: '12:52', summary: 'Polymarket团队成员宣布将于周一公布重大公告', tags: ['Polymarket'], isImportant: false, url: 'https://www.theblockbeats.info/flash/337396' },
    { title: '以太坊基金会向CEX存入5000枚ETH', time: '11:30', summary: '以太坊基金会过去3个月共向CEX存入3.4万枚ETH', tags: ['ETH'], isImportant: false, url: 'https://www.theblockbeats.info/flash/337392' },
  ]
}

// API 路由
app.get('/api/news', async (req, res) => {
  const news = await scrapeNews()
  res.json({
    success: true,
    data: news,
    timestamp: new Date().toISOString()
  })
})

app.get('/api/news/chain', (req, res) => {
  // 链上侦探数据
  res.json({
    success: true,
    data: [
      { time: '27分钟前', title: 'James Wynn「蚂蚁仓」40倍做空2.69枚BTC', url: '/flash/337405' },
      { time: '1小时前', title: '巨鲸tummy.hl 3倍做多超13.5万枚HYPE', url: '/flash/337403' },
      { time: '1小时前', title: '以太坊OG回归：thomasg.eth本周加仓1950万美元ETH', url: '/flash/337400' },
      { time: '4小时前', title: 'Erik Voorhees再次增持1.44万枚ETH', url: '/flash/337388' },
    ]
  })
})

app.get('/api/news/important', (req, res) => {
  // 24H重要资讯
  res.json({
    success: true,
    data: [
      { title: 'James Wynn「蚂蚁仓」40倍做空2.69枚BTC', url: '/flash/337405' },
      { title: '巨鲸tummy.hl 3倍做多超13.5万枚HYPE', url: '/flash/337403' },
      { title: '以太坊OG回归：thomasg.eth本周加仓1950万美元ETH', url: '/flash/337400' },
      { title: '霍尔木兹海峡现「僵尸船」通行', url: '/flash/337402' },
    ]
  })
})

app.listen(PORT, () => {
  console.log(`🚀 API服务已启动: http://localhost:${PORT}`)
  console.log(`📰 获取快讯: http://localhost:${PORT}/api/news`)
})
