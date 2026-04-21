#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const BASE_DIR = path.resolve(__dirname, '..')
const OUTPUT_PATH = path.join(BASE_DIR, 'public', 'data', 'chainthink-news.json')
const LIST_URL = 'https://chainthink.cn/zh-CN/article'
const DETAIL_URL_PREFIX = 'https://chainthink.cn/zh-CN/article/'
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'

function parseArgs() {
  const args = process.argv.slice(2)
  const options = { limit: 20, withDetail: true }
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === '--limit' && args[i + 1]) {
      options.limit = Number(args[i + 1]) || 20
      i++
    } else if (arg === '--no-detail') {
      options.withDetail = false
    } else if (arg === '--with-detail') {
      options.withDetail = true
    }
  }
  return options
}

async function httpGet(url, timeout = 15000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
      signal: controller.signal,
    })
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`)
    }
    return await res.text()
  } finally {
    clearTimeout(timer)
  }
}

function decodeNextFPayload(htmlText) {
  const pushMarker = 'self.__next_f.push([1,"'
  const start = htmlText.lastIndexOf(pushMarker)
  if (start === -1) throw new Error('未找到 Next.js payload 起始位置')
  const payloadStart = start + pushMarker.length

  // 页面尾部实际是 ...}]]\n"])</script>
  let end = htmlText.indexOf('"])</script>', payloadStart)
  if (end === -1) {
    end = htmlText.indexOf('"])', payloadStart)
  }
  if (end === -1 || end <= payloadStart) throw new Error('未找到 Next.js payload 结束位置')

  const raw = htmlText.slice(payloadStart, end)
  return raw
    .replace(/\\"/g, '"')
    .replace(/\\n/g, '\n')
    .replace(/\\\\/g, '\\')
}

function extractJsonObjectAfterKey(text, keyWithQuotes) {
  const idx = text.indexOf(keyWithQuotes)
  if (idx === -1) throw new Error(`未找到键: ${keyWithQuotes}`)
  const after = text.slice(idx + keyWithQuotes.length)
  const objStart = after.indexOf('{"')
  if (objStart === -1) throw new Error(`未找到 ${keyWithQuotes} 对应 JSON 对象起点`)

  let pos = objStart
  let depth = 0
  let inString = false
  let escape = false

  while (pos < after.length) {
    const ch = after[pos]
    if (inString) {
      if (escape) {
        escape = false
      } else if (ch === '\\') {
        escape = true
      } else if (ch === '"') {
        inString = false
      }
    } else {
      if (ch === '"') {
        inString = true
      } else if (ch === '{' || ch === '[') {
        depth++
      } else if (ch === '}' || ch === ']') {
        depth--
        if (depth === 0) {
          const jsonRaw = after.slice(objStart, pos + 1)
          return JSON.parse(jsonRaw)
        }
      }
    }
    pos++
  }

  throw new Error(`未能完整提取 ${keyWithQuotes} 对应 JSON 对象`)
}

function formatPublishTime(ts) {
  const n = Number(ts)
  if (!Number.isFinite(n)) return ''
  const d = new Date(n * 1000)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${mm}-${dd} ${hh}:${mi}`
}

function normalizeImage(src) {
  if (!src) return ''
  const value = String(src).trim()
  if (value.startsWith('http://') || value.startsWith('https://')) return value
  if (value.startsWith('/_next/image?url=')) {
    try {
      const parsed = new URL(value, 'https://chainthink.cn')
      const rawUrl = parsed.searchParams.get('url')
      return rawUrl ? decodeURIComponent(rawUrl) : parsed.toString()
    } catch {
      return `https://chainthink.cn${value}`
    }
  }
  if (value.startsWith('//')) return `https:${value}`
  if (value.startsWith('/')) return `https://chainthink.cn${value}`
  return value
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function stripTags(text) {
  return String(text || '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
}

async function fetchDetail(detailId) {
  if (!detailId) return { content: '', image: '', images: [], blocks: [] }
  try {
    const page = await httpGet(`${DETAIL_URL_PREFIX}${detailId}`)
    
    // Extract coverImage from the page
    const imageMatch = page.match(/"coverImage":"([^"]+)"/)
    const mainImage = normalizeImage(imageMatch?.[1] || '')
    
    let content = ''
    let images = []
    let blocks = []
    
    // Method 1: Try to extract from rich_text_content div
    const richContentMatch = page.match(/<div class="[^"]*rich_text_content[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<div class="/)
    if (richContentMatch) {
      const htmlContent = richContentMatch[1]
      
      // Split by p tags but keep img tags in between
      const segments = htmlContent.split(/(<p[^>]*>[\s\S]*?<\/p>)/gi)
      
      segments.forEach(segment => {
        if (!segment.trim()) return
        
        // Check if this segment has an image
        let imgUrl = null
        const imgMatch = segment.match(/<img[^>]*src="([^"]+)"[^>]*>/i)
        if (imgMatch) {
          let url = imgMatch[1]
          if (url.startsWith('//')) url = 'https:' + url
          else if (url.startsWith('/')) url = 'https://chainthink.cn' + url
          if (url && !url.includes('data:')) {
            imgUrl = url
            images.push(url)
          }
        }
        
        // Extract text content
        let text = segment.replace(/<[^>]+>/g, ' ')
        text = text.replace(/&nbsp;/g, ' ')
        text = text.replace(/&amp;/g, '&')
        text = text.replace(/&quot;/g, '"')
        text = text.replace(/&#39;/g, "'")
        text = text.replace(/&lt;/g, '<')
        text = text.replace(/&gt;/g, '>')
        text = text.replace(/\s+/g, ' ').trim()
        
        if (text.length > 10 || imgUrl) {
          blocks.push({ text, image: imgUrl })
        }
      })
    }
    
    // Method 2: Fallback to initDetalis if method 1 failed
    if (blocks.length === 0) {
      const initDetalisMatch = page.match(/"initDetalis":(\{[\s\S]*?\}])\}\}\}/)
      if (initDetalisMatch) {
        try {
          const initData = JSON.parse('{' + initDetalisMatch[1] + '}}')
          if (initData?.info?.text) {
            content = stripTags(initData.info.text)
          }
        } catch {}
      }
    }
    
    // If we have images in content, also add cover image
    if (mainImage && !images.includes(mainImage)) {
      images.unshift(mainImage)
    }
    
    return {
      content,
      image: mainImage,
      images: images,
      blocks: blocks
    }
  } catch (err) {
    console.error('fetchDetail error:', err.message)
    return { content: '', image: '', images: [], blocks: [] }
  }
}

async function buildItems(payloadText, limit, withDetail) {
  const latest = extractJsonObjectAfterKey(payloadText, '"initialLatestData"')
  const items = Array.isArray(latest.list) ? latest.list : []
  const results = []

  for (const item of items.slice(0, limit)) {
    const info = item?.info || {}
    const articleId = String(item?.id || '')
    const title = String(info?.title || '').trim()
    if (!title) continue
    if (['ChainThink链智库', 'ChainThink', '链智库'].some(word => title.includes(word))) continue

    const result = {
      id: articleId,
      title,
      summary: String(info?.abstract || '').trim(),
      time: formatPublishTime(item?.publishTime),
      published_at: item?.publishTime || null,
      url: articleId ? `${DETAIL_URL_PREFIX}${articleId}` : LIST_URL,
      tags: Array.isArray(item?.contentTags) ? item.contentTags.map(tag => tag?.tagName).filter(Boolean) : [],
      isImportant: Boolean(item?.isGood),
      coverImage: normalizeImage(info?.coverImage || ''),
      content: '',
      source: 'ChainThink',
    }

    if (withDetail && articleId) {
      const detail = await fetchDetail(articleId)
      if (detail.image && !result.coverImage) result.coverImage = detail.image
      if (detail.content) result.content = detail.content
      if (detail.images && detail.images.length > 0) result.images = detail.images
      if (detail.blocks && detail.blocks.length > 0) result.blocks = detail.blocks
      await sleep(200)
    }

    results.push(result)
  }

  return results
}

async function main() {
  const { limit, withDetail } = parseArgs()
  const htmlText = await httpGet(LIST_URL)
  const payload = decodeNextFPayload(htmlText)
  const items = await buildItems(payload, limit, withDetail)

  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true })
  const output = {
    success: true,
    source: 'node-chainthink-scraper',
    generatedAt: new Date().toISOString(),
    count: items.length,
    data: items,
  }
  await fs.writeFile(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf8')
  console.log(`saved: ${OUTPUT_PATH}`)
  console.log(`count: ${items.length}`)
}

main().catch(err => {
  console.error(`error: ${err.message}`)
  process.exit(1)
})
