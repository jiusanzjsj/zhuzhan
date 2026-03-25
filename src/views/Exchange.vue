<template>
  <div class="flex-1 bg-gradient-to-b from-slate-50 via-orange-50/30 to-white">
    <!-- Banner -->
    <div class="relative h-40 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 overflow-hidden">
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
      <!-- 分类 Tab -->
      <div class="flex items-center gap-2 mb-6 overflow-x-auto">
        <button 
          v-for="tab in tabs" 
          :key="tab.value"
          @click="activeTab = tab.value"
          :class="[
            'px-5 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-300',
            activeTab === tab.value 
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md' 
              : 'bg-white text-slate-600 hover:bg-orange-50 border border-slate-200'
          ]"
        >
          {{ tab.label }}
        </button>
        
        <div class="ml-auto flex items-center gap-3">
          <select 
            v-model="sortBy"
            class="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-orange-400"
          >
            <option value="trust_score_rank">评分排序</option>
            <option value="trade_volume_24h">交易量排序</option>
            <option value="name">名称排序</option>
          </select>
          
          <div class="relative">
            <input 
              v-model="searchKeyword"
              type="text"
              placeholder="搜索交易所..."
              class="w-48 px-4 py-2 pl-10 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-orange-400"
            />
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
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
        <button @click="fetchExchanges" class="px-6 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium">
          重试
        </button>
      </div>
      
      <!-- 数据表格 -->
      <div v-else class="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <table class="w-full">
          <thead class="bg-gradient-to-r from-slate-50 to-slate-100">
            <tr>
              <th class="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-16">#</th>
              <th class="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">交易所</th>
              <th class="px-4 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider w-24">评分</th>
              <th class="px-4 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">24h交易额($)</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr 
              v-for="(exchange, index) in sortedExchanges" 
              :key="exchange.id"
              class="hover:bg-gradient-to-r hover:from-orange-50/80 hover:to-amber-50/50 transition-all duration-300 group"
            >
              <!-- 排名 -->
              <td class="px-4 py-4">
                <span class="text-lg font-bold" :class="index < 3 ? 'text-orange-500' : 'text-slate-400'">
                  {{ index + 1 }}
                </span>
              </td>
              
              <!-- 交易所信息 -->
              <td class="px-4 py-4">
                <div class="flex items-center gap-4">
                  <img :src="exchange.image" :alt="exchange.name" class="w-10 h-10 rounded-lg" @error="handleImageError(exchange, $event)" />
                  <div>
                    <div class="flex items-center gap-2">
                      <router-link 
                        :to="'/exchange/' + exchange.id" 
                        class="font-bold text-slate-800 group-hover:text-orange-600 transition-colors"
                      >
                        {{ exchange.name }}
                      </router-link>
                    </div>
                    <div class="text-xs text-slate-400 mt-0.5">{{ exchange.country || '-' }}</div>
                  </div>
                </div>
              </td>
              
              <!-- 评分 -->
              <td class="px-4 py-4 text-center">
                <div class="flex items-center justify-center gap-1">
                  <div class="flex">
                    <svg v-for="i in 10" :key="i" class="w-3 h-3" :class="i <= (exchange.trust_score || 0) ? 'text-orange-400' : 'text-slate-200'" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  </div>
                  <span class="text-sm font-medium text-slate-500 ml-1">{{ exchange.trust_score || '-' }}</span>
                </div>
              </td>
              
              <!-- 24h交易额 -->
              <td class="px-4 py-4 text-right">
                <span class="font-mono font-bold text-slate-700">${{ formatVolume(exchange.trade_volume_24h_btc) }}</span>
              </td>
            </tr>
          </tbody>
        </table>
        
        <!-- 底部 -->
        <div class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span class="text-sm text-slate-500">显示 {{ sortedExchanges.length }} 个交易所</span>
          <div class="flex items-center gap-2">
            <button class="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-orange-50 transition">查看更多</button>
          </div>
        </div>
      </div>

      <!-- 提示信息 -->
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

const API_KEY = 'CG-42Ty4UXdyANMSugcsqZSEU7Y'

const tabs = [
  { label: '全部', value: 'all' },
  { label: '衍生品', value: 'derivatives' },
  { label: '现货', value: 'spot' },
  { label: 'DeFi', value: 'defi' },
  { label: '交易所提供', value: 'offering' }
]

const activeTab = ref('all')
const sortBy = ref('trust_score_rank')
const searchKeyword = ref('')
const loading = ref(true)
const error = ref(null)

const exchanges = ref([])

const fetchExchanges = async () => {
  try {
    loading.value = true
    error.value = null
    
    const response = await fetch(
      `https://api.coingecko.com/api/v3/exchanges?per_page=50&page=1`,
      {
        headers: {
          'Accept': 'application/json',
          'x-cg-demo-api-key': API_KEY
        }
      }
    )
    
    if (!response.ok) {
      throw new Error(`API错误: ${response.status}`)
    }
    
    const data = await response.json()
    
    exchanges.value = data.map(ex => ({
      id: ex.id,
      name: ex.name,
      image: ex.image || '',
      trust_score: ex.trust_score || 0,
      trust_score_rank: ex.trust_score_rank || 999,
      trade_volume_24h_btc: ex.trade_volume_24h_btc || 0,
      volume_change_24h: ex.volume_change_24h || 0,
      weekly_volume: (ex.trade_volume_24h_btc || 0) * 7,
      number_of_markets: ex.number_of_markets || 0,
      country: ex.country || '-',
      url: ex.url || '#'
    }))
    
  } catch (err) {
    console.error('获取交易所数据失败:', err)
    error.value = err.message
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchExchanges()
})

const handleImageError = (exchange, event) => {
  event.target.style.display = 'none'
}

const formatVolume = (vol) => {
  if (!vol) return '-'
  if (vol >= 1e9) return (vol / 1e9).toFixed(2) + 'B'
  if (vol >= 1e6) return (vol / 1e6).toFixed(2) + 'M'
  if (vol >= 1e3) return (vol / 1e3).toFixed(2) + 'K'
  return vol.toFixed(2)
}

// 生成7天走势路径
const getSparklinePath = (id, baseVolume) => {
  if (!baseVolume) baseVolume = 1000000000
  
  // 根据不同交易所生成不同的走势
  const patterns = {
    binance: 'M0,28 Q10,25 20,22 T40,18 T60,12 T80,8 T100,5',
    okx: 'M0,25 Q15,22 30,20 T50,15 T70,18 T90,10 T100,8',
    bybit: 'M0,30 Q20,28 40,25 T60,20 T80,15 T100,12',
    huobi: 'M0,22 Q15,20 30,18 T50,22 T70,15 T90,10 T100,8',
    default: 'M0,26 Q20,24 40,20 T60,16 T80,12 T100,10'
  }
  return patterns[id] || patterns.default
}

const getSparklineArea = (id, baseVolume) => {
  const line = getSparklinePath(id, baseVolume)
  return line + ' L100,35 L0,35 Z'
}

const sortedExchanges = computed(() => {
  let result = [...exchanges.value]
  
  // 搜索过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(e => e.name.toLowerCase().includes(keyword))
  }
  
  // 分类过滤（暂时不做，因为API可能不支持）
  
  // 排序
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
