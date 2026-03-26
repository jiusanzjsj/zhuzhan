/**
 * 新闻数据状态管理
 * 确保数据获取的前提下进行速率优化
 */

import { ref } from 'vue'
import { apiCache } from '../utils/apiCache'

const NEWS_API_KEY = '3908eafc986a4b75842bee9ac752cced'
const REQUEST_TIMEOUT = 10000 // 10秒超时
const TRANSLATION_TIMEOUT = 5000 // 翻译超时

// 状态
const articles = ref([])
const hotNews = ref([])
const articleDetailCache = ref({})
const loading = ref(false)
const error = ref(null)
const translating = ref(false)

// 导航数据
const navigationData = ref(null)

export function setNavigationArticle(article) {
  navigationData.value = article
}

export function getNavigationArticle() {
  const data = navigationData.value
  navigationData.value = null
  return data
}

// 带超时的fetch（只定义一次）
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
 * 翻译文本（带超时和缓存）
 */
const translationCache = new Map()

export async function translateText(text, force = false) {
  if (!text) return ''
  
  if (!force && translationCache.has(text)) {
    return translationCache.get(text)
  }
  
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), TRANSLATION_TIMEOUT)
    
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.substring(0, 500))}&langpair=en|zh`,
      { signal: controller.signal }
    )
    
    clearTimeout(timeoutId)
    
    if (!res.ok) throw new Error('翻译API错误')
    
    const data = await res.json()
    const translated = data.responseData?.translatedText || text
    
    translationCache.set(text, translated)
    return translated
  } catch (err) {
    console.warn('翻译失败:', err.message)
    return text
  }
}

/**
 * 批量翻译（并发控制）
 */
export async function translateBatch(items, fields = ['title', 'description']) {
  if (!items || items.length === 0) return
  
  translating.value = true
  
  try {
    const batchSize = 5
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize)
      await Promise.all(
        batch.map(async (item) => {
          for (const field of fields) {
            if (item[field] && !item[field + 'Zh']) {
              try {
                item[field + 'Zh'] = await translateText(item[field])
              } catch {
                item[field + 'Zh'] = item[field] // 失败使用原文
              }
              await new Promise(r => setTimeout(r, 100))
            }
          }
        })
      )
    }
  } catch (err) {
    console.error('批量翻译失败:', err)
  } finally {
    translating.value = false
  }
}

/**
 * 获取新闻列表（带缓存）
 */
export async function fetchNewsList(forceRefresh = false) {
  // 1. 内存缓存优先
  if (!forceRefresh && articles.value.length > 0) {
    return { articles: articles.value, hotNews: hotNews.value }
  }

  // 2. API缓存
  if (!forceRefresh) {
    const cached = apiCache.get('news_list')
    if (cached && cached.articles) {
      articles.value = cached.articles
      hotNews.value = cached.hotNews
      return cached
    }
  }

  try {
    loading.value = true
    error.value = null

    const response = await fetchWithTimeout(
      `https://newsapi.org/v2/everything?q=crypto+OR+bitcoin+OR+ethereum&language=en&sortBy=publishedAt&pageSize=10&page=1&apiKey=${NEWS_API_KEY}`
    )

    if (!response.ok) {
      throw new Error(`API错误: ${response.status}`)
    }

    const data = await response.json()
    
    if (!data.articles || !Array.isArray(data.articles)) {
      throw new Error('返回数据格式错误')
    }

    const articlesData = data.articles.slice(0, 10).map((item, index) => ({
      id: index + 1,
      title: item.title || '无标题',
      tag: getTag(item.source?.name),
      tagClass: getTagClass(getTag(item.source?.name)),
      time: formatTime(item.publishedAt),
      views: Math.floor(Math.random() * 900 + 100),
      comments: Math.floor(Math.random() * 50 + 10),
      url: item.url || '',
      image: item.urlToImage || '',
      description: item.description || '',
      source: item.source?.name || 'Unknown',
      content: item.description || '',
      publishedAt: item.publishedAt
    }))

    const hotData = data.articles.slice(0, 5).map((item, index) => ({
      id: index + 1,
      title: item.title?.slice(0, 30) + '...' || '无标题'
    }))

    // 更新内存
    articles.value = articlesData
    hotNews.value = hotData

    // 缓存
    apiCache.set('news_list', { articles: articlesData, hotNews: hotData })

    return { articles: articlesData, hotNews: hotData }

  } catch (err) {
    console.error('获取新闻失败:', err)
    error.value = err.message
    
    if (articles.value.length > 0) {
      return { articles: articles.value, hotNews: hotNews.value }
    }
    
    throw err
  } finally {
    loading.value = false
  }
}

/**
 * 获取文章详情内容
 */
export async function fetchArticleContent(url) {
  if (!url) return { content: '暂无详细内容，请点击阅读原文查看', image: '' }

  try {
    const response = await fetchWithTimeout(`/api/news/content?url=${encodeURIComponent(url)}`)
    
    if (!response.ok) {
      throw new Error(`获取内容失败: ${response.status}`)
    }

    const result = await response.json()
    
    if (result.success && result.data) {
      return result.data
    }
    
    return { content: '暂无详细内容，请点击阅读原文查看', image: '' }
  } catch (err) {
    console.error('获取文章内容失败:', err)
    return { content: '暂无详细内容，请点击阅读原文查看', image: '' }
  }
}

/**
 * 根据ID获取文章
 */
export function getArticleById(id) {
  return articles.value.find(item => item.id === Number(id)) || null
}

// 辅助函数
function getTag(source) {
  const sourceMap = {
    'CoinDesk': '行情',
    'CoinTelegraph': '行情',
    'Bloomberg': '政策',
    'Reuters': '政策',
    'Decrypt': '技术',
    'The Block': 'DeFi'
  }
  return sourceMap[source] || '快讯'
}

function getTagClass(tag) {
  const classMap = {
    '行情': 'bg-red-50 text-red-600 border border-red-100',
    '政策': 'bg-yellow-50 text-yellow-600 border border-yellow-100',
    '技术': 'bg-purple-50 text-purple-600 border border-purple-100',
    'DeFi': 'bg-green-50 text-green-600 border border-green-100',
    '快讯': 'bg-blue-50 text-blue-600 border border-blue-100'
  }
  return classMap[tag] || classMap['快讯']
}

function formatTime(dateStr) {
  if (!dateStr) return '未知时间'
  const date = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now - date) / 1000 / 60)
  
  if (diff < 60) return diff + '分钟前'
  if (diff < 1440) return Math.floor(diff / 60) + '小时前'
  return Math.floor(diff / 1440) + '天前'
}

// 导出状态
export { articles, hotNews, articleDetailCache, loading, error, translating }
