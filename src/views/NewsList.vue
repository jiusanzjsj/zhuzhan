<template>
  <div class="news-page">
    <!-- 顶部导航 -->
    <header class="top-nav">
      <div class="nav-inner">
        <div class="nav-left">
          <span class="nav-icon">📰</span>
          <span class="nav-title">快讯</span>
        </div>
        <div class="nav-right">
          <span class="update-badge">
            <span class="update-dot"></span>
            自动更新
          </span>
          <button @click="handleRefresh" class="refresh-btn" :disabled="loading">
            <svg class="refresh-icon" :class="{ 'spinning': loading }" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
          </button>
        </div>
      </div>
    </header>

    <!-- 主内容 -->
    <div class="main-layout">
      <!-- 左侧新闻列表 -->
      <div class="content-area">
        <!-- 标题区 -->
        <div class="section-header">
          <div class="header-line"></div>
          <h2 class="header-title">最新资讯</h2>
          <span class="header-count">{{ newsList.length }} 条</span>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading && newsList.length === 0" class="loading-state">
          <div class="loading-spinner"></div>
          <p>加载中...</p>
        </div>

        <!-- 新闻列表 -->
        <div v-else class="news-list">
          <div 
            v-for="(item, index) in newsList" 
            :key="item.id"
            @click="navigateToDetail(item)"
            class="news-item"
          >
            <div class="item-left">
              <div class="item-time-box">
                <span class="item-time">{{ item.time }}</span>
              </div>
              <div class="item-line"></div>
            </div>
            
            <div class="item-right">
              <div class="item-card">
                <div class="card-top">
                  <span class="card-badge">快讯</span>
                  <span class="card-source">{{ item.source }}</span>
                </div>
                <h3 class="card-title">{{ item.title }}</h3>
                <p class="card-desc" v-if="item.description">{{ item.description }}</p>
                <div class="card-footer">
                  <span class="read-more">
                    阅读全文
                    <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="!loading && newsList.length === 0" class="empty-state">
          <span class="empty-icon">📭</span>
          <p>暂无快讯</p>
        </div>
      </div>

      <!-- 右侧热门榜单 -->
      <aside class="sidebar">
        <div class="sidebar-card">
          <div class="sidebar-header">
            <span class="sidebar-icon">🔥</span>
            <h3 class="sidebar-title">热门快讯</h3>
          </div>
          <div class="hot-list">
            <div 
              v-for="(item, index) in hotNews" 
              :key="index"
              @click="navigateToDetail(item)"
              class="hot-item"
            >
              <span class="hot-rank" :class="{ 'top': index < 3 }">{{ index + 1 }}</span>
              <div class="hot-content">
                <p class="hot-title">{{ item.title }}</p>
                <span class="hot-source">{{ item.source }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 分类卡片 -->
        <div class="category-card">
          <div class="sidebar-header">
            <span class="sidebar-icon">📑</span>
            <h3 class="sidebar-title">分类</h3>
          </div>
          <div class="category-grid">
            <div class="category-item" @click="filterByCategory('BTC')">
              <span class="cat-icon">₿</span>
              <span class="cat-name">BTC</span>
            </div>
            <div class="category-item" @click="filterByCategory('ETH')">
              <span class="cat-icon">Ξ</span>
              <span class="cat-name">ETH</span>
            </div>
            <div class="category-item" @click="filterByCategory('DeFi')">
              <span class="cat-icon">🔄</span>
              <span class="cat-name">DeFi</span>
            </div>
            <div class="category-item" @click="filterByCategory('NFT')">
              <span class="cat-icon">🖼️</span>
              <span class="cat-name">NFT</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchNewsList, setNavigationArticle } from '../stores/newsStore'

const router = useRouter()
const newsList = ref([])
const hotNews = ref([])
const loading = ref(true)

const loadNews = async (forceRefresh = false) => {
  try {
    loading.value = true
    const result = await fetchNewsList(forceRefresh)
    newsList.value = result.articles || []
    hotNews.value = result.hotNews || []
  } catch (err) {
    console.error('加载新闻失败:', err)
  } finally {
    loading.value = false
  }
}

const handleRefresh = () => {
  loadNews(true)
}

const navigateToDetail = (item) => {
  setNavigationArticle(item)
  router.push({
    name: 'NewsDetail',
    params: { id: item.id }
  })
}

const filterByCategory = (category) => {
  // 分类筛选功能，后续扩展
  console.log('筛选:', category)
}

onMounted(() => {
  loadNews()
})
</script>

<style scoped>
* { margin: 0; padding: 0; box-sizing: border-box; }

.news-page {
  min-height: 100vh;
  background: #fafbfc;
}

/* ===== 顶部导航 ===== */
.top-nav {
  background: #fff;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
}

.nav-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 14px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.nav-icon {
  font-size: 22px;
}

.nav-title {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.update-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #52c41a;
  background: #f6ffed;
  padding: 4px 10px;
  border-radius: 20px;
  border: 1px solid #b7eb8f;
}

.update-dot {
  width: 6px;
  height: 6px;
  background: #52c41a;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.refresh-btn {
  width: 36px;
  height: 36px;
  border: 1px solid #eee;
  background: #fff;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.refresh-btn:hover:not(:disabled) {
  border-color: #f97316;
  background: #fff7ed;
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.refresh-icon {
  width: 18px;
  height: 18px;
  color: #666;
}

.refresh-icon.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ===== 主布局 ===== */
.main-layout {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  display: flex;
  gap: 24px;
}

/* ===== 左侧内容区 ===== */
.content-area {
  flex: 1;
  min-width: 0;
}

/* ===== 标题区 ===== */
.section-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.header-line {
  width: 4px;
  height: 24px;
  background: linear-gradient(180deg, #f97316, #fb923c);
  border-radius: 2px;
}

.header-title {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
}

.header-count {
  font-size: 12px;
  color: #999;
  background: #f5f5f5;
  padding: 3px 10px;
  border-radius: 10px;
}

/* ===== 新闻列表 ===== */
.news-list {
  display: flex;
  flex-direction: column;
}

.news-item {
  display: flex;
  gap: 20px;
  padding: 20px 0;
  cursor: pointer;
}

.item-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.item-time-box {
  width: 70px;
  height: 32px;
  background: #fff7ed;
  border: 1px solid #fed7aa;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-time {
  font-size: 12px;
  font-weight: 600;
  color: #f97316;
}

.item-line {
  width: 1px;
  flex: 1;
  background: linear-gradient(180deg, #fed7aa, #fee2e2);
  min-height: 20px;
}

.news-item:last-child .item-line {
  display: none;
}

.item-right {
  flex: 1;
  min-width: 0;
}

.item-card {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 18px;
  transition: all 0.25s ease;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
}

.news-item:hover .item-card {
  border-color: #f97316;
  box-shadow: 0 4px 12px rgba(249,115,22,0.1);
  transform: translateX(4px);
}

.card-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.card-badge {
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #f97316, #fb923c);
  padding: 3px 10px;
  border-radius: 4px;
}

.card-source {
  font-size: 12px;
  color: #999;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.6;
  margin-bottom: 8px;
}

.news-item:hover .card-title {
  color: #f97316;
}

.card-desc {
  font-size: 13px;
  color: #666;
  line-height: 1.7;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
}

.read-more {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
  color: #f97316;
  opacity: 0;
  transform: translateX(-5px);
  transition: all 0.2s;
}

.news-item:hover .read-more {
  opacity: 1;
  transform: translateX(0);
}

.arrow-icon {
  width: 14px;
  height: 14px;
}

/* ===== 右侧边栏 ===== */
.sidebar {
  width: 320px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sidebar-card, .category-card {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 12px;
  overflow: hidden;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px;
  border-bottom: 1px solid #f5f5f5;
  background: linear-gradient(135deg, #f97316, #fb923c);
}

.sidebar-icon {
  font-size: 18px;
}

.sidebar-title {
  font-size: 14px;
  font-weight: 700;
  color: #fff;
}

/* ===== 热门榜单 ===== */
.hot-list {
  padding: 8px 0;
}

.hot-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.hot-item:hover {
  background: #fff7ed;
}

.hot-rank {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #999;
  background: #f5f5f5;
  border-radius: 4px;
  flex-shrink: 0;
}

.hot-rank.top {
  color: #fff;
  background: linear-gradient(135deg, #f97316, #fb923c);
}

.hot-content {
  flex: 1;
  min-width: 0;
}

.hot-title {
  font-size: 13px;
  font-weight: 500;
  color: #333;
  line-height: 1.5;
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.2s;
}

.hot-item:hover .hot-title {
  color: #f97316;
}

.hot-source {
  font-size: 11px;
  color: #999;
}

/* ===== 分类 ===== */
.category-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  padding: 12px;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.category-item:hover {
  background: #fff7ed;
  transform: translateY(-2px);
}

.cat-icon {
  font-size: 20px;
}

.cat-name {
  font-size: 12px;
  font-weight: 600;
  color: #333;
}

/* ===== 加载状态 ===== */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  gap: 16px;
  color: #999;
}

.loading-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #ffe4c4;
  border-top-color: #f97316;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* ===== 空状态 ===== */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #999;
}

.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
}

/* ===== 响应式 ===== */
@media (max-width: 1024px) {
  .sidebar {
    display: none;
  }
}

@media (max-width: 640px) {
  .main-layout {
    padding: 16px;
  }
  
  .item-time-box {
    width: 60px;
    height: 28px;
  }
  
  .item-time {
    font-size: 11px;
  }
  
  .item-card {
    padding: 14px;
  }
  
  .card-title {
    font-size: 14px;
  }
}
</style>
