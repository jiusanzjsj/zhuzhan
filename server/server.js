import express from 'express'
import cors from 'cors'
import axios from 'axios'
import * as cheerio from 'cheerio'

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

// 翻译文本（英译中）
async function translateToChinese(text) {
  if (!text || text.length < 2) return text
  
  try {
    // 使用 MyMemory 免费翻译 API
    const encodedText = encodeURIComponent(text.substring(0, 500)) // 限制长度
    const url = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=en|zh`
    
    const response = await axios.get(url, { timeout: 10000 })
    
    if (response.data && response.data.responseData && response.data.responseData.translatedText) {
      return response.data.responseData.translatedText
    }
    
    return text
  } catch (error) {
    console.error('翻译失败:', error.message)
    return text
  }
}

// 批量翻译
async function translateArticles(articles) {
  const translated = []
  
  for (const article of articles) {
    const translatedArticle = {
      ...article,
      title: await translateToChinese(article.title),
      description: article.description ? await translateToChinese(article.description) : ''
    }
    translated.push(translatedArticle)
  }
  
  return translated
}

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

    $('h2, h3, .news-item, .flash-item, [class*="news"], [class*="flash"]').each((i, el) => {
      if (i >= 20) return
      
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

    if (newsList.length === 0) {
      return getMockData()
    }

    return newsList.slice(0, 20)
  } catch (error) {
    console.error('爬取失败:', error.message)
    return getMockData()
  }
}

// 爬取原文正文内容
async function scrapeArticleContent(url) {
  try {
    console.log('开始爬取:', url)
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      },
      timeout: 15000
    })

    const $ = cheerio.load(response.data)
    
    let content = ''
    const selectors = [
      'article',
      '.article-content',
      '.article-body',
      '.post-content',
      '.entry-content',
      '.news-content',
      '.content-body',
      '[class*="article"]',
      '[class*="content"]',
      'main',
      '.main-content'
    ]
    
    for (const selector of selectors) {
      const $el = $(selector)
      if ($el.length) {
        content = $el.text().trim()
        content = content.replace(/\s+/g, ' ').replace(/\n+/g, '\n').trim()
        if (content.length > 200) break
      }
    }
    
    if (!content || content.length < 200) {
      const paragraphs = []
      $('p').each((i, el) => {
        const text = $(el).text().trim()
        if (text.length > 50) {
          paragraphs.push(text)
        }
      })
      content = paragraphs.join('\n\n')
    }
    
    let title = $('h1').first().text().trim() || 
                 $('title').text().trim() ||
                 $('h2').first().text().trim()
    
    let image = $('meta[property="og:image"]').attr('content') ||
                $('article img').first().attr('src') ||
                $('img').first().attr('src') ||
                ''
    
    if (image && !image.startsWith('http')) {
      const urlObj = new URL(url)
      image = image.startsWith('/') 
        ? `${urlObj.protocol}//${urlObj.host}${image}`
        : `${urlObj.protocol}//${urlObj.host}/${image}`
    }
    
    // 翻译标题和内容
    const translatedTitle = await translateToChinese(title)
    const translatedContent = await translateToChinese(content)
    
    console.log('爬取成功，翻译完成')
    
    return {
      title: translatedTitle.substring(0, 200) || '无标题',
      content: translatedContent.substring(0, 5000) || '暂无详细内容',
      image: image || null
    }
    
  } catch (error) {
    console.error('爬取原文失败:', error.message)
    return {
      title: '',
      content: '暂无详细内容，请点击阅读原文查看完整文章',
      image: null
    }
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
    { title: 'James Wynn「蚂蚁仓」40倍做空2.69枚BTC，爆仓价71,112.美元', time: '15:05', summary: 'James Wynn已回归市场，向HyperLiquid存入USDC并开设40倍杠杆BTC空头仓位', tags: ['BTC', 'JamesWynn'], isImportant: true, url: 'https://www.theblockbeats.info/flash/337405' },
    { title: '巨鲸tummy.hl 3倍做多超13.5万枚HYPE', time: '14:31', summary: '巨鲸tummy.hl曾抛售2000万美元HYPE，现做多135065枚HYPE', tags: ['HYPE', '巨鲸'], isImportant: true, url: 'https://www.theblockbeats.info/flash/337403' },
    { title: '以太坊OG回归：thomasg.eth本周加仓1950万美元ETH', time: '13:56', summary: 'thomasg.eth曾持仓超5亿美元，本周买入约1950万美元ETH', tags: ['ETH', '巨鲸'], isImportant: true, url: 'https://www.theblockbeats.info/flash/337400' },
    { title: 'Renaiss Protocol完成3万美元社区奖励发放', time: '14:16', summary: 'BNB Chain生态项目Renaiss Protocol完成空投，平台交易量突破600万美元', tags: ['BNB', 'DeFi'], isImportant: false, url: 'https://www.theblockbeats.info/flash/337401' },
    { title: '美众议院将于3月25日举行代币化听证会', time: '12:05', summary: '美国众议院金融服务委员会举行听证会，主题为代币化与资本市场未来', tags: ['美国', '监管'], isImportant: false, url: 'https://www.theblockbeats.info/flash/337395' },
    { title: '昨日美国现货比特币ETF净流出5200万美元', time: '12:00', summary: '美国现货比特币ETF连续三个交易日净流出', tags: ['BTC', 'ETF'], isImportant: true, url: 'https://www.theblockbeats.info/flash/337394' },
    { title: 'Polymarket周一将发布重大公告', time: '12:52', summary: 'Polymarket团队成员宣布将于周一公布重大公告', tags: ['Polymarket'], isImportant: false, url: 'https://www.theblockbeats.info/flash/337396' },
    { title: '以太坊基金会向CEX存入5000枚ETH', time: '11:30', summary: '以太坊基金会过去3个月共向CEX存入3.万枚ETH', tags: ['ETH'], isImportant: false, url: 'https://www.theblockbeats.info/flash/337392' },
  ]
}

// API 路由

// 获取快讯列表（翻译成中文）
app.get('/api/news', async (req, res) => {
  const news = await scrapeNews()
  
  // 翻译标题
  const translatedNews = []
  for (const item of news) {
    translatedNews.push({
      ...item,
      title: await translateToChinese(item.title),
      summary: await translateToChinese(item.summary)
    })
  }
  
  res.json({
    success: true,
    data: translatedNews,
    timestamp: new Date().toISOString()
  })
})

// 获取文章详情（翻译成中文）
app.get('/api/news/content', async (req, res) => {
  const { url } = req.query
  
  if (!url) {
    return res.status(400).json({
      success: false,
      message: '缺少url参数'
    })
  }
  
  console.log('收到内容请求:', url)
  const content = await scrapeArticleContent(url)
  
  res.json({
    success: true,
    data: content
  })
})

// 链上侦探数据
app.get('/api/news/chain', (req, res) => {
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

// 24H重要资讯
app.get('/api/news/important', (req, res) => {
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

// 获取交易所描述
app.get('/api/exchange/description', async (req, res) => {
  const { exchange } = req.query
  
  if (!exchange) {
    return res.status(400).json({ success: false, message: '缺少exchange参数' })
  }
  
  try {
    // 1. 尝试从 CryptoCompare 获取 (服务端-side，避免CORS)
    const cryptoCompareRes = await axios.get(
      `https://min-api.cryptocompare.com/data/exchange/${exchange}/info`,
      { timeout: 10000 }
    )
    
    if (cryptoCompareRes.data && cryptoCompareRes.data.Data) {
      const data = cryptoCompareRes.data.Data
      let description = data.Description || data.About || data.SUMMARY || ''
      
      if (description && description.length > 10) {
        // 翻译成中文
        const translated = await translateToChinese(description)
        return res.json({
          success: true,
          description: translated,
          source: 'cryptocompare'
        })
      }
    }
    
    // 2. 尝试从 CoinGecko 获取
    const coinGeckoRes = await axios.get(
      `https://api.coingecko.com/api/v3/exchanges/${exchange}`,
      {
        headers: { 'x-cg-demo-api-key': 'CG-42Ty4UXdyANMSugcsqZSEU7Y' },
        timeout: 10000
      }
    )
    
    if (coinGeckoRes.data && coinGeckoRes.data.description && coinGeckoRes.data.description.length > 20) {
      return res.json({
        success: true,
        description: coinGeckoRes.data.description,
        source: 'coingecko'
      })
    }
    
    // 3. 返回空
    return res.json({
      success: true,
      description: '',
      source: 'none'
    })
    
  } catch (error) {
    console.error('获取交易所描述失败:', error.message)
    return res.json({
      success: false,
      description: '',
      error: error.message
    })
  }
})

app.listen(PORT, () => {
  console.log(`API服务已启动: http://localhost:${PORT}`)
  console.log(`获取快讯: http://localhost:${PORT}/api/news`)
  console.log(`获取文章内容: http://localhost:${PORT}/api/news/content?url=原文链接`)
  console.log(`获取交易所描述: http://localhost:${PORT}/api/exchange/description?exchange=binance`)
})
