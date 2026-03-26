<template>
  <div class="flex-1 bg-gradient-to-b from-slate-50 via-orange-50/30 to-white">
    <!-- Banner -->
    <div class="relative h-36 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 overflow-hidden">
      <div class="absolute inset-0">
        <div class="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
      </div>
      <div class="relative h-full flex items-center justify-center">
        <div class="text-center">
          <div class="flex items-center justify-center gap-3 mb-2">
            <svg class="w-8 h-8 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
            </svg>
            <h1 class="text-3xl font-bold text-white">全球加密货币交易所</h1>
          </div>
          <p class="text-orange-100 text-sm">追踪全球加密货币交易所，获取实时排名、交易量、流量等多维度数据</p>
        </div>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="max-w-7xl mx-auto px-4 py-6">
      <!-- 搜索和排序 -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-4">
          <select 
            v-model="sortBy"
            class="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 shadow-sm hover:shadow-md transition-all"
          >
            <option value="trust_score_rank">⭐ 评分排序</option>
            <option value="trade_volume_24h">📊 交易量排序</option>
            <option value="name">🔤 名称排序</option>
          </select>
        </div>
        
        <div class="relative">
          <input 
            v-model="searchKeyword"
            type="text"
            placeholder="搜索交易所..."
            class="w-56 px-4 py-2.5 pl-11 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 shadow-sm hover:shadow-md transition-all"
          />
          <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-16 text-center">
        <div class="animate-spin w-12 h-12 mx-auto mb-4 border-4 border-orange-500 border-t-transparent rounded-full"></div>
        <p class="text-slate-500">正在加载交易所数据...</p>
      </div>
      
      <!-- 错误状态 -->
      <div v-else-if="error" class="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-12 text-center">
        <div class="text-red-500 mb-4">
          <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        </div>
        <p class="text-slate-600 mb-2">获取数据失败</p>
        <p class="text-slate-400 text-sm mb-4">{{ error }}</p>
        <button @click="handleRefresh" class="px-6 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium shadow-md hover:shadow-lg">
          重试
        </button>
      </div>
      
      <!-- 数据卡片列表 -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          v-for="(exchange, index) in sortedExchanges" 
          :key="exchange.id"
          class="bg-white rounded-2xl p-5 shadow-md hover:shadow-xl border border-slate-100 hover:border-orange-200 transition-all duration-300 hover:bg-gradient-to-r hover:from-orange-50/80 hover:to-amber-50/50 group cursor-pointer"
          @click="navigateToDetail(exchange)"
          @mouseenter="prefetchDetail(exchange.id)"
        >
          <div class="flex items-center gap-4">
            <!-- 排名标签 -->
            <div class="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg"
              :class="{
                'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-orange-200': index === 0,
                'bg-gradient-to-br from-slate-300 to-slate-400 text-white shadow-lg shadow-slate-200': index === 1,
                'bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-lg shadow-amber-200': index === 2,
                'bg-slate-100 text-slate-500': index > 2
              }"
            >
              {{ index + 1 }}
            </div>
            
            <!-- 交易所图标 -->
            <img :src="exchange.image" :alt="exchange.name" class="w-12 h-12 rounded-xl shadow-md group-hover:scale-110 transition-transform" @error="handleImageError($event)" />
            
            <!-- 交易所信息 -->
            <div class="flex-1 min-w-0">
              <div class="font-bold text-slate-800 group-hover:text-orange-600 transition-colors text-lg block truncate">
                {{ getExchangeNameZh(exchange.id) || exchange.name }}
              </div>
              <div class="mt-1">
                <span class="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                  {{ getExchangeDescZh(exchange.id) || exchange.country || '-' }}
                </span>
              </div>
            </div>
            
            <!-- 评分 -->
            <div class="flex-shrink-0 text-right">
              <div class="flex items-center gap-1 mb-1">
                <svg v-for="i in 10" :key="i" class="w-3 h-3" :class="i <= (exchange.trust_score || 0) ? 'text-orange-400' : 'text-slate-200'" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              </div>
              <div class="font-mono font-bold text-slate-700 text-lg">${{ formatVolume(exchange.trade_volume_24h_btc) }}</div>
              <div class="text-xs text-slate-400">24h BTC交易额</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部提示 -->
      <div class="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
        <div class="flex items-start gap-3">
          <svg class="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <div class="text-sm text-blue-700">
            <p class="font-medium">数据来源说明</p>
            <p class="text-blue-600 mt-1">交易所数据来源于 CoinGecko API，评分基于交易量、流动性、监管合规性等多维度综合评估。数据每5分钟更新一次。</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchExchanges, fetchExchangeDetail, setNavigationExchange, getExchangeNameZh, getExchangeDescZh } from '../store/exchange'

const router = useRouter()

const API_KEY = 'CG-42Ty4UXdyANMSugcsqZSEU7Y'

const sortBy = ref('trust_score_rank')
const searchKeyword = ref('')
const loading = ref(true)
const error = ref(null)

const exchanges = ref([])

// 加载数据
const loadExchanges = async (forceRefresh = false) => {
  try {
    loading.value = true
    error.value = null
    exchanges.value = await fetchExchanges(forceRefresh)
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

// 刷新
const handleRefresh = () => {
  loadExchanges(true)
}

// 预加载详情（鼠标悬停时，非阻塞）
const prefetchDetail = (exchangeId) => {
  // 忽略错误，只记录不显示
  fetchExchangeDetail(exchangeId).catch(() => {})
}

// 跳转到详情页
const navigateToDetail = (exchange) => {
  // 通过store传递数据，确保详情页能快速显示
  setNavigationExchange(exchange)
  router.push({
    name: 'ExchangeDetail',
    params: { id: exchange.id }
  })
}

onMounted(() => {
  loadExchanges()
})

const handleImageError = (event) => {
  event.target.style.display = 'none'
}

const formatVolume = (vol) => {
  if (!vol) return '-'
  if (vol >= 1e9) return (vol / 1e9).toFixed(2) + 'B'
  if (vol >= 1e6) return (vol / 1e6).toFixed(2) + 'M'
  if (vol >= 1e3) return (vol / 1e3).toFixed(2) + 'K'
  return vol.toFixed(2)
}

const sortedExchanges = computed(() => {
  let result = [...exchanges.value]
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(e => e.name.toLowerCase().includes(keyword))
  }
  
  if (sortBy.value === 'trust_score_rank') {
    result.sort((a, b) => a.trust_score_rank - b.trust_score_rank)
  } else if (sortBy.value === 'trade_volume_24h') {
    result.sort((a, b) => b.trade_volume_24h_btc - a.trade_volume_24h_btc)
  } else if (sortBy.value === 'name') {
    result.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
  }
  
  return result
})
</script>
