/**
 * API 缓存工具
 * 确保数据获取的前提下进行速率优化
 */

const CACHE_TTL = 5 * 60 * 1000 // 5分钟缓存

class ApiCache {
  constructor() {
    this.cache = new Map()
  }

  get(key) {
    const item = this.cache.get(key)
    if (!item) return null
    
    if (Date.now() - item.timestamp > CACHE_TTL) {
      this.cache.delete(key)
      return null
    }
    
    return item.data
  }

  set(key, data) {
    // 不缓存null或undefined
    if (data == null) return
    
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  clear() {
    this.cache.clear()
  }

  remove(key) {
    this.cache.delete(key)
  }
}

export const apiCache = new ApiCache()

/**
 * 带缓存的fetch封装
 * 数据获取失败时会抛出异常，不返回缓存（除非明确指定）
 */
export async function cachedFetch(url, options = {}, cacheKey = null) {
  const key = cacheKey || url
  
  // 尝试从缓存获取（仅在未明确要求强制刷新时）
  const cached = apiCache.get(key)
  if (cached && !options.forceRefresh) {
    return cached
  }

  // 发起请求
  const response = await fetch(url, options)
  if (!response.ok) {
    throw new Error(`API错误: ${response.status}`)
  }

  const data = await response.json()
  
  // 存入缓存
  apiCache.set(key, data)
  
  return data
}
