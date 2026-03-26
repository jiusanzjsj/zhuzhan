<template>
  <div class="news-detail-container">
    <!-- 顶部导航 -->
    <header class="navbar">
      <div class="navbar-inner">
        <router-link to="/" class="navbar-brand">
          <div class="brand-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" fill="#F7931A"/>
              <text x="16" y="21" text-anchor="middle" fill="white" font-size="14" font-weight="bold">₿</text>
            </svg>
          </div>
          <span class="brand-name">528BTC</span>
        </router-link>
        
        <div class="navbar-end">
          <router-link to="/" class="back-link">
            ← 返回资讯
          </router-link>
        </div>
      </div>
    </header>

    <!-- 资讯详情 -->
    <main class="news-content" v-if="article">
      <div class="news-header">
        <span class="news-category" :class="article.tagClass">{{ article.tag }}</span>
        <h1 class="news-title">{{ article.title }}</h1>
        <div class="news-meta">
          <span class="meta-item">🕐 {{ article.time }}</span>
          <span class="meta-item">📰 {{ article.source }}</span>
        </div>
      </div>
      
      <!-- 封面图 -->
      <div class="news-image" v-if="article.image">
        <img :src="article.image" :alt="article.title">
      </div>
      
      <div class="news-body">
        <p class="news-description">{{ article.description }}</p>
        <p class="news-tip">📖 阅读全文请点击下方链接</p>
        <a :href="article.url" target="_blank" class="read-original-btn">
          阅读原文 →
        </a>
      </div>
    </main>
    
    <!-- 无数据 -->
    <main class="news-content" v-else>
      <div class="news-header">
        <h1 class="news-title">资讯不存在</h1>
        <p class="news-meta">该资讯可能已被移除或不存在</p>
      </div>
      <router-link to="/" class="back-home-btn">
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
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useNewsStore } from '@/stores/newsStore'

const route = useRoute()
const newsStore = useNewsStore()
const article = ref(null)
const loading = ref(true)

onMounted(() => {
  const newsId = route.params.id
  article.value = newsStore.getArticleById(newsId) || null
  loading.value = false
})
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }

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

.news-content { max-width: 900px; margin: 0 auto; padding: 32px 24px; }
.news-header { margin-bottom: 24px; }

.news-category {
  display: inline-block;
  padding: 4px 12px;
  background: var(--primary);
  color: white;
  font-size: 12px;
  font-weight: 600;
  border-radius: 6px;
  margin-bottom: 16px;
}

.news-title { font-size: 28px; font-weight: 700; line-height: 1.4; margin-bottom: 16px; }

.news-meta {
  display: flex;
  gap: 20px;
  color: var(--slate-500);
  font-size: 14px;
}

.news-image {
  margin-bottom: 24px;
  border-radius: var(--radius-md);
  overflow: hidden;
}

.news-image img {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
}

.news-body {
  background: var(--white);
  border: 1px solid var(--slate-200);
  border-radius: var(--radius-md);
  padding: 32px;
  box-shadow: var(--shadow-sm);
}

.news-description { color: var(--slate-700); margin-bottom: 20px; line-height: 1.8; }
.news-tip { color: var(--slate-400); font-size: 14px; margin-bottom: 20px; }

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
