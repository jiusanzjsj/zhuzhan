<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-50 to-white">
    <!-- 精美横幅 -->
    <header class="page-banner">
      <div class="banner-inner">
        <div class="banner-icon-wrap">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 12h10"/>
          </svg>
        </div>
        <div class="banner-text">
          <h1 class="banner-title">加密货币快讯</h1>
          <p class="banner-sub">追踪最新加密货币行业动态</p>
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
          <!-- 页面级别调试 -->
          <div style="background: magenta; color: white; padding: 10px; margin: 10px 0;">
            DEBUG: newsList.length = {{ newsList.length }}
          </div>
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
                  <span v-if="debugMode" class="debug-pill">{{ item.image ? '有image' : '无image' }}</span>
                  <span v-if="debugMode && imageErrors[item.id]" class="debug-pill debug-pill-error">图片加载失败</span>
                </div>
                <div class="card-body-row" :class="{ 'has-image': item.image }">
                  <!-- 调试信息：确保这一行显示 -->
                  <div style="background: yellow; padding: 5px; font-size: 12px;">
                    DEBUG: image = {{ item.image ? '有值:' + item.image : '空' }}
                  </div>
                  <div class="card-body-main">
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
                  <div class="card-thumb" :style="{ display: item.image ? 'block' : 'none' }">
                    <!-- 测试用硬编码图片 -->
                    <img src="https://cos.chainthink.cn/101_admin_file/890604557265726264/890604557265726264.png" alt="test" style="width: 100%; height: 100%; object-fit: cover; border: 3px solid red;" />
                    <!-- 实际图片 -->
                    <img v-if="false" :src="item.image || ''" :alt="item.title" loading="lazy" @error="onImageError(item.id, $event)" style="width: 100%; height: 100%; object-fit: cover;" />
                  </div>
                </div>
                <div v-if="debugMode" class="debug-box">
                  <div><strong>id:</strong> {{ item.id }}</div>
                  <div><strong>image:</strong> {{ item.image || '空' }}</div>
                  <div><strong>source:</strong> {{ item.source || '空' }}</div>
                  <div><strong>load:</strong> {{ imageErrors[item.id] ? 'error' : 'pending/ok' }}</div>
                </div>
              </div>
            </div>
          </div>
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
const debugMode = ref(true)
const imageErrors = ref({})

const loadNews = async (forceRefresh = false) => {
  try {
    loading.value = true
    const result = await fetchNewsList(forceRefresh)
    newsList.value = result.articles || []
    hotNews.value = result.hotNews || []
    console.log('[NewsList] loaded newsList:', newsList.value.length, 'items')
    console.log('[NewsList] first item image:', newsList.value[0]?.image)
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

const onImageError = (id, event) => {
  imageErrors.value = {
    ...imageErrors.value,
    [id]: true
  }
  if (event?.target) {
    event.target.style.display = 'none'
  }
}

onMounted(() => {
  loadNews(true)
})
</script>

<style scoped>
* { margin: 0; padding: 0; box-sizing: border-box; }

/* ===== 页面横幅 ===== */
.page-banner {
  background: linear-gradient(to right, #FFF8F0 0%, #FB9E51 35%, #FB9E51 50%, #FB9E51 65%, #FFF8F0 100%) !important;
  box-shadow: 0 4px 16px rgba(251, 158, 81, 0.12) !important;
}

.banner-inner {
  max-width: 1152px;
  margin: 0 auto;
  padding: 20px 16px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.banner-icon-wrap {
  width: 56px;
  height: 56px;
  background: #ffffff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(251, 158, 81, 0.15);
  transform: rotate(3deg);
  flex-shrink: 0;
}

.banner-icon-wrap svg {
  width: 28px;
  height: 28px;
  color: #FB9E51;
}

.banner-text {
  flex: 1;
}

.banner-title {
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  text-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.banner-sub {
  font-size: 13px;
  color: #FFF8F0;
  margin-top: 2px;
}

/* ===== 主布局 ===== */
.main-layout {
  max-width: 1152px;
  margin: 0 auto;
  padding: 24px 16px;
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
  gap: 12px;
  margin-bottom: 20px;
}

.header-line {
  width: 4px;
  height: 24px;
  background: linear-gradient(180deg, #FB9E51, #FB9E51, #FB9E51);
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
  background: #FFF8F0;
  padding: 3px 10px;
  border-radius: 10px;
}

/* ===== 新闻列表 ===== */
.news-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.news-item {
  display: flex;
  gap: 20px;
  padding: 16px 0;
  cursor: pointer;
}

.news-item + .news-item {
  border-top: 1px solid #FFF8F0;
}

.item-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding-top: 4px;
}

.item-time-box {
  width: 70px;
  height: 32px;
  background: #FFF8F0;
  border: 1px solid #FFF8F0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-time {
  font-size: 12px;
  font-weight: 600;
  color: #FB9E51;
}

.item-line {
  width: 1px;
  flex: 1;
  background: linear-gradient(180deg, #FB9E51, transparent);
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
  background: #ffffff;
  border: 1px solid #FFF8F0;
  border-radius: 16px;
  padding: 18px;
  transition: all 0.25s ease;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}

.news-item:hover .item-card {
  border-color: #FB9E51;
  box-shadow: 0 4px 16px rgba(249,115,22,0.08);
  transform: translateX(4px);
}

.card-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.debug-pill {
  font-size: 11px;
  color: #0f766e;
  background: #ecfeff;
  border: 1px solid #a5f3fc;
  padding: 2px 8px;
  border-radius: 999px;
}

.debug-pill-error {
  color: #b91c1c;
  background: #fef2f2;
  border-color: #fecaca;
}

.debug-box {
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  font-size: 11px;
  line-height: 1.6;
  color: #475569;
  word-break: break-all;
}

.card-body-row {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.card-body-main {
  flex: 1;
  min-width: 0;
}

.card-thumb {
  width: 140px;
  height: 96px;
  flex-shrink: 0;
  border-radius: 12px;
  overflow: hidden;
  background: #f3f4f6;
  border: 5px solid blue;
}

.card-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.card-badge {
  font-size: 11px;
  font-weight: 600;
  color: #ffffff;
  background: linear-gradient(to right, #FB9E51, #FB9E51, #FB9E51);
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
  color: #FB9E51;
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
  color: #FB9E51;
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
  width: 300px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sidebar-card, .category-card {
  background: #ffffff;
  border: 1px solid #FFF8F0;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  background: linear-gradient(to right, #FB9E51, #FB9E51, #FB9E51);
}

.sidebar-icon {
  font-size: 18px;
}

.sidebar-title {
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
}

/* ===== 热门榜单 ===== */
.hot-list {
  padding: 4px 0;
}

.hot-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s;
  border-radius: 0;
}

.hot-item:hover {
  background: #FFF8F0;
}

.hot-item + .hot-item {
  border-top: 1px solid #FFF8F0;
}

.hot-rank {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #999;
  background: #FFF8F0;
  border-radius: 6px;
  flex-shrink: 0;
}

.hot-rank.top {
  color: #ffffff;
  background: linear-gradient(to right, #FB9E51, #FB9E51, #FB9E51);
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
  color: #FB9E51;
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
  background: #FFF8F0;
  border: 1px solid #FFF8F0;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.category-item:hover {
  background: #FFF8F0;
  border-color: #FFF8F0;
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

.category-item:hover .cat-name {
  color: #FB9E51;
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
  border: 3px solid #FFF8F0;
  border-top-color: #FB9E51;
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

  .card-body-row {
    flex-direction: column;
  }

  .card-thumb {
    width: 100%;
    height: 180px;
  }
}
</style>
