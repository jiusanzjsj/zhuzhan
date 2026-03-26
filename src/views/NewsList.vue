<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-50 to-white">
    <!-- 精美横幅 -->
    <div class="bg-gradient-to-r from-orange-500 via-orange-400 to-amber-400 shadow-lg shadow-orange-200/50">
      <div class="max-w-7xl mx-auto px-4 py-5">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-orange-300/30 transform -rotate-3">
            <svg class="w-7 h-7 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
            </svg>
          </div>
          <div class="flex-1">
            <h1 class="text-xl font-bold text-white drop-shadow-sm">加密货币快讯</h1>
            <p class="text-orange-100 text-sm mt-0.5">追踪最新的行情资讯、政策动态和技术进展</p>
          </div>
          <div class="hidden sm:flex items-center gap-2">
            <span class="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg text-white text-xs font-medium">
              📰 每日更新
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 py-4 sm:py-8">
      <!-- 加载骨架屏 -->
      <div v-if="loading && newsList.length === 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div v-for="i in 6" :key="i" class="bg-white rounded-2xl p-5 shadow-md">
          <div class="flex gap-4">
            <div class="w-28 h-28 bg-gradient-to-br from-gray-200 to-gray-100 rounded-xl animate-pulse"></div>
            <div class="flex-1 space-y-3">
              <div class="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
              <div class="h-5 bg-gray-200 rounded"></div>
              <div class="h-5 bg-gray-200 rounded w-3/4"></div>
              <div class="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6" v-else>
        <!-- 左侧主内容区 -->
        <div class="lg:col-span-2 space-y-5">
          <!-- 头部 -->
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
              <div class="w-1.5 h-8 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full"></div>
              <h2 class="text-2xl font-bold text-gray-800">📰 最新资讯</h2>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-sm text-gray-500">共 {{ displayNewsList.length }} 篇<span v-if="translating" class="text-orange-400">（翻译中...）</span></span>
              <button @click="handleRefresh" :disabled="loading" class="px-4 py-2 text-sm bg-orange-500 text-white rounded-xl hover:bg-orange-600 disabled:opacity-50 transition flex items-center gap-2 shadow-lg shadow-orange-500/30">
                <svg class="w-4 h-4" :class="loading ? 'animate-spin' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
                刷新
              </button>
            </div>
          </div>
          
          <!-- 新闻列表 -->
          <div 
            v-for="item in displayNewsList" 
            :key="item.id" 
            @click="navigateToDetail(item)"
            class="bg-white rounded-2xl border border-gray-100/80 overflow-hidden hover:border-orange-300 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300 cursor-pointer group"
          >
            <div class="flex flex-col sm:flex-row">
              <!-- 缩略图 -->
              <div class="w-full sm:w-36 h-48 sm:h-auto flex-shrink-0 bg-gradient-to-br from-orange-100 to-amber-100 overflow-hidden relative">
                <img v-if="item.image" :src="item.image" :alt="item.title" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" @error="(e) => e.target.style.display = 'none'">
                <div v-else class="w-full h-full flex items-center justify-center">
                  <span class="text-6xl opacity-50">{{ item.tag === '行情' ? '📈' : item.tag === '政策' ? '⚖️' : item.tag === '技术' ? '⚙️' : '📰' }}</span>
                </div>
                <div class="absolute top-3 left-3">
                  <span class="px-3 py-1.5 text-xs font-bold rounded-lg backdrop-blur-sm" :class="item.tagClass">
                    {{ item.tag }}
                  </span>
                </div>
              </div>
              
              <!-- 内容区 -->
              <div class="flex-1 p-5 flex flex-col justify-between">
                <div>
                  <h3 class="font-bold text-gray-800 mb-3 text-base leading-relaxed group-hover:text-orange-600 transition line-clamp-3">
                    {{ item.title }}
                  </h3>
                  <p class="text-sm text-gray-500 line-clamp-2 mb-3">
                    {{ item.description || '暂无描述...' }}
                  </p>
                </div>
                <div class="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div class="flex items-center gap-4 text-xs text-gray-400">
                    <span class="flex items-center gap-1.5">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      {{ item.time }}
                    </span>
                    <span class="hidden sm:flex items-center gap-1.5">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                      {{ item.source }}
                    </span>
                  </div>
                  <span class="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-medium rounded-lg group-hover:shadow-lg group-hover:shadow-orange-500/30 transition flex items-center gap-1">
                    查看详情 
                    <svg class="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 右侧边栏 -->
        <aside class="space-y-6">
          <!-- 热门快讯 -->
          <div class="bg-white rounded-2xl border border-gray-100/80 overflow-hidden shadow-lg shadow-orange-500/5">
            <div class="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4">
              <div class="flex items-center gap-3">
                <span class="text-2xl">🔥</span>
                <h3 class="text-lg font-bold text-white">热门榜单</h3>
              </div>
              <p class="text-orange-100 text-xs mt-1">24小时热度排行</p>
            </div>
            
            <div class="divide-y divide-gray-100">
              <div 
                v-for="(item, i) in translatedHotNews" 
                :key="item.id" 
                @click="navigateToDetail(item)"
                class="flex items-center gap-4 px-5 py-4 hover:bg-gradient-to-r hover:from-orange-50/80 hover:to-amber-50/50 transition-all cursor-pointer group"
              >
                <div class="relative">
                  <span 
                    class="w-8 h-8 flex items-center justify-center font-bold text-sm rounded-xl text-white shadow-lg"
                    :class="i === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : i === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-500' : i === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700' : 'bg-gray-100 text-gray-500'"
                  >
                    {{ i + 1 }}
                  </span>
                  <span v-if="i < 3" class="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse" :class="i === 0 ? 'bg-yellow-400' : i === 1 ? 'bg-gray-400' : 'bg-amber-600'"></span>
                </div>
                
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-700 group-hover:text-orange-600 transition line-clamp-2 leading-relaxed">
                    {{ item.title }}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 分类导航 -->
          <div class="bg-white rounded-2xl border border-gray-100/80 p-5 shadow-lg">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-1.5 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
              <h3 class="font-bold text-gray-800">📑 分类浏览</h3>
            </div>
            
            <div class="grid grid-cols-2 gap-3">
              <div class="bg-gradient-to-br from-red-50 to-red-100/50 rounded-xl p-4 border border-red-100/50 hover:border-red-300 cursor-pointer transition group">
                <div class="text-2xl mb-2">📊</div>
                <p class="text-sm font-semibold text-gray-800">行情</p>
                <p class="text-xs text-gray-600 mt-1">价格走势</p>
              </div>
              <div class="bg-gradient-to-br from-yellow-50 to-yellow-100/50 rounded-xl p-4 border border-yellow-100/50 hover:border-yellow-300 cursor-pointer transition group">
                <div class="text-2xl mb-2">⚖️</div>
                <p class="text-sm font-semibold text-gray-800">政策</p>
                <p class="text-xs text-gray-600 mt-1">监管动向</p>
              </div>
              <div class="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-4 border border-purple-100/50 hover:border-purple-300 cursor-pointer transition group">
                <div class="text-2xl mb-2">⚙️</div>
                <p class="text-sm font-semibold text-gray-800">技术</p>
                <p class="text-xs text-gray-600 mt-1">开发更新</p>
              </div>
              <div class="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-4 border border-green-100/50 hover:border-green-300 cursor-pointer transition group">
                <div class="text-2xl mb-2">🌱</div>
                <p class="text-sm font-semibold text-gray-800">DeFi</p>
                <p class="text-xs text-gray-600 mt-1">生态发展</p>
              </div>
            </div>
          </div>
          
          <!-- 关注我们 -->
          <div class="bg-gradient-to-br from-orange-500 via-orange-500 to-amber-500 rounded-2xl p-6 text-white shadow-xl shadow-orange-500/30 relative overflow-hidden">
            <div class="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div class="absolute -bottom-10 -left-10 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            <div class="relative">
              <div class="text-4xl mb-3">📲</div>
              <h4 class="font-bold text-lg mb-2">关注我们</h4>
              <p class="text-xs text-white/85 mb-5">获取最新的加密货币资讯和市场洞察</p>
              <div class="flex justify-center gap-4">
                <a href="#" class="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/30 hover:scale-110 transition-all">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.514l-5.106-6.677-5.829 6.677h-3.328l7.754-8.835L2.25 2.25h6.514l4.721 6.244 5.259-6.244zM17.002 20.331h1.834L6.822 4.189H4.853l12.149 16.142z"/></svg>
                </a>
                <a href="#" class="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/30 hover:scale-110 transition-all">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 17.694c6.62 0 10.239-5.488 10.239-10.239 0-.155 0-.31-.01-.465a7.302 7.302 0 001.79-1.86 7.158 7.158 0 01-2.055.564 3.59 3.59 0 001.575-1.98 7.158 7.158 0 01-2.27.868 3.577 3.577 0 00-6.157 3.261 10.159 10.159 0 01-7.378-3.742 3.577 3.577 0 001.108 4.775 3.577 3.577 0 01-1.62-.446v.045a3.577 3.577 0 002.867 3.505 3.573 3.573 0 01-1.614.062 3.577 3.577 0 003.344 2.485 7.18 7.18 0 01-4.448 1.533c-.289 0-.576-.017-.86-.05a10.128 10.128 0 005.513 1.614"/></svg>
                </a>
                <a href="#" class="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/30 hover:scale-110 transition-all">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7"/></svg>
                </a>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { fetchNewsList, setNavigationArticle } from '../stores/newsStore'
import { quickTranslate, smartTranslate } from '../utils/translations'

const router = useRouter()
const newsList = ref([])
const hotNews = ref([])
const loading = ref(true)
const translating = ref(false)

// 翻译后的新闻列表（本地词典快速翻译，即时响应）
const translatedNewsList = computed(() => {
  return newsList.value.map(item => ({
    ...item,
    title: quickTranslate(item.title),
    description: quickTranslate(item.description || '')
  }))
})

// 翻译后的热门新闻（本地词典快速翻译）
const translatedHotNews = computed(() => {
  return hotNews.value.map(item => ({
    ...item,
    title: quickTranslate(item.title)
  }))
})

// 显示列表：优先使用完整翻译结果，否则用快速翻译
const displayNewsList = computed(() => {
  return fullTranslatedNewsList.value.length > 0 ? fullTranslatedNewsList.value : translatedNewsList.value
})

// 完整翻译后的新闻列表（异步调用Google API补充翻译）
const fullTranslatedNewsList = ref([])

const loadNews = async (forceRefresh = false) => {
  try {
    loading.value = true
    const result = await fetchNewsList(forceRefresh)
    newsList.value = result.articles || []
    hotNews.value = result.hotNews || []
    
    // 异步补充完整翻译
    await translateNewsFull(result.articles || [])
  } catch (err) {
    console.error('加载新闻失败:', err)
  } finally {
    loading.value = false
  }
}

// 异步补充完整翻译
const translateNewsFull = async (articles) => {
  if (!articles.length) return
  
  translating.value = true
  const translated = []
  
  for (const item of articles) {
    // 标题和描述先用本地词典，再用API补充
    const title = await smartTranslate(item.title, true)
    const description = await smartTranslate(item.description || '', true)
    translated.push({
      ...item,
      title,
      description
    })
  }
  
  fullTranslatedNewsList.value = translated
  translating.value = false
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

onMounted(() => {
  loadNews()
})
</script>
