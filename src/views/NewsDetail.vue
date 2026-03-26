<template>
  <div class="news-detail-container">
    <!-- 精美顶部导航 -->
    <header class="bg-gradient-to-r from-orange-500 to-amber-400 sticky top-0 z-50 shadow-lg shadow-orange-200/50">
      <div class="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <router-link to="/news" class="flex items-center gap-2 text-white hover:text-orange-50 transition">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          <span class="font-medium hidden sm:inline">返回资讯</span>
        </router-link>
        <router-link to="/" class="flex items-center gap-2">
          <img src="/src/assets/bsj.png" class="w-8 h-8 rounded-full ring-2 ring-white/50">
          <span class="font-bold text-white hidden sm:block drop-shadow-sm">比特视界</span>
        </router-link>
        <div class="w-20"></div>
      </div>
    </header>

    <!-- 资讯详情 -->
    <main class="news-content px-4 sm:px-6" v-if="article">
      <div class="news-header">
        <span class="news-category text-xs sm:text-sm" :class="article.tagClass">{{ article.tag }}</span>
        <h1 class="news-title text-xl sm:text-2xl lg:text-3xl">{{ contentData.title || article.title }}</h1>
        <div class="news-meta flex flex-wrap gap-2 sm:gap-4">
          <span class="meta-item text-xs sm:text-sm">{{ article.time }}</span>
          <span class="meta-item text-xs sm:text-sm hidden sm:inline">{{ article.source }}</span>
          <span class="meta-item text-xs sm:text-sm">阅读 {{ article.views }}</span>
        </div>
      </div>
      
      <!-- 封面图 -->
      <div class="news-image" v-if="article.image || contentData.image">
        <img :src="article.image || contentData.image" :alt="contentData.title || article.title">
      </div>
      
      <div class="news-body">
        <!-- 加载状态 -->
        <div v-if="contentLoading" class="loading-content">
          <div class="spinner-small"></div>
          <p class="text-sm">正在加载文章内容...</p>
        </div>
        
        <!-- 文章正文 -->
        <div v-else-if="contentData.content" class="article-content">
          <p class="content-text text-sm sm:text-base">{{ contentData.content }}</p>
        </div>
        
        <!-- 无内容 -->
        <div v-else class="no-content">
          <p>暂无详细内容</p>
        </div>
        
        <div class="news-tags mt-4" v-if="article.tag">
          <span class="tag-item text-xs" :class="article.tagClass">{{ article.tag }}</span>
        </div>
        
        <a :href="article.url" target="_blank" class="read-original-btn text-sm sm:text-base">
          阅读原文 →
        </a>
      </div>
    </main>
    
    <!-- 无数据 -->
    <main class="news-content px-4" v-else-if="!loading">
      <div class="news-header">
        <h1 class="news-title text-xl">资讯不存在</h1>
        <p class="news-meta">该资讯可能已被移除或不存在</p>
      </div>
      <router-link to="/news" class="back-home-btn">
        返回资讯列表
      </router-link>
    </main>
    
    <!-- 加载状态 -->
    <div class="loading" v-if="loading">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { fetchArticleContent, getNavigationArticle, getArticleById } from '../stores/newsStore'

const route = useRoute()
const article = ref(null)
const contentData = ref({ content: '', image: '' })
const loading = ref(true)
const contentLoading = ref(false)

const loadArticle = async () => {
  loading.value = true
  contentLoading.value = false
  article.value = null
  contentData.value = { content: '', image: '' }

  // 1. 先尝试从导航数据获取（列表页传递）
  const navArticle = getNavigationArticle()
  if (navArticle) {
    article.value = navArticle
    // 并行加载文章内容
    contentLoading.value = true
    fetchArticleContent(navArticle.url).then(result => {
      contentData.value = result
      contentLoading.value = false
    }).catch(() => {
      contentData.value = { content: '暂无详细内容，请点击阅读原文查看', image: '' }
      contentLoading.value = false
    })
  }

  // 2. 从store获取（缓存）
  if (!article.value) {
    const storeArticle = getArticleById(route.params.id)
    if (storeArticle) {
      article.value = storeArticle
      contentLoading.value = true
      fetchArticleContent(storeArticle.url).then(result => {
        contentData.value = result
        contentLoading.value = false
      }).catch(() => {
        contentData.value = { content: '暂无详细内容，请点击阅读原文查看', image: '' }
        contentLoading.value = false
      })
    }
  }

  loading.value = false
}

onMounted(() => {
  loadArticle()
})

watch(() => route.params.id, () => {
  loadArticle()
})
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }

.news-detail-container {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f9fafb, #ffffff);
}

:root {
  --primary: #F7931A;
  --slate-50: #F8FAFC;
  --slate-100: #F1F5F9;
  --slate-200: #E2E8F0;
  --slate-400: #94A3B8;
  --slate-500: #64748B;
  --slate-700: #334155;
  --slate-800: #1E293B;
  --white: #FFFFFF;
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --radius-md: 10px;
}

body {
  font-family: 'Inter', -apple-system, sans-serif;
  background: var(--slate-50);
  color: var(--slate-800);
  font-size: 15px;
  line-height: 1.7;
}

.news-detail-container { min-height: 100vh; }

.navbar {
  background: var(--white);
  border-bottom: 1px solid var(--slate-200);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: var(--shadow-sm);
}

.navbar-inner {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.navbar-brand { display: flex; align-items: center; gap: 12px; text-decoration: none; }
.brand-icon { width: 36px; height: 36px; }
.brand-name { font-size: 22px; font-weight: 700; background: linear-gradient(135deg, var(--primary), #E8850C); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

.back-link { color: var(--primary); text-decoration: none; font-weight: 500; padding: 8px 16px; background: rgba(247,147,26,0.1); border-radius: var(--radius-md); }
.back-link:hover { background: rgba(247,147,26,0.2); }

.news-content { max-width: 900px; margin: 0 auto; padding: 16px 0 32px 0; }
.news-header { margin-bottom: 16px; }

.news-category {
  display: inline-block;
  padding: 4px 10px;
  background: var(--primary);
  color: white;
  font-size: 12px;
  font-weight: 600;
  border-radius: 6px;
  margin-bottom: 12px;
}

.news-title { font-size: 20px; font-weight: 700; line-height: 1.4; margin-bottom: 12px; color: var(--slate-800); }

.news-meta {
  display: flex;
  gap: 12px;
  color: var(--slate-500);
  font-size: 14px;
}

.news-image {
  margin-bottom: 20px;
  border-radius: var(--radius-md);
  overflow: hidden;
}

.news-image img {
  width: 100%;
  max-height: 300px;
  object-fit: cover;
}

.news-body {
  background: var(--white);
  border: 1px solid var(--slate-200);
  border-radius: var(--radius-md);
  padding: 16px;
  box-shadow: var(--shadow-sm);
}

@media (min-width: 640px) {
  .news-content { padding: 24px 0 40px 0; }
  .news-header { margin-bottom: 24px; }
  .news-title { font-size: 24px; margin-bottom: 16px; }
  .news-meta { gap: 20px; }
  .news-image { margin-bottom: 24px; }
  .news-image img { max-height: 400px; }
  .news-body { padding: 24px; }
}

@media (min-width: 1024px) {
  .news-content { padding: 32px 0 48px 0; }
  .news-title { font-size: 28px; }
  .news-category { padding: 4px 12px; margin-bottom: 16px; }
  .news-body { padding: 32px; }
}

.loading-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 0;
  color: var(--slate-500);
}

.spinner-small {
  width: 20px;
  height: 20px;
  border: 2px solid var(--slate-200);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.article-content {
  margin-bottom: 20px;
}

.content-text {
  color: var(--slate-700);
  line-height: 1.9;
  white-space: pre-wrap;
  word-break: break-word;
}

.no-content {
  color: var(--slate-400);
  padding: 20px 0;
}

.news-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.tag-item {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.read-original-btn {
  display: inline-block;
  padding: 12px 24px;
  background: var(--primary);
  color: white;
  text-decoration: none;
  font-weight: 600;
  border-radius: var(--radius-md);
  transition: background 0.2s;
}
.read-original-btn:hover { background: #E8850C; }

.back-home-btn {
  display: inline-block;
  margin-top: 20px;
  padding: 12px 24px;
  background: var(--slate-200);
  color: var(--slate-700);
  text-decoration: none;
  font-weight: 500;
  border-radius: var(--radius-md);
}

.loading { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; color: var(--slate-500); }
.spinner { width: 40px; height: 40px; border: 3px solid var(--slate-200); border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 16px; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 768px) { .news-title { font-size: 22px; } }
</style>
