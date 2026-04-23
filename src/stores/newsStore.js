/**
 * 新闻数据状态管理
 */

import { ref } from 'vue'
import { apiCache } from '../utils/apiCache'

const REQUEST_TIMEOUT = 10000

// 状态
const articles = ref([])
const hotNews = ref([])
const articleDetailCache = ref({})
const loading = ref(false)
const error = ref(null)

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

// 带超时的fetch
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
 * 获取新闻列表
 */
export async function fetchNewsList(forceRefresh = false) {
  try {
    loading.value = true
    error.value = null

    // 直接走 /api/news 接口，带时间戳防缓存
    let rawData = []
    const url = forceRefresh ? `/api/news?_=${Date.now()}` : '/api/news'
    const response = await fetchWithTimeout(url)
    if (response.ok) {
      const result = await response.json()
      rawData = result.data || result.results || []
    }

    if (!Array.isArray(rawData) || rawData.length === 0) {
      throw new Error('无数据')
    }

    const cleanData = rawData.filter(item => {
      const t = String(item?.title || '').trim()
      return t && !t.includes('ChainThink链智库') && !t.includes('ChainThink') && !t.includes('链智库')
    })

    const articlesData = cleanData.slice(0, 20).map((item, index) => ({
      id: item.id || index + 1,
      title: item.title || '无标题',
      tag: '资讯',
      tagClass: 'bg-blue-50 text-blue-600 border border-blue-100',
      time: item.time || formatTime(item.published_at),
      views: Math.floor(Math.random() * 900 + 100),
      comments: Math.floor(Math.random() * 50 + 10),
      url: item.url || '',
      image: item.coverImage || item.image || '',
      images: item.images || [],
      blocks: item.blocks || [],
      description: item.summary || item.description || '',
      source: item.source || '',
      content: item.content || item.summary || item.description || '',
      publishedAt: item.published_at,
      tags: item.tags || [],
      isImportant: !!item.isImportant
    }))

    const hotData = rawData.slice(0, 5).map((item, index) => ({
      id: index + 1,
      title: item.title || '无标题',
      source: '',
      time: item.time || formatTime(item.published_at)
    }))

    articles.value = articlesData
    hotNews.value = hotData

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
  const sid = String(id)
  return articles.value.find(item => String(item.id) === sid) || null
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
  
  // 转换为北京时间 (UTC+8)
  const beijingTime = new Date(date.getTime() + 8 * 60 * 60 * 1000)
  
  const hours = String(beijingTime.getUTCHours()).padStart(2, '0')
  const minutes = String(beijingTime.getUTCMinutes()).padStart(2, '0')
  
  return `${hours}:${minutes}`
}

// 导出状态
export { articles, hotNews, articleDetailCache, loading, error }