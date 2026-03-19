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
            ← 返回行情
          </router-link>
        </div>
      </div>
    </header>

    <!-- 资讯详情 -->
    <main class="news-content" v-if="news">
      <div class="news-header">
        <span class="news-category">{{ news.tag }}</span>
        <h1 class="news-title">{{ news.title }}</h1>
        <div class="news-meta">
          <span class="meta-item">🕐 {{ news.time }}</span>
          <a :href="news.url" target="_blank" class="meta-link">阅读原文 →</a>
        </div>
      </div>
      
      <div class="news-body">
        <p class="news-intro">📰 来自 {{ news.tag }} 的热门资讯</p>
        <p class="news-tip">点击上方"阅读原文"查看完整内容</p>
      </div>
    </main>
    
    <!-- 加载状态 -->
    <div class="loading" v-else>
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const news = ref(null)

const newsData = {
  1: { id: 1, tag: 'BTC', title: '比特币突破历史新高，牛市能否持续？', time: '2小时前', url: 'https://www.theblockbeats.info/news/61520' },
  2: { id: 2, tag: 'DeFi', title: 'DeFi锁仓量突破500亿美元', time: '4小时前', url: 'https://www.theblockbeats.info/news/61519' },
  3: { id: 3, tag: 'ETH', title: '以太坊Gas费用骤降，用户体验大幅提升', time: '6小时前', url: 'https://www.theblockbeats.info/news/61518' },
  4: { id: 4, tag: 'ETF', title: 'SEC批准现货ETF，市场流动性显著增强', time: '8小时前', url: 'https://www.theblockbeats.info/news/61517' },
  5: { id: 5, tag: '分析', title: '山寨季来临：哪些赛道值得关注？', time: '10小时前', url: 'https://www.theblockbeats.info/news/61516' },
  6: { id: 6, tag: 'SOL', title: 'Solana网络活动创新高', time: '12小时前', url: 'https://www.theblockbeats.info/news/61515' },
}

onMounted(() => {
  const newsId = route.params.id
  news.value = newsData[newsId] || {
    id: newsId,
    tag: 'Crypto',
    title: '资讯详情',
    time: '',
    url: 'https://www.theblockbeats.info'
  }
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
.news-header { margin-bottom: 32px; }

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

.meta-link { color: var(--primary); text-decoration: none; }
.meta-link:hover { text-decoration: underline; }

.news-body {
  background: var(--white);
  border: 1px solid var(--slate-200);
  border-radius: var(--radius-md);
  padding: 32px;
  box-shadow: var(--shadow-sm);
}

.news-intro { color: var(--slate-700); margin-bottom: 16px; }
.news-tip { color: var(--slate-400); font-size: 14px; }

.loading { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; color: var(--slate-500); }
.spinner { width: 40px; height: 40px; border: 3px solid var(--slate-200); border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 16px; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 768px) { .news-title { font-size: 22px; } }
</style>
