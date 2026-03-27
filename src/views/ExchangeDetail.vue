<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-50 to-white">
    <!-- 精美横幅 -->
    <div class="bg-gradient-to-r from-orange-500 via-orange-400 to-amber-400 shadow-lg shadow-orange-200/50">
      <div class="max-w-7xl mx-auto px-4 py-5">
        <div class="flex items-center gap-4">
          <!-- 返回按钮 -->
          <router-link to="/exchange" class="text-orange-400 hover:text-orange-300 transition p-1 -ml-1">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </router-link>
          <div class="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-orange-300/30 transform rotate-3">
            <svg class="w-7 h-7 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
            </svg>
          </div>
          <div class="flex-1">
            <h1 class="text-xl font-bold text-white drop-shadow-sm">交易所详情</h1>
            <p class="text-orange-100 text-sm mt-0.5">全球加密货币交易所详细信息</p>
          </div>
          <div class="hidden sm:flex items-center gap-2">
            
          </div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading && !exchangeInfo.name" class="max-w-7xl mx-auto px-4 py-6 sm:py-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <div v-for="i in 3" :key="i" class="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-md sm:shadow-lg animate-pulse">
          <div class="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div class="w-12 sm:w-16 h-12 sm:h-16 bg-gray-200 rounded-xl sm:rounded-2xl"></div>
            <div class="flex-1">
              <div class="h-5 sm:h-6 bg-gray-200 rounded w-24 sm:w-32 mb-2"></div>
              <div class="h-3 sm:h-4 bg-gray-200 rounded w-16 sm:w-20"></div>
            </div>
          </div>
          <div class="space-y-2">
            <div class="h-3 sm:h-4 bg-gray-200 rounded"></div>
            <div class="h-3 sm:h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error && !exchangeInfo.name" class="max-w-7xl mx-auto px-4 py-12 sm:py-16 text-center">
      <div class="bg-white rounded-xl sm:rounded-2xl p-8 sm:p-12 shadow-md sm:shadow-lg inline-block">
        <div class="text-red-500 mb-4">
          <svg class="w-12 sm:w-16 h-12 sm:h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        </div>
        <p class="text-gray-600 mb-4">{{ error }}</p>
        <button @click="$router.back()" class="px-4 sm:px-6 py-2 sm:py-3 bg-orange-500 text-black rounded-lg sm:rounded-xl hover:bg-orange-600 transition shadow-md sm:shadow-lg">
          返回列表
        </button>
      </div>
    </div>

    <!-- 交易所详情 -->
    <div v-else-if="exchangeInfo.name" class="max-w-7xl mx-auto px-4 py-6 sm:py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <!-- 左侧主内容 -->
        <div class="lg:col-span-2 space-y-4 sm:space-y-6">
          <!-- 交易所概览卡片 -->
          <div class="bg-white rounded-xl sm:rounded-2xl shadow-md sm:shadow-xl border border-gray-100/80 overflow-hidden">
            <div class="bg-gradient-to-r from-orange-500 to-amber-500 px-4 sm:px-6 py-4 sm:py-5">
              <div class="flex items-center gap-3 sm:gap-4">
                <img :src="exchangeInfo.logo" :alt="exchangeInfo.name" class="w-14 sm:w-20 h-14 sm:h-20 rounded-xl sm:rounded-2xl bg-white shadow-lg p-1">
                <div class="flex-1 min-w-0">
                  <h2 class="text-lg sm:text-2xl font-bold text-black mb-1 truncate">{{ getExchangeNameZh(exchangeInfo.id) || exchangeInfo.name }}</h2>
                  <div class="flex flex-wrap items-center gap-2">
                    <span v-if="exchangeInfo.rank && exchangeInfo.rank !== '-'" class="px-2 sm:px-3 py-0.5 sm:py-1 bg-orange-100/80 backdrop-blur-sm rounded-lg text-orange-600 text-xs sm:text-sm font-medium">
                      🏆 #{{ exchangeInfo.rank }}
                    </span>
                    
                  </div>
                </div>
              </div>
            </div>
            
            <div class="p-4 sm:p-6">
              <!-- 核心数据 -->
              <div class="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div class="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-3 sm:p-4 border border-orange-100/50">
                  <p class="text-xs text-gray-500 mb-1">24h成交额</p>
                  <p class="text-base sm:text-xl font-bold text-gray-800 truncate">{{ exchangeInfo.volume24h }}</p>
                </div>
                <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 sm:p-4 border border-green-100/50">
                  <p class="text-xs text-gray-500 mb-1">交易对</p>
                  <p class="text-base sm:text-xl font-bold text-gray-800">{{ exchangeInfo.tradingPairs }}</p>
                </div>
                <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 sm:p-4 border border-blue-100/50">
                  <p class="text-xs text-gray-500 mb-1">地区</p>
                  <p class="text-base sm:text-xl font-bold text-gray-800 truncate">{{ exchangeInfo._countryDisplay }}</p>
                </div>
                <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-3 sm:p-4 border border-purple-100/50">
                  <p class="text-xs text-gray-500 mb-1">KYC</p>
                  <p class="text-base sm:text-xl font-bold text-gray-800">
                    {{ exchangeInfo._kycDisplay === '是' ? '✅' : exchangeInfo._kycDisplay === '否' ? '❌' : '❓' }}
                  </p>
                </div>
              </div>
              
              <!-- 简介 -->
              <div class="mb-4 sm:mb-6">
                <h3 class="text-base sm:text-lg font-bold text-gray-800 mb-2 sm:mb-3 flex items-center gap-2">
                  <span class="w-1 h-5 sm:h-6 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full"></span>
                  交易所简介
                </h3>
                <div class="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-100 min-h-[60px] sm:min-h-[80px]">
                  <!-- 预设中文描述 -->
                  <p v-if="exchangeDescription" class="text-gray-600 text-sm sm:text-base leading-relaxed">
                    {{ exchangeDescription }}
                  </p>
                  <!-- 无描述 -->
                  <p v-else class="text-gray-400 italic text-sm">
                    该交易所暂无详细描述，可访问官网了解更多。
                  </p>
                </div>
              </div>
              
              <!-- 链接 -->
              <div class="flex flex-wrap gap-2 sm:gap-3">
                <a :href="exchangeInfo.officialUrl" target="_blank" class="px-3 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg sm:rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition flex items-center gap-2 text-sm font-medium">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                  </svg>
                  访问官网
                </a>
                <a v-if="exchangeInfo.twitter" :href="exchangeInfo.twitter" target="_blank" class="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition flex items-center gap-2">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.514l-5.106-6.677-5.829 6.677h-3.328l7.754-8.835L2.25 2.25h6.514l4.721 6.244 5.259-6.244zM17.002 20.331h1.834L6.822 4.189H4.853l12.149 16.142z"/></svg>
                  Twitter
                </a>
                <a v-if="exchangeInfo.telegram" :href="exchangeInfo.telegram" target="_blank" class="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition flex items-center gap-2">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                  Telegram
                </a>
              </div>
            </div>
          </div>

          <!-- 交易对列表 -->
          <div class="bg-white rounded-xl sm:rounded-2xl shadow-md sm:shadow-xl border border-gray-100/80 overflow-hidden">
            <div class="px-4 sm:px-6 py-3 sm:py-5 border-b border-gray-100 flex items-center justify-between gap-2">
              <h3 class="text-sm sm:text-lg font-bold text-gray-800 flex items-center gap-2">
                <span class="w-1 h-5 sm:h-6 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full"></span>
                <span class="hidden xs:inline">{{ getExchangeNameZh(exchangeInfo.id) || exchangeInfo.name }}</span>
                <span class="xs:hidden">交易对</span>
              </h3>
              <select v-model="filters.type" class="px-2 sm:px-4 py-1.5 sm:py-2 bg-gray-100 border-0 rounded-lg sm:rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option value="usd">美元</option>
                <option value="cny">人民币</option>
              </select>
            </div>
            
            <!-- 加载状态 -->
            <div v-if="pairsLoading" class="flex justify-center py-8 sm:py-12">
              <div class="animate-spin w-8 h-8 sm:w-10 sm:h-10 border-2 sm:border-3 border-orange-500 border-t-transparent rounded-full"></div>
            </div>
            
            <!-- 表格 - 移动端卡片布局 -->
            <div v-else class="sm:overflow-x-auto">
              <!-- 移动端卡片布局 -->
              <div class="sm:hidden divide-y divide-gray-100">
                <div v-if="tradingPairs.length === 0" class="px-4 py-8 text-center text-gray-400 text-sm">
                  暂无交易对数据
                </div>
                <div 
                  v-for="(pair, index) in tradingPairs.slice(0, 10)" 
                  :key="pair.symbol"
                  class="px-4 py-3 hover:bg-orange-50/30 transition"
                >
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2">
                      <span class="w-6 h-6 flex items-center justify-center rounded font-bold text-xs" :class="index < 3 ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'">
                        {{ index + 1 }}
                      </span>
                      <img v-if="pair.coinIcon" :src="pair.coinIcon" class="w-6 h-6 rounded-full" @error="(e) => e.target.style.display = 'none'">
                      <span class="font-bold text-slate-800">{{ pair.symbol }}</span>
                    </div>
                    <span class="px-2 py-0.5 rounded text-xs font-medium" :class="Number(pair.percent) >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'">
                      {{ Number(pair.percent) >= 0 ? '↑' : '↓' }} {{ Math.abs(Number(pair.percent)) }}%
                    </span>
                  </div>
                  <div class="flex justify-between text-xs text-gray-500 pl-8">
                    <span>{{ pair.price }}</span>
                    <span>成交量: {{ pair.volume24h }}</span>
                  </div>
                </div>
              </div>
              
              <!-- 桌面端表格 -->
              <table v-if="tradingPairs.length > 0" class="hidden sm:table w-full">
                <thead class="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th class="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                    <th class="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">交易对</th>
                    <th class="px-4 sm:px-6 py-3 sm:py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">最新价</th>
                    <th class="px-4 sm:px-6 py-3 sm:py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">24H成交量</th>
                    <th class="px-4 sm:px-6 py-3 sm:py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">24H成交额</th>
                    <th class="px-4 sm:px-6 py-3 sm:py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">涨跌</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="(pair, index) in tradingPairs" :key="pair.symbol" class="hover:bg-orange-50/30 transition">
                    <td class="px-4 sm:px-6 py-3 sm:py-4">
                      <span class="w-6 sm:w-8 h-6 sm:h-8 flex items-center justify-center rounded-lg font-bold text-xs sm:text-sm" :class="index < 3 ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'">
                        {{ index + 1 }}
                      </span>
                    </td>
                    <td class="px-4 sm:px-6 py-3 sm:py-4">
                      <div class="flex items-center gap-2 sm:gap-3">
                        <img v-if="pair.coinIcon" :src="pair.coinIcon" :alt="pair.symbol" class="w-8 h-8 rounded-full" @error="(e) => e.target.style.display = 'none'">
                        <div>
                          <p class="font-bold text-gray-800">{{ pair.symbol }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 text-right font-mono font-medium text-gray-800">{{ pair.price }}</td>
                    <td class="px-6 py-4 text-right text-gray-600">{{ pair.volume24h }}</td>
                    <td class="px-6 py-4 text-right text-gray-600">{{ filters.type === 'cny' ? pair.volume24hCny : '$' + pair.volume24h }}</td>
                    <td class="px-6 py-4 text-right">
                      <span class="inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-medium" :class="Number(pair.percent) >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'">
                        {{ Number(pair.percent) >= 0 ? '↑' : '↓' }} {{ Math.abs(Number(pair.percent)) }}%
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- 右侧信息栏 -->
        <aside class="space-y-6">
          <!-- 关注交易所 -->
          <div class="bg-gradient-to-br from-orange-500 via-orange-500 to-amber-500 rounded-2xl p-6 text-white shadow-xl shadow-orange-500/30 relative overflow-hidden">
            <div class="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div class="relative">
              <h3 class="font-bold text-lg mb-2">🏆 关注交易所</h3>
              <p class="text-orange-100 text-sm mb-4">获取最新动态和深度分析</p>
              <button class="w-full py-3 bg-white text-orange-600 font-bold rounded-xl hover:bg-orange-50 transition shadow-lg">
                + 关注
              </button>
            </div>
          </div>

          <!-- 快捷链接 -->
          <div class="bg-white rounded-2xl shadow-lg border border-gray-100/80 p-6">
            <h3 class="font-bold text-gray-800 mb-4">🔗 快捷链接</h3>
            <div class="space-y-3">
              <a :href="exchangeInfo.officialUrl" target="_blank" class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-orange-50 transition group">
                <span class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 group-hover:bg-orange-500 group-hover:text-white transition">
                  🌐
                </span>
                <span class="text-gray-700 font-medium">官方网站</span>
              </a>
              <a v-if="exchangeInfo.twitter" :href="exchangeInfo.twitter" target="_blank" class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-orange-50 transition group">
                <span class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition">
                  𝕏
                </span>
                <span class="text-gray-700 font-medium">Twitter</span>
              </a>
              <a v-if="exchangeInfo.telegram" :href="exchangeInfo.telegram" target="_blank" class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-orange-50 transition group">
                <span class="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center text-sky-600 group-hover:bg-sky-500 group-hover:text-white transition">
                  ✈️
                </span>
                <span class="text-gray-700 font-medium">Telegram</span>
              </a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { fetchExchangeDetail, fetchTradingPairs, getNavigationExchange, getPresetDescription, getExchangeNameZh, fetchExchanges, getExchangeCountryZh, getExchangeKycZh } from '../store/exchange'

const route = useRoute()

const loading = ref(true)
const error = ref(null)
const pairsLoading = ref(true)
const exchangeDescription = ref('')
let refreshTimer = null

const exchangeInfo = reactive({
  name: '',
  logo: '',
  rank: '-',
  followers: 0,
  description: '',
  officialUrl: '#',
  twitter: '',
  telegram: '',
  region: '-',
  tradingPairs: '-',
  apiEnabled: false,
  kyc: false,
  volume24h: '-'
})

const filters = reactive({
  type: 'usd'
})

const tradingPairs = ref([])

const loadExchangeData = async (exchangeId) => {
  loading.value = true
  error.value = null
  pairsLoading.value = true
  exchangeDescription.value = ''

  // 优先从 query params 恢复预览数据（最可靠）
  let previewData = null
  if (route.query.p) {
    try {
      previewData = JSON.parse(decodeURIComponent(atob(route.query.p)))
    } catch {
      previewData = null
    }
  }
  // fallback：尝试从 store 导航状态读取
  if (!previewData) {
    previewData = getNavigationExchange()
  }
  if (previewData) {
    exchangeInfo.name = previewData.name || '加载中...'
    exchangeInfo.logo = previewData.image || previewData.logo || ''
    exchangeInfo.rank = previewData.trust_score_rank || '-'
    exchangeInfo.tradingPairs = previewData.number_of_markets || '-'
    exchangeInfo.volume24h = '$' + formatVolume(previewData.trade_volume_24h_btc)
  }

  try {
    // 并行加载：详情、交易对
    const results = await Promise.allSettled([
      fetchExchangeDetail(exchangeId),
      fetchTradingPairs(exchangeId)
    ])

    // 处理详情
    if (results[0].status === 'fulfilled') {
      Object.assign(exchangeInfo, results[0].value)
      // 预处理国家显示字段
      exchangeInfo._countryDisplay = getExchangeCountryZh(exchangeId) || exchangeInfo.region || '-'
      exchangeInfo._kycDisplay = getExchangeKycZh(exchangeId) || '未知'
    } else {
      console.warn('详情加载失败:', results[0].reason)
      if (!exchangeInfo.name) {
        error.value = '无法加载交易所详情'
      }
    }

    // 处理交易对
    if (results[1].status === 'fulfilled') {
      tradingPairs.value = results[1].value
    } else {
      console.warn('交易对加载失败:', results[1].reason)
    }

    // 直接从本地描述文件读取（按交易所小写英文ID匹配）
    console.log('[ExchangeDetail] 正在加载描述，exchangeId:', exchangeId)
    const presetDesc = getPresetDescription(exchangeId)
    console.log('[ExchangeDetail] 描述匹配结果:', presetDesc ? '有内容' : '为空')
    if (presetDesc) {
      exchangeDescription.value = presetDesc
    }

  } catch (err) {
    console.error('加载交易所数据失败:', err)
    error.value = '数据加载失败，请检查网络'
  } finally {
    loading.value = false
    pairsLoading.value = false
  }
}

/**
 * 每天凌晨从API预获取排行榜数据，缓存到store以加快后续访问速度
 */
const scheduleMidnightRefresh = () => {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 1, 0, 0) // 次日00:01触发
  const msUntilMidnight = tomorrow.getTime() - now.getTime()

  // 立即预取一次（如果今天还没取过）
  fetchExchanges(false).catch(() => {})

  refreshTimer = setTimeout(() => {
    // 每天凌晨刷新一次
    fetchExchanges(true).catch(() => {})
    // 之后每天固定时间重复
    refreshTimer = setInterval(() => {
      fetchExchanges(true).catch(() => {})
    }, 24 * 60 * 60 * 1000)
  }, msUntilMidnight)
}

onMounted(() => {
  scheduleMidnightRefresh()
  const exchangeId = route.params.id
  if (exchangeId) {
    loadExchangeData(exchangeId)
  } else {
    error.value = '缺少交易所ID'
    loading.value = false
  }
})

onUnmounted(() => {
  if (refreshTimer) {
    clearTimeout(refreshTimer)
    clearInterval(refreshTimer)
    refreshTimer = null
  }
})

watch(() => route.params.id, (newId) => {
  if (newId) {
    loadExchangeData(newId)
  }
})

const formatVolume = (vol) => {
  if (!vol) return '-'
  if (vol >= 1e9) return (vol / 1e9).toFixed(2) + 'B'
  if (vol >= 1e6) return (vol / 1e6).toFixed(2) + 'M'
  if (vol >= 1e3) return (vol / 1e3).toFixed(2) + 'K'
  return vol.toFixed(2)
}
</script>
