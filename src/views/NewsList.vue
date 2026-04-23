<template>
  <div class="min-h-screen bg-[#0f0f1a]">
    <!-- 精美横幅 -->
    <header class="page-banner">
      <div class="banner-inner">
        <div class="banner-icon-wrap">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 12h10"/>
          </svg>
        </div>
        <div class="banner-text">
          <h1 class="banner-title">加密货币资讯</h1>
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

        <!-- 新内容提示 -->
        <div v-if="newCount > 0" class="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-center cursor-pointer hover:bg-yellow-500/20 transition" @click="showNewPosts">
          <span class="text-sm text-yellow-400 font-medium">📰 {{ newCount }} 条新资讯，点击展开</span>
        </div>

        <!-- 新闻列表 -->
        <div class="news-list">
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
                  <span class="card-badge">资讯</span>
                </div>
                <div class="card-body-row" :class="{ 'has-image': item.image }">
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
                  <div v-if="item.image" class="card-thumb">
                    <img :src="item.image" :alt="item.title" loading="lazy" @error="onImageError(item.id, $event)" />
                  </div>
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
            <h3 class="sidebar-title">热门资讯</h3>
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
import { ref, onMounted, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import { fetchNewsList, setNavigationArticle } from '../stores/newsStore'

const router = useRouter()
const newsList = ref([])
const hotNews = ref([])
const loading = ref(true)
const imageErrors = ref({})
const newCount = ref(0)

let initialized = false

const loadNews = async (forceRefresh = false) => {
  try {
    // 首次加载才显示loading动画，后续静默检查新内容
    if (newsList.value.length === 0) {
      loading.value = true
    }

    const result = await fetchNewsList(forceRefresh)
    const newArticles = result.articles || []

    if (newsList.value.length === 0) {
      // 首次加载，正常赋值
      newsList.value = newArticles
    } else if (forceRefresh) {
      // 后续刷新：对比找出真正的新内容
      const existingIds = new Set(newsList.value.map(i => i.id))
      const incoming = newArticles.filter(i => !existingIds.has(i.id))
      newCount.value = incoming.length

      if (incoming.length > 0) {
        newsList.value = [...incoming, ...newsList.value]
      }
    }

    hotNews.value = result.hotNews || []
  } catch (err) {
    console.error('加载新闻失败:', err)
  } finally {
    loading.value = false
  }
}

const showNewPosts = () => {
  newCount.value = 0
}

// 下拉刷新
const handleRefresh = () => {
  newCount.value = 0
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
  initialized = true
})

// keep-alive 激活时刷新数据
onActivated(() => {
  if (initialized) {
    loadNews(true)
  }
})
</script>

<style scoped>
* { margin: 0; padding: 0; box-sizing: border-box; }

/* ===== 页面横幅 ===== */
.page-banner {
  background: linear-gradient(to right, rgba(251,158,81,0.05) 0%, rgba(251,158,81,0.15) 35%, rgba(251,158,81,0.15) 50%, rgba(251,158,81,0.15) 65%, rgba(251,158,81,0.05) 100%);
  border-bottom: 1px solid rgba(251,158,81,0.2);
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
  background: rgba(251,158,81,0.1);
  border: 1px solid rgba(251,158,81,0.3);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotate(3deg);
  flex-shrink: 0;
}

.banner-icon-wrap svg {
  width: 28px;
  height: 28px;
  color: #fb9e51;
}

.banner-text {
  flex: 1;
}

.banner-title {
  font-size: 20px;
  font-weight: 700;
  color: #fb9e51;
  text-shadow: 0 1px 4px rgba(251,158,81,0.2);
}

.banner-sub {
  font-size: 13px;
  color: #8b7355;
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
  background: linear-gradient(180deg, #fb9e51, #d4881e);
  border-radius: 2px;
}

.header-title {
  font-size: 18px;
  font-weight: 700;
  color: #e5c87a;
}

.header-count {
  font-size: 12px;
  color: #8b7355;
  background: rgba(251,158,81,0.08);
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
  border-top: 1px solid rgba(251,158,81,0.08);
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
  background: rgba(251,158,81,0.08);
  border: 1px solid rgba(251,158,81,0.15);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-time {
  font-size: 12px;
  font-weight: 600;
  color: #fb9e51;
}

.item-line {
  width: 1px;
  flex: 1;
  background: linear-gradient(180deg, rgba(251,158,81,0.4), transparent);
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
  background: #1a1a2e;
  border: 1px solid rgba(251,158,81,0.12);
  border-radius: 16px;
  padding: 18px;
  transition: all 0.25s ease;
  box-shadow: 0 1px 4px rgba(0,0,0,0.2);
}

.news-item:hover .item-card {
  border-color: rgba(251,158,81,0.4);
  box-shadow: 0 4px 16px rgba(251,158,81,0.1);
  transform: translateX(4px);
}

.card-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;
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
  background: #16162a;
  border: 1px solid rgba(251,158,81,0.1);
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
  color: #fb9e51;
  background: rgba(251,158,81,0.1);
  padding: 3px 10px;
  border-radius: 4px;
  border: 1px solid rgba(251,158,81,0.2);
}

.card-source {
  font-size: 12px;
  color: #8b7355;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #d4d0c8;
  line-height: 1.6;
  margin-bottom: 8px;
}

.news-item:hover .card-title {
  color: #fb9e51;
}

.card-desc {
  font-size: 13px;
  color: #8b8b8b;
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
  color: #fb9e51;
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
  background: #1a1a2e;
  border: 1px solid rgba(251,158,81,0.12);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  background: rgba(251,158,81,0.05);
  border-bottom: 1px solid rgba(251,158,81,0.08);
}

.sidebar-icon {
  font-size: 18px;
}

.sidebar-title {
  font-size: 14px;
  font-weight: 700;
  color: #fb9e51;
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
}

.hot-item:hover {
  background: rgba(251,158,81,0.05);
}

.hot-item + .hot-item {
  border-top: 1px solid rgba(251,158,81,0.06);
}

.hot-rank {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #8b7355;
  background: rgba(251,158,81,0.06);
  border-radius: 6px;
  flex-shrink: 0;
}

.hot-rank.top {
  color: #fb9e51;
  background: rgba(251,158,81,0.12);
}

.hot-content {
  flex: 1;
  min-width: 0;
}

.hot-title {
  font-size: 13px;
  font-weight: 500;
  color: #b0a88a;
  line-height: 1.5;
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.2s;
}

.hot-item:hover .hot-title {
  color: #fb9e51;
}

.hot-source {
  font-size: 11px;
  color: #8b7355;
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
  background: rgba(251,158,81,0.04);
  border: 1px solid rgba(251,158,81,0.1);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.category-item:hover {
  background: rgba(251,158,81,0.08);
  border-color: rgba(251,158,81,0.25);
  transform: translateY(-2px);
}

.cat-icon {
  font-size: 20px;
}

.cat-name {
  font-size: 12px;
  font-weight: 600;
  color: #b0a88a;
}

.category-item:hover .cat-name {
  color: #fb9e51;
}

/* ===== 加载状态 ===== */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  gap: 16px;
  color: #8b7355;
}

.loading-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid rgba(251,158,81,0.1);
  border-top-color: #fb9e51;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* ===== 空状态 ===== */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #8b7355;
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