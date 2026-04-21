<template>
  <div class="news-detail-container">
    <!-- 顶部导航 -->
    <header class="navbar">
      <div class="navbar-inner">
        <router-link to="/" class="back-btn">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          返回
        </router-link>
        <h1 class="navbar-title">资讯详情</h1>
        <div class="navbar-right"></div>
      </div>
    </header>

    <!-- 加载状态 -->
    <div class="loading-container" v-if="loading">
      <div class="spinner"></div>
      <p class="loading-text">加载中...</p>
    </div>

    <!-- 主内容 + 侧边栏 -->
    <div class="detail-layout" v-else>
      <!-- 左侧：资讯详情 -->
      <main class="content-main" v-if="article">
        <div class="article-header">
          <span class="news-category text-xs sm:text-sm" :class="article.tagClass">{{ article.tag }}</span>
          <h1 class="news-title text-xl sm:text-2xl lg:text-3xl">{{ article.title }}</h1>
          <div class="news-meta flex flex-wrap gap-2 sm:gap-4">
            <span class="meta-item text-xs sm:text-sm">{{ article.time }}</span>
          </div>
        </div>

        <div class="news-body">
          <div v-if="article.blocks && article.blocks.length > 0" class="article-blocks">
            <div v-for="(block, idx) in article.blocks" :key="idx" class="mb-4">
              <p v-if="block.text" class="text-sm sm:text-base leading-relaxed text-slate-300 whitespace-pre-line">{{ block.text }}</p>
              <img v-if="block.image" :src="block.image" :alt="article.title + ' 图片' + (idx + 1)" class="w-full h-auto max-h-96 object-contain rounded-lg mt-2 border border-yellow-500/10" loading="lazy" />
            </div>
          </div>
          <div v-else-if="contentData.content" class="article-content">
            <p class="content-text text-sm sm:text-base whitespace-pre-line">{{ contentData.content }}</p>
          </div>
          <div v-else class="no-content"><p>暂无详细内容</p></div>
          <div class="news-tags mt-4" v-if="article.tag">
            <span class="tag-item text-xs" :class="article.tagClass">{{ article.tag }}</span>
          </div>
        </div>
      </main>

      <!-- 右侧：论坛模块 -->
      <aside class="forum-aside">
        <div class="forum-card">
          <!-- 顶部装饰条 -->
          <div class="forum-topbar">
            <div class="flex items-center gap-2">
              <div class="forum-dot bg-pink-500"></div>
              <div class="forum-dot bg-yellow-500"></div>
              <div class="forum-dot bg-green-500"></div>
            </div>
            <span class="forum-version">BITCOIN WORLD</span>
          </div>

          <!-- 标题区 -->
          <div class="forum-title-row">
            <div class="forum-title-left">
              <span class="forum-emoji">💬</span>
              <div>
                <h3 class="forum-heading">游客论坛</h3>
                <p class="forum-sub">加密世界 · 自由言论</p>
              </div>
            </div>
            <div class="forum-stat">
              <span class="stat-num">{{ filteredPosts.length }}</span>
              <span class="stat-label">评论</span>
            </div>
          </div>

          <!-- 发帖区 -->
          <div class="post-zone">
            <!-- 头像+昵称 -->
            <div class="poster-row">
              <div class="poster-avatar" :style="{ background: avatarGradient }">
                {{ currentAvatarChar }}
              </div>
              <input
                v-model="nickname"
                type="text"
                class="nick-input"
                placeholder="设置昵称..."
                maxlength="20"
              />
            </div>
            <!-- 内容框 -->
            <textarea
              v-model="newPost"
              class="post-textarea"
              :placeholder="placeholderText"
              rows="4"
              maxlength="200"
              @focus="showHints = true"
            ></textarea>
            <!-- 字数提示 -->
            <div class="char-count" :class="{ 'near-limit': newPost.length > 180 }">
              {{ newPost.length }}/200
            </div>
            <!-- 发布按钮 -->
            <button class="post-btn" @click="submitPost" :disabled="!newPost.trim()">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
              </svg>
              发布评论
            </button>
          </div>

          <!-- 分割线 -->
          <div class="section-divider">
            <span>全部评论</span>
          </div>

          <!-- 帖子列表 -->
          <div class="post-list">
            <div v-if="filteredPosts.length === 0" class="empty-posts">
              <div class="empty-glow">💭</div>
              <p>暂无评论，快来抢沙发</p>
            </div>
            <div
              v-for="post in filteredPosts"
              :key="post.id"
              class="post-item"
            >
              <!-- 头像 -->
              <div class="post-avatar" :style="{ background: getAvatarGradient(post.nickname) }">
                {{ post.nickname.slice(0, 1) }}
              </div>
              <!-- 内容 -->
              <div class="post-body">
                <div class="post-top">
                  <div class="post-user">
                    <span class="post-nickname">{{ post.nickname }}</span>
                    <span class="post-badge">游客</span>
                  </div>
                  <button class="delete-btn" @click="deletePost(post.id)" title="删除此评论">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
                <p class="post-content">{{ post.content }}</p>
                <div class="post-footer">
                  <span class="post-time">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    {{ post.time }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>

    <!-- 无数据 -->
    <main class="content-wrapper px-4" v-if="!loading && !article">
      <div class="article-header">
        <h1 class="news-title text-xl">资讯不存在</h1>
        <p class="news-meta">该资讯可能已被移除或不存在</p>
      </div>
      <router-link to="/" class="back-home-btn">返回首页</router-link>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getNavigationArticle, getArticleById } from '../stores/newsStore'
import { updatePageSeo } from '../utils/seo'

const route = useRoute()
const article = ref(null)
const contentData = ref({ content: '', image: '' })
const loading = ref(true)
const baseUrl = 'https://openupbtc.com'

// 论坛数据
const allPosts = ref([])
const newPost = ref('')
const nickname = ref('')
const showHints = ref(false)

const placeholderText = computed(() => {
  const hints = [
    '聊聊你的看法...',
    '说点什么吧...',
    '发表你的观点...',
    '留下你的足迹...'
  ]
  return hints[Math.floor(Math.random() * hints.length)]
})

const gradients = [
  'linear-gradient(135deg, #fb9e51, #d4881e)',
  'linear-gradient(135deg, #627EEA, #8c9eff)',
  'linear-gradient(135deg, #22c55e, #4ade80)',
  'linear-gradient(135deg, #ef4444, #f87171)',
  'linear-gradient(135deg, #9333ea, #c084fc)',
  'linear-gradient(135deg, #f97316, #fb923c)',
  'linear-gradient(135deg, #14b8a6, #5eead4)',
]

const getAvatarGradient = (seed) => {
  const idx = seed.charCodeAt(0) % gradients.length
  return gradients[idx]
}

const avatarGradient = computed(() => {
  return getAvatarGradient(nickname.value || 'B')
})

const currentAvatarChar = computed(() => {
  return (nickname.value || 'B').slice(0, 1).toUpperCase()
})

const STORAGE_KEY = 'bsj_forum_posts'

const loadPosts = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    allPosts.value = stored ? JSON.parse(stored) : []
  } catch {
    allPosts.value = []
  }
}

const savePosts = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allPosts.value))
}

const filteredPosts = computed(() => {
  const aid = route.params.id
  return allPosts.value
    .filter(p => p.articleId === aid)
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 20)
})

const generateNickname = () => {
  return '游客#' + Math.floor(1000 + Math.random() * 9000)
}

const deletePost = (id) => {
  allPosts.value = allPosts.value.filter(p => p.id !== id)
  savePosts()
}

const submitPost = () => {
  const content = newPost.value.trim()
  if (!content) return

  const nick = nickname.value.trim() || generateNickname()
  if (!nickname.value.trim()) nickname.value = nick

  allPosts.value.push({
    id: Date.now(),
    articleId: route.params.id,
    nickname: nick,
    content,
    timestamp: Date.now(),
    time: new Date().toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
  })

  savePosts()
  newPost.value = ''
  showHints.value = false
}

const buildDescription = (text = '') => {
  const cleaned = String(text).replace(/\s+/g, ' ').trim()
  return cleaned ? cleaned.slice(0, 120) : '查看最新加密货币资讯详情，了解区块链、比特币、以太坊等市场动态。'
}

const setNewsSeo = () => {
  const title = article.value?.title ? `${article.value.title} - 比特视界` : '资讯详情 - 比特视界'
  const description = buildDescription(contentData.value.content || article.value?.description)
  const keywords = [article.value?.title, article.value?.tag, '加密货币新闻', '区块链资讯', '比特视界'].filter(Boolean).join(',')

  updatePageSeo({
    title,
    description,
    keywords,
    image: article.value?.image || contentData.value.image || `${baseUrl}/logo.png`,
    url: `${baseUrl}/news/${route.params.id}`,
    type: 'article'
  })
}

const loadArticle = () => {
  loading.value = true
  article.value = null
  contentData.value = { content: '', image: '' }

  const navArticle = getNavigationArticle()
  if (navArticle) {
    article.value = navArticle
    contentData.value = {
      content: navArticle.content || navArticle.description || '暂无详细内容',
      image: navArticle.image || ''
    }
  }

  if (!article.value) {
    const storeArticle = getArticleById(route.params.id)
    if (storeArticle) {
      article.value = storeArticle
      contentData.value = {
        content: storeArticle.content || storeArticle.description || '暂无详细内容',
        image: storeArticle.image || ''
      }
    }
  }

  loading.value = false
  setNewsSeo()
}

onMounted(() => {
  loadPosts()
  loadArticle()
  nickname.value = generateNickname()
})

watch(() => route.params.id, () => {
  loadArticle()
})
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }

.news-detail-container {
  min-height: 100vh;
  background: #0f0f1a;
}

.detail-layout {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 20px;
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.content-main {
  flex: 1;
  min-width: 0;
}

/* ========== 论坛侧边栏 ========== */
.forum-aside {
  width: 360px;
  flex-shrink: 0;
  position: sticky;
  top: 80px;
}

.forum-card {
  background: #16162a;
  border: 1px solid rgba(251,158,81,0.12);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0,0,0,0.3);
}

/* 顶部装饰条 */
.forum-topbar {
  background: #1e1e35;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(251,158,81,0.06);
}

.forum-dot { width: 10px; height: 10px; border-radius: 50%; opacity: 0.8; }

.forum-version {
  font-size: 9px;
  letter-spacing: 2px;
  color: #4b5563;
  font-weight: 600;
}

/* 标题区 */
.forum-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  background: linear-gradient(135deg, rgba(251,158,81,0.06) 0%, rgba(251,158,81,0.02) 100%);
  border-bottom: 1px solid rgba(251,158,81,0.08);
}

.forum-title-left { display: flex; align-items: center; gap: 12px; }

.forum-emoji {
  font-size: 28px;
  filter: drop-shadow(0 2px 4px rgba(251,158,81,0.3));
}

.forum-heading { font-size: 16px; font-weight: 700; color: #fb9e51; }

.forum-sub { font-size: 11px; color: #6b5c4a; margin-top: 2px; }

.forum-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(251,158,81,0.08);
  border: 1px solid rgba(251,158,81,0.15);
  border-radius: 10px;
  padding: 6px 14px;
}

.stat-num { font-size: 18px; font-weight: 700; color: #fb9e51; line-height: 1; }
.stat-label { font-size: 10px; color: #6b5c4a; margin-top: 2px; }

/* 发帖区 */
.post-zone { padding: 14px 16px; border-bottom: 1px solid rgba(251,158,81,0.08); }

.poster-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }

.poster-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}

.nick-input {
  flex: 1;
  background: #1e1e35;
  border: 1px solid rgba(251,158,81,0.15);
  border-radius: 20px;
  padding: 7px 14px;
  font-size: 13px;
  color: #d4d0c8;
  outline: none;
  transition: border-color 0.2s;
}

.nick-input:focus { border-color: rgba(251,158,81,0.5); }
.nick-input::placeholder { color: #4b5563; }

.post-textarea {
  width: 100%;
  background: #1e1e35;
  border: 1px solid rgba(251,158,81,0.12);
  border-radius: 12px;
  padding: 12px;
  font-size: 13px;
  color: #d4d0c8;
  resize: none;
  outline: none;
  line-height: 1.7;
  transition: border-color 0.2s;
}

.post-textarea:focus { border-color: rgba(251,158,81,0.4); box-shadow: 0 0 0 3px rgba(251,158,81,0.05); }
.post-textarea::placeholder { color: #4b5563; }

.char-count { text-align: right; font-size: 11px; color: #4b5563; margin: 4px 0 8px; transition: color 0.2s; }
.char-count.near-limit { color: #ef4444; }

.post-btn {
  width: 100%;
  padding: 10px;
  background: linear-gradient(135deg, #fb9e51, #d4881e);
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  box-shadow: 0 2px 12px rgba(251,158,81,0.25);
  letter-spacing: 0.5px;
}

.post-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(251,158,81,0.35); }
.post-btn:active:not(:disabled) { transform: translateY(0); }
.post-btn:disabled { opacity: 0.35; cursor: not-allowed; box-shadow: none; }

/* 分割线 */
.section-divider {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  border-bottom: 1px solid rgba(251,158,81,0.06);
}

.section-divider::before,
.section-divider::after { content: ''; flex: 1; height: 1px; background: rgba(251,158,81,0.08); }

.section-divider span { font-size: 11px; color: #4b5563; font-weight: 500; letter-spacing: 1px; white-space: nowrap; }

/* 帖子列表 */
.post-list { max-height: 480px; overflow-y: auto; padding: 4px 0; }
.post-list::-webkit-scrollbar { width: 4px; }
.post-list::-webkit-scrollbar-track { background: transparent; }
.post-list::-webkit-scrollbar-thumb { background: rgba(251,158,81,0.2); border-radius: 2px; }

.empty-posts { display: flex; flex-direction: column; align-items: center; padding: 40px 16px; gap: 10px; }
.empty-glow { font-size: 36px; filter: drop-shadow(0 0 8px rgba(251,158,81,0.3)); }
.empty-posts p { font-size: 13px; color: #4b5563; text-align: center; }

.post-item {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  transition: background 0.15s;
}

.post-item:hover { background: rgba(251,158,81,0.025); }
.post-item + .post-item { border-top: 1px solid rgba(251,158,81,0.05); }

.post-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.25);
}

.post-body { flex: 1; min-width: 0; }

.post-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }

.post-user { display: flex; align-items: center; gap: 6px; }

.post-nickname { font-size: 13px; font-weight: 600; color: #d4d0c8; }

.post-badge {
  font-size: 9px;
  background: rgba(251,158,81,0.1);
  color: #6b5c4a;
  padding: 1px 5px;
  border-radius: 4px;
  border: 1px solid rgba(251,158,81,0.1);
}

.delete-btn {
  color: #4b5563;
  background: none;
  border: none;
  cursor: pointer;
  padding: 3px;
  border-radius: 4px;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  opacity: 0;
}

.post-item:hover .delete-btn { opacity: 1; }
.delete-btn:hover { color: #ef4444; background: rgba(239,68,68,0.1); }

.post-content {
  font-size: 13px;
  color: #9ca3af;
  line-height: 1.65;
  word-break: break-word;
  margin-bottom: 6px;
}

.post-footer { display: flex; align-items: center; }

.post-time {
  font-size: 10px;
  color: #4b5563;
  display: flex;
  align-items: center;
  gap: 3px;
}

/* ========== 原有样式保留 ========== */
.navbar {
  background: #16162a;
  border-bottom: 1px solid rgba(251,158,81,0.15);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #fb9e51;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 8px;
  transition: background 0.2s;
  background: rgba(251,158,81,0.06);
  border: 1px solid rgba(251,158,81,0.15);
}

.back-btn:hover { background: rgba(251,158,81,0.12); }

.navbar-title {
  font-size: 17px;
  font-weight: 600;
  color: #d4d0c8;
}

.navbar-right { width: 80px; }

.content-wrapper { max-width: 900px; margin: 0 auto; padding: 24px 20px 40px; }

.news-header { margin-bottom: 24px; }

.news-category {
  display: inline-block;
  padding: 4px 10px;
  background: rgba(251,158,81,0.1);
  color: #fb9e51;
  font-size: 12px;
  font-weight: 600;
  border-radius: 6px;
  border: 1px solid rgba(251,158,81,0.2);
  margin-bottom: 12px;
}

.news-title {
  font-size: 20px;
  font-weight: 700;
  line-height: 1.4;
  margin-bottom: 12px;
  color: #e5e5e5;
}

.news-meta {
  display: flex;
  gap: 12px;
  color: #6b5c4a;
  font-size: 14px;
}

.news-body {
  background: #16162a;
  border: 1px solid rgba(251,158,81,0.12);
  border-radius: 10px;
  padding: 16px;
}

.loading { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; color: #6b5c4a; }
.spinner { width: 40px; height: 40px; border: 3px solid rgba(251,158,81,0.1); border-top-color: #fb9e51; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 16px; }
.loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; color: #6b5c4a; }
.loading-text { font-size: 14px; }
.no-content { color: #6b5c4a; padding: 20px 0; }
.news-tags { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
.tag-item { padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 500; }
.back-home-btn { display: inline-block; margin-top: 20px; padding: 12px 24px; background: rgba(251,158,81,0.06); color: #fb9e51; text-decoration: none; font-weight: 500; border-radius: 10px; border: 1px solid rgba(251,158,81,0.15); }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 900px) {
  .detail-layout { flex-direction: column; }
  .forum-aside { width: 100%; position: static; }
  .post-list { max-height: 300px; }
}
</style>