<template>
  <div class="flash-page">
    <div class="page-container">
      <div class="flex gap-5">
        <!-- 左侧分类 -->
        <aside class="w-40 flex-shrink-0">
          <div class="left-sidebar">
            <button 
              v-for="cat in categories" 
              :key="cat.id"
              @click="activeCategory = cat.id"
              class="cat-btn"
              :class="{ active: activeCategory === cat.id }"
            >
              {{ cat.name }}
            </button>
          </div>
        </aside>
        
        <!-- 中间内容 -->
        <main class="flex-1 min-w-0">
          <!-- 筛选栏 -->
          <div class="filter-bar">
            <div class="left">
              <label class="filter-checkbox">
                <input type="checkbox" v-model="showImportant" />
                <span class="checkmark">✓</span>
                <span>重要快讯</span>
              </label>
            </div>
            <div class="right">
              <span class="auto-refresh">
                <span class="green-dot"></span>
                自动更新
              </span>
              <span v-if="lastUpdate" class="last-update">更新: {{ lastUpdate }}</span>
            </div>
          </div>
          
          <!-- 日期 -->
          <div class="date-header">{{ currentDate }}</div>
          
          <!-- 快讯列表 -->
          <div class="news-container">
            <div 
              v-for="(item, index) in filteredNews" 
              :key="index"
              class="news-item"
              @click="openNews(item.url)"
            >
              <!-- 时间 -->
              <div class="news-time">{{ item.time }}</div>
              
              <!-- 内容 -->
              <div class="news-main">
                <h3 class="news-title">
                  <span v-if="item.isImportant" class="red-dot"></span>
                  {{ item.title }}
                </h3>
                <p class="news-summary">{{ item.summary }}</p>
                <div class="news-tags">
                  <span v-for="tag in item.tags" :key="tag" class="tag">${{ tag }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 加载更多 -->
          <div class="load-more">
            <button class="load-btn" @click="loadMore" :disabled="loading">
              查看更多
            </button>
          </div>
        </main>
        
        <!-- 右侧边栏 -->
        <aside class="w-64 flex-shrink-0">
          <!-- 链上侦探 -->
          <div class="right-block">
            <div class="block-header">
              <svg class="chain-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
              <span>链上侦探</span>
            </div>
            <div class="chain-list">
              <div v-for="item in chainNews" :key="item.time" class="chain-item" @click="openNews(item.url)">
                <span class="chain-time">{{ item.time }}</span>
                <span class="chain-title">{{ item.title }}</span>
              </div>
            </div>
          </div>
          
          <!-- 24H重要资讯 -->
          <div class="right-block">
            <div class="block-header">24H重要资讯</div>
            <div class="important-list">
              <a 
                v-for="item in importantNews" 
                :key="item.title"
                :href="'https://www.theblockbeats.info' + item.url"
                target="_blank"
                class="important-link"
              >
                {{ item.title }}
              </a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const activeCategory = ref('all')
const showImportant = ref(false)
const loading = ref(false)
const lastUpdate = ref('')
const currentDate = ref(new Date().toLocaleDateString('zh-CN'))
let refreshTimer = null

const API_BASE = '/api'

const categories = [
  { id: 'all', name: '全部' },
  { id: 'predict', name: '预测市场' },
  { id: 'ai', name: 'AI' },
  { id: 'chain', name: '链上侦探' },
  { id: 'funding', name: '融资' },
]

const newsData = ref([])
const chainNews = ref([])
const importantNews = ref([])
const displayCount = ref(10) // 当前显示数量

const filteredNews = computed(() => {
  let news = newsData.value
  // 跳过前5条数据
  news = news.slice(5)
  // 分类筛选
  if (activeCategory.value !== 'all') {
    news = news.filter(item => {
      const tags = item.tags || []
      if (activeCategory.value === 'chain') {
        return tags.includes('ETH') || tags.includes('BTC') || tags.includes('DeFi')
      }
      if (activeCategory.value === 'ai') {
        return tags.includes('AI') || tags.includes('AGIX') || tags.includes('FET')
      }
      if (activeCategory.value === 'funding') {
        return tags.includes('融资') || tags.includes('投资')
      }
      if (activeCategory.value === 'predict') {
        return tags.includes('预测') || tags.includes('Polymarket')
      }
      return true
    })
  }
  // 只显示当前数量的数据
  news = news.slice(0, displayCount.value)
  if (showImportant.value) {
    news = news.filter(item => item.isImportant)
  }
  return news
})

const openNews = (url) => {
  if (url) {
    if (url.startsWith('http')) {
      window.open(url, '_blank')
    } else {
      window.open('https://www.theblockbeats.info' + url, '_blank')
    }
  }
}

const fetchNews = async () => {
  loading.value = true
  displayCount.value = 10 // 重置显示数量
  try {
    // 获取快讯数据
    const res = await fetch(`${API_BASE}/news`)
    const data = await res.json()
    if (data.success) {
      newsData.value = data.data
    }
    
    // 获取链上侦探数据
    const chainRes = await fetch(`${API_BASE}/news/chain`)
    const chainData = await chainRes.json()
    if (chainData.success) {
      chainNews.value = chainData.data
    }
    
    // 获取重要资讯
    const impRes = await fetch(`${API_BASE}/news/important`)
    const impData = await impRes.json()
    if (impData.success) {
      importantNews.value = impData.data
    }
    
    lastUpdate.value = new Date().toLocaleTimeString('zh-CN')
  } catch (err) {
    console.error('获取快讯失败:', err)
  } finally {
    loading.value = false
  }
}

const loadMore = () => {
  displayCount.value += 10
}

// 自动刷新 - 每30秒更新一次
const startAutoRefresh = () => {
  refreshTimer = setInterval(() => {
    fetchNews()
  }, 30000) // 30秒刷新
}

onMounted(() => {
  fetchNews()
  startAutoRefresh()
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
})
</script>

<style scoped>
.flash-page {
  min-height: calc(100vh - 80px);
  background: #f7f7f7;
  padding: 20px 0;
}

.page-container {
  max-width: 1320px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 左侧分类 */
.left-sidebar {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.cat-btn {
  display: block;
  width: 100%;
  padding: 12px 16px;
  text-align: left;
  background: #fff;
  border: none;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.cat-btn:last-child {
  border-bottom: none;
}

.cat-btn:hover {
  background: #fafafa;
  color: #e45d3a;
}

.cat-btn.active {
  background: #fff3ef;
  color: #e45d3a;
  font-weight: 600;
}

/* 筛选栏 */
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 0 4px;
}

.filter-bar .left,
.filter-bar .right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.last-update {
  font-size: 12px;
  color: #999;
}

.filter-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 13px;
  color: #666;
}

.filter-checkbox input {
  display: none;
}

.checkmark {
  width: 16px;
  height: 16px;
  border: 1px solid #ddd;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: transparent;
  transition: all 0.2s;
}

.filter-checkbox input:checked + .checkmark {
  background: #e45d3a;
  border-color: #e45d3a;
  color: #fff;
}

.auto-refresh {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #999;
}

.green-dot {
  width: 6px;
  height: 6px;
  background: #52c41a;
  border-radius: 50%;
  animation: blink 2s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

/* 日期 */
.date-header {
  font-size: 13px;
  color: #999;
  margin-bottom: 12px;
  padding-left: 4px;
}

/* 消息列表容器 */
.news-container {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

/* 消息项 */
.news-item {
  display: flex;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.2s;
}

.news-item:hover {
  background: #fafafa;
}

.news-item:last-child {
  border-bottom: none;
}

.news-time {
  width: 50px;
  flex-shrink: 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.news-main {
  flex: 1;
  min-width: 0;
}

.news-title {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.news-item:hover .news-title {
  color: #e45d3a;
}

.red-dot {
  width: 6px;
  height: 6px;
  background: #e45d3a;
  border-radius: 50%;
  flex-shrink: 0;
}

.news-summary {
  font-size: 14px;
  color: #666;
  line-height: 1.7;
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-tags {
  display: flex;
  gap: 8px;
}

.tag {
  font-size: 12px;
  color: #e45d3a;
  background: #fff3ef;
  padding: 2px 8px;
  border-radius: 4px;
}

/* 右侧边栏 */
.right-block {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
}

.block-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.chain-icon {
  width: 16px;
  height: 16px;
  color: #e45d3a;
}

.chain-list {
  padding: 8px 0;
}

.chain-item {
  display: flex;
  gap: 10px;
  padding: 10px 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.chain-item:hover {
  background: #fafafa;
}

.chain-time {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
}

.chain-title {
  font-size: 13px;
  color: #333;
  line-height: 1.4;
}

.important-list {
  padding: 8px 0;
}

.important-link {
  display: block;
  padding: 10px 16px;
  font-size: 13px;
  color: #333;
  text-decoration: none;
  border-bottom: 1px solid #f8f8f8;
  transition: all 0.2s;
}

.important-link:last-child {
  border-bottom: none;
}

.important-link:hover {
  color: #e45d3a;
  background: #fafafa;
}

/* 加载更多 */
.load-more {
  margin-top: 20px;
  text-align: center;
}

.load-btn {
  padding: 10px 40px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.load-btn:hover {
  border-color: #e45d3a;
  color: #e45d3a;
}
</style>
