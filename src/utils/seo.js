/**
 * SEO 工具函数 — 增强版
 * 
 * 架构说明：
 * - 路由级静态 SEO（/ /news /exchange 等）由 router/index.js 的 afterEach 钩子统一处理
 * - 本文件供详情页（Chart/ExchangeDetail/NewsDetail）注入动态 Meta + FOMO 社交描述
 * 
 * 使用示例：
 *   import { updatePageSeo, generateFomoDescription } from '../utils/seo'
 *   updatePageSeo({ title: '...', description: generateFomoDescription(...), ... })
 */

const SITE_NAME = '比特视界'
const DEFAULT_IMAGE = 'https://openupbtc.com/logo.png'

/**
 * 生成 FOMO 驱动的社交分享描述
 * 用于详情页分享到 X/Telegram 时抓取最具冲击力的描述文本
 */
export function generateFomoDescription({ coinName, price, change24h, volume24h, marketCap, newsTitle }) {
  const templates = []
  const chg = parseFloat(change24h) || 0
  const sign = chg >= 0 ? '📈' : '📉'
  const dir = chg >= 0 ? '上涨' : '下跌'

  if (coinName && price) {
    const priceStr = isNaN(Number(price)) ? price : Number(price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 })
    templates.push(
      `${sign} ${coinName} 现报 $${priceStr}，24小时${dir} ${Math.abs(chg).toFixed(2)}%${chg >= 5 ? '🔥' : chg <= -5 ? '⚠️' : ''}`,
      `${sign} ${coinName} 突破 $${priceStr}！24小时成交量 $${(Number(volume24h) || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}${marketCap ? '，总市值 $' + Number(marketCap).toLocaleString('en-US', { maximumFractionDigits: 0 }) : ''}`,
      `${sign} ${coinName} ${dir} ${Math.abs(chg).toFixed(2)}% — 最新价格 $${priceStr}。查看完整K线走势图与技术分析 →`
    )
  }

  if (newsTitle) {
    templates.push(`📰 ${newsTitle}`)
  }

  return templates[0] || templates[1] || '加密货币实时行情——比特视界'
}

/**
 * 为资讯文章生成 FOMO 社交分享描述
 */
export function generateNewsFomoDescription(title, summary, tags) {
  const tagStr = tags?.length ? `[${tags.slice(0, 3).join('·')}]` : ''
  if (title && summary) {
    return `${tagStr} ${title} —— ${summary.slice(0, 100)}`
  }
  return title || '最新加密货币资讯——比特视界'
}

export const updatePageSeo = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  siteName = SITE_NAME,
  // 详情页额外支持的字段
  articleBody,
  datePublished,
  dateModified,
  authorName,
  authorUrl,
  breadcrumbItems
}) => {
  if (typeof document === 'undefined') return

  // ═══ 1. 页面标题 ═══
  if (title) {
    document.title = title
  }

  // ═══ 2. Meta 标签更新/创建 ═══
  const updateMetaTag = (name, content, property = false) => {
    if (!content) return
    const attr = property ? 'property' : 'name'
    let el = document.querySelector(`meta[${attr}="${name}"]`)
    if (!el) {
      el = document.createElement('meta')
      el.setAttribute(attr, name)
      document.head.appendChild(el)
    }
    el.setAttribute('content', content)
  }

  const updateLink = (rel, href) => {
    if (!href) return
    let el = document.querySelector(`link[rel="${rel}"]`)
    if (!el) {
      el = document.createElement('link')
      el.setAttribute('rel', rel)
      document.head.appendChild(el)
    }
    el.setAttribute('href', href)
  }

  // 标准 Meta
  updateMetaTag('description', description)
  updateMetaTag('keywords', keywords)

  // Open Graph
  updateMetaTag('og:title', title, true)
  updateMetaTag('og:description', description, true)
  updateMetaTag('og:image', image || DEFAULT_IMAGE, true)
  updateMetaTag('og:url', url, true)
  updateMetaTag('og:type', type, true)
  updateMetaTag('og:site_name', siteName, true)
  updateMetaTag('og:locale', 'zh_CN', true)

  // Twitter Card（当有图片时升级为 summary_large_image）
  const twitterCard = image ? 'summary_large_image' : 'summary'
  updateMetaTag('twitter:card', twitterCard)
  updateMetaTag('twitter:title', title)
  updateMetaTag('twitter:description', description)
  updateMetaTag('twitter:image', image || DEFAULT_IMAGE)

  // Canonical
  updateLink('canonical', url)

  // ═══ 3. 详情页结构化数据 ═══
  if (articleBody && title) {
    injectArticleSchema({ title, description, image, url, articleBody, datePublished, dateModified, authorName, authorUrl })
  }

  // ═══ 4. 面包屑 Schema ═══
  if (breadcrumbItems && Array.isArray(breadcrumbItems)) {
    injectBreadcrumbSchema(breadcrumbItems)
  }
}

/**
 * 注入新闻文章 Article Schema
 */
function injectArticleSchema({ title, description, image, url, articleBody, datePublished, dateModified, authorName, authorUrl }) {
  removeSchema('ArticleSchema')
  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.id = 'ArticleSchema'
  script.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    'headline': title,
    'description': description || '',
    'image': image || DEFAULT_IMAGE,
    'url': url,
    'articleBody': articleBody ? articleBody.slice(0, 1000) : '',
    'datePublished': datePublished || new Date().toISOString(),
    'dateModified': dateModified || new Date().toISOString(),
    'author': {
      '@type': 'Person',
      'name': authorName || SITE_NAME,
      'url': authorUrl || 'https://openupbtc.com'
    },
    'publisher': {
      '@type': 'Organization',
      'name': SITE_NAME,
      'logo': {
        '@type': 'ImageObject',
        'url': DEFAULT_IMAGE
      }
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': url
    }
  })
  document.head.appendChild(script)
}

/**
 * 注入面包屑 Schema
 */
function injectBreadcrumbSchema(items) {
  removeSchema('BreadcrumbDetail')
  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.id = 'BreadcrumbDetail'
  script.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, i) => ({
      '@type': 'ListItem',
      'position': i + 1,
      'name': item.name,
      'item': item.url
    }))
  })
  document.head.appendChild(script)
}

function removeSchema(id) {
  const el = document.getElementById(id)
  if (el) el.remove()
}

export default updatePageSeo
