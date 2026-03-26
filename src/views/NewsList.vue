<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 via-orange-50/20 to-white">
    <!-- Banner Section -->
    <div class="relative h-48 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 overflow-hidden">
      <div class="absolute inset-0">
        <div class="absolute -top-20 -right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-10 -left-10 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
      </div>
      <div class="relative h-full flex items-center justify-center">
        <div class="text-center">
          <div class="flex items-center justify-center gap-3 mb-3">
            <svg class="w-8 h-8 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19H3V5a2 2 0 012-2h10a2 2 0 012 2v10.5"/>
            </svg>
            <h1 class="text-3xl font-bold text-white">加密货币快讯</h1>
          </div>
          <p class="text-orange-100 text-sm">追踪最新的行情资讯、政策动态和技术进展</p>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 py-8">
      <div class="flex gap-8">
        <!-- Main News -->
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-8">
            <div class="w-1.5 h-7 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full"></div>
            <h2 class="text-2xl font-bold text-gray-800">📰 最新资讯</h2>
            <span class="ml-auto text-sm text-gray-500">共 {{ newsList.length }} 篇</span>
          </div>
          
          <div class="space-y-5">
            <router-link 
              v-for="item in newsList" 
              :key="item.id" 
              :to="'/news/' + item.id" 
              class="bg-white rounded-2xl border border-gray-100/80 overflow-hidden hover:border-orange-300 hover:shadow-xl hover:shadow-orange-500/10 transition-all group"
            >
              <div class="flex gap-5 p-5">
                <!-- 缩略图 -->
                <div class="w-32 h-32 flex-shrink-0 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl overflow-hidden border border-gray-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <img v-if="item.image" :src="item.image" :alt="item.title" class="w-full h-full object-cover" @error="(e) => e.target.style.display = 'none'">
                  <svg v-else class="w-12 h-12 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                </div>
                
                <!-- 内容区 -->
                <div class="flex-1 flex flex-col justify-between">
                  <!-- 头部信息 -->
                  <div>
                    <div class="flex items-center gap-3 mb-3 flex-wrap">
                      <span class="px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap" :class="item.tagClass">
                        {{ item.tag }}
                      </span>
                      <span class="text-xs text-gray-400 flex items-center gap-1">🕐 {{ item.time }}</span>
                      <div class="flex-1"></div>
                      <span class="text-xs text-orange-600 font-medium">{{ estimateReadTime(item.title) }} min</span>
                    </div>
                    
                    <!-- 标题 -->
                    <h3 class="font-bold text-gray-800 mb-3 text-base leading-snug group-hover:text-orange-600 transition line-clamp-3">
                      {{ item.title }}
                    </h3>
                  </div>
                  
                  <!-- 底部统计 -->
                  <div class="flex items-center gap-6 text-xs text-gray-400 pt-3 border-t border-gray-100">
                    <span class="flex items-center gap-1.5 hover:text-orange-500 transition">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                      {{ item.views }}
                    </span>
                    <span class="flex items-center gap-1.5 hover:text-orange-500 transition">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2l-4 4z"/>
                      </svg>
                      {{ item.comments }}
                    </span>
                    <div class="flex-1"></div>
                    <span class="text-orange-500 font-medium group-hover:translate-x-1 transition inline-flex items-center gap-1">
                      查看详情 <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            </router-link>
          </div>
        </div>
        
        <!-- Sidebar -->
        <aside class="w-96 flex-shrink-0">
          <!-- 热门快讯 -->
          <div class="mb-6">
            <div class="flex items-center gap-3 mb-5">
              <div class="w-1.5 h-6 bg-gradient-to-b from-red-500 to-orange-500 rounded-full"></div>
              <h3 class="text-xl font-bold text-gray-800">🔥 热门榜单</h3>
            </div>
            
            <div class="bg-white rounded-2xl border border-gray-100/80 overflow-hidden shadow-lg shadow-orange-500/5">
              <div class="bg-gradient-to-r from-gray-50 to-orange-50/30 px-6 py-4 border-b border-gray-100">
                <p class="text-xs text-gray-600 font-medium">24小时热度排行</p>
              </div>
              
              <div class="divide-y divide-gray-100">
                <router-link 
                  v-for="(item, i) in hotNews" 
                  :key="item.id" 
                  :to="'/news/' + item.id" 
                  class="flex items-center gap-4 px-6 py-5 hover:bg-gradient-to-r hover:from-orange-50/60 hover:to-amber-50/40 transition-all group"
                >
                  <!-- 排名 -->
                  <div class="w-8 h-8 flex-shrink-0 flex items-center justify-center">
                    <span v-if="i < 3" class="w-full h-full bg-gradient-to-br text-white rounded-lg text-xs flex items-center justify-center font-bold" :class="[
                      i === 0 ? 'from-yellow-400 to-yellow-500 shadow-lg shadow-yellow-400/30' : 
                      i === 1 ? 'from-slate-400 to-slate-500 shadow-lg shadow-slate-400/30' : 
                      'from-orange-400 to-amber-500 shadow-lg shadow-orange-400/30'
                    ]">
                      {{ i + 1 }}
                    </span>
                    <span v-else class="w-6 h-6 bg-gray-100 text-gray-600 rounded-full text-xs flex items-center justify-center font-bold group-hover:bg-orange-100 group-hover:text-orange-600 transition">{{ i + 1 }}</span>
                  </div>
                  
                  <!-- 内容 -->
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-gray-700 group-hover:text-orange-600 transition line-clamp-2">{{ item.title }}</p>
                    <div class="flex items-center gap-2 mt-1.5">
                      <div class="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div class="h-full bg-gradient-to-r from-orange-400 to-amber-400 rounded-full" :style="{ width: (100 - i * 15) + '%' }"></div>
                      </div>
                      <span class="text-xs text-gray-400">{{ 100 - i * 15 }}%</span>
                    </div>
                  </div>
                </router-link>
              </div>
            </div>
          </div>
          
          <!-- 分类导航 -->
          <div class="mb-6">
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
          <div class="bg-gradient-to-br from-orange-500 via-orange-500 to-amber-500 rounded-2xl p-6 text-white text-center shadow-xl shadow-orange-500/20">
            <div class="text-4xl mb-3">📲</div>
            <h4 class="font-bold text-lg mb-2">关注我们</h4>
            <p class="text-xs text-white/85 mb-5">获取最新的加密货币资讯和市场洞察</p>
            <div class="flex justify-center gap-4">
              <div class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 cursor-pointer transition transform hover:scale-110">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.514l-5.106-6.677-5.829 6.677h-3.328l7.754-8.835L2.25 2.25h6.514l4.721 6.244 5.259-6.244zM17.002 20.331h1.834L6.822 4.189H4.853l12.149 16.142z"/>
                </svg>
              </div>
              <div class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 cursor-pointer transition transform hover:scale-110">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 17.694c6.62 0 10.239-5.488 10.239-10.239 0-.155 0-.31-.01-.465a7.302 7.302 0 001.79-1.86 7.158 7.158 0 01-2.055.564 3.59 3.59 0 001.575-1.98 7.158 7.158 0 01-2.27.868 3.577 3.577 0 00-6.157 3.261 10.159 10.159 0 01-7.378-3.742 3.577 3.577 0 001.108 4.775 3.557 3.557 0 01-1.62-.446v.045a3.577 3.577 0 002.867 3.505 3.573 3.573 0 01-1.614.062 3.585 3.585 0 003.344 2.485 7.18 7.18 0 01-4.448 1.533c-.289 0-.576-.017-.86-.05a10.128 10.128 0 005.513 1.614"/>
                </svg>
              </div>
              <div class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 cursor-pointer transition transform hover:scale-110">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7"/>
                </svg>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useNewsStore } from '@/stores/newsStore'

const newsStore = useNewsStore()
const newsList = ref([])
const hotNews = ref([])
const loading = ref(true)

// NewsAPI Key
const NEWS_API_KEY = '3908eafc986a4b75842bee9ac752cced'

const estimateReadTime = (text) => {
  const wordsPerMinute = 200
  const words = text.length
  return Math.ceil(words / wordsPerMinute) || 1
}

const fetchNews = async () => {
  try {
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=crypto+OR+bitcoin+OR+ethereum&language=en&sortBy=publishedAt&pageSize=10&page=1&apiKey=${NEWS_API_KEY}`
    )
    const data = await response.json()
    
    if (data.articles) {
      newsList.value = data.articles.slice(0, 10).map((item, index) => ({
        id: index + 1,
        title: item.title || '无标题',
        tag: getTag(item.source.name),
        tagClass: getTagClass(item.source.name),
        time: formatTime(item.publishedAt),
        views: Math.floor(Math.random() * 900 + 100),
        comments: Math.floor(Math.random() * 50 + 10),
        url: item.url,
        image: item.urlToImage,
        description: item.description || '',
        source: item.source?.name || 'Unknown',
        content: item.description || ''
      }))
      
      hotNews.value = data.articles.slice(0, 5).map((item, index) => ({
        id: index + 1,
        title: item.title?.slice(0, 30) + '...' || '无标题'
      }))
      
      // 保存到共享存储
      newsStore.setArticles(newsList.value)
    }
  } catch (error) {
    console.error('获取新闻失败:', error)
    setDefaultNews()
  } finally {
    loading.value = false
  }
}

const getTag = (source) => {
  const sourceMap = {
    'CoinDesk': '行情',
    'CoinTelegraph': '行情',
    'Bloomberg': '政策',
    'Reuters': '政策',
    'Decrypt': '技术',
    'The Block': 'DeFi'
  }
  return sourceMap[source] || '快讯'
}

const getTagClass = (source) => {
  const tag = getTag(source)
  const classMap = {
    '行情': 'bg-red-50 text-red-600 border border-red-100',
    '政策': 'bg-yellow-50 text-yellow-600 border border-yellow-100',
    '技术': 'bg-purple-50 text-purple-600 border border-purple-100',
    'DeFi': 'bg-green-50 text-green-600 border border-green-100',
    '快讯': 'bg-blue-50 text-blue-600 border border-blue-100'
  }
  return classMap[tag] || classMap['快讯']
}

const formatTime = (dateStr) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now - date) / 1000 / 60)
  
  if (diff < 60) return diff + '分钟前'
  if (diff < 1440) return Math.floor(diff / 60) + '小时前'
  return Math.floor(diff / 1440) + '天前'
}

const setDefaultNews = () => {
  newsList.value = [
    { id: 1, title: '比特币BTC价格突破70000美元，24小时涨跌幅达3.5%', tag: '行情', tagClass: 'bg-red-50 text-red-600 border border-red-100', time: '10分钟前', views: '999+', comments: '88', image: null },
    { id: 2, title: '以太坊ETH市值突破3000亿美元，创历史新高', tag: '行情', tagClass: 'bg-red-50 text-red-600 border border-red-100', time: '30分钟前', views: '888', comments: '66', image: null },
    { id: 3, title: '币安宣布上架新代币引发市场热议', tag: '政策', tagClass: 'bg-yellow-50 text-yellow-600 border border-yellow-100', time: '1小时前', views: '777', comments: '55', image: null },
    { id: 4, title: 'DeFi锁仓量突破2000亿美元', tag: '技术', tagClass: 'bg-purple-50 text-purple-600 border border-purple-100', time: '2小时前', views: '666', comments: '44', image: null },
    { id: 5, title: '美国SEC再次推迟比特币ETF审批决定', tag: '政策', tagClass: 'bg-yellow-50 text-yellow-600 border border-yellow-100', time: '3小时前', views: '555', comments: '33', image: null },
    { id: 6, title: 'Solana网络升级完成，性能大幅提升', tag: '技术', tagClass: 'bg-purple-50 text-purple-600 border border-purple-100', time: '4小时前', views: '444', comments: '22', image: null },
  ]
  hotNews.value = [
    { id: 1, title: '比特币突破历史新高，市值突破1.5万亿美元' },
    { id: 2, title: '以太坊升级成功，性能提升300%' },
    { id: 3, title: 'NFT市场最新动态及行情分析' },
    { id: 4, title: 'DeFi安全事件汇总和风险提示' },
    { id: 5, title: '新手入门指南和投资建议' },
  ]
}

onMounted(() => {
  fetchNews()
})
</script>
