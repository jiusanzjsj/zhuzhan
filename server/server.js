import express from 'express'
import cors from 'cors'
import axios from 'axios'
import * as cheerio from 'cheerio'

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

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
    
    console.log('爬取成功')
    
    return {
      title: title.substring(0, 200) || '无标题',
      content: content.substring(0, 5000) || '暂无详细内容',
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

// 获取文章详情
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

app.listen(PORT, () => {
  console.log(`API服务已启动: http://localhost:${PORT}`)
  console.log(`获取文章内容: http://localhost:${PORT}/api/news/content?url=原文链接`)
})
