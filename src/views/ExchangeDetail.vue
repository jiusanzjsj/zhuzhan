<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 via-orange-50/20 to-white">
    <!-- Banner -->
    <div class="relative h-40 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 overflow-hidden">
      <div class="absolute inset-0">
        <div class="absolute -top-20 -right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-10 -left-10 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
      </div>
      <div class="relative h-full flex items-center justify-center">
        <div class="text-center">
          <div class="flex items-center justify-center gap-3 mb-2">
            <svg class="w-8 h-8 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
            </svg>
            <h1 class="text-3xl font-bold text-white">交易所详情</h1>
          </div>
          <p class="text-orange-100 text-sm">全球加密货币交易所详细信息</p>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading && !exchangeInfo.name" class="max-w-7xl mx-auto px-4 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div v-for="i in 3" :key="i" class="bg-white rounded-2xl p-6 shadow-lg animate-pulse">
          <div class="flex items-center gap-4 mb-4">
            <div class="w-16 h-16 bg-gray-200 rounded-2xl"></div>
            <div class="flex-1">
              <div class="h-6 bg-gray-200 rounded w-32 mb-2"></div>
              <div class="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
          <div class="space-y-2">
            <div class="h-4 bg-gray-200 rounded"></div>
            <div class="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error && !exchangeInfo.name" class="max-w-7xl mx-auto px-4 py-16 text-center">
      <div class="bg-white rounded-2xl p-12 shadow-lg inline-block">
        <div class="text-red-500 mb-4">
          <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        </div>
        <p class="text-gray-600 mb-4">{{ error }}</p>
        <button @click="$router.back()" class="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition shadow-lg">
          返回列表
        </button>
      </div>
    </div>

    <!-- 交易所详情 -->
    <div v-else-if="exchangeInfo.name" class="max-w-7xl mx-auto px-4 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 左侧主内容 -->
        <div class="lg:col-span-2 space-y-6">
          <!-- 交易所概览卡片 -->
          <div class="bg-white rounded-2xl shadow-xl shadow-orange-500/10 border border-gray-100/80 overflow-hidden">
            <div class="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-5">
              <div class="flex items-center gap-4">
                <img :src="exchangeInfo.logo" :alt="exchangeInfo.name" class="w-20 h-20 rounded-2xl bg-white shadow-lg p-1">
                <div>
                  <h2 class="text-2xl font-bold text-white mb-1">{{ getExchangeNameZh(exchangeInfo.id) || exchangeInfo.name }}</h2>
                  <div class="flex items-center gap-3">
                    <span v-if="exchangeInfo.rank && exchangeInfo.rank !== '-'" class="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-white text-sm font-medium">
                      🏆 全球排名 #{{ exchangeInfo.rank }}
                    </span>
                    <span class="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-white text-sm">
                      👥 {{ exchangeInfo.followers || 0 }} 关注
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="p-6">
              <!-- 核心数据 -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div class="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100/50">
                  <p class="text-xs text-gray-500 mb-1">24h成交额</p>
                  <p class="text-xl font-bold text-gray-800">{{ exchangeInfo.volume24h }}</p>
                </div>
                <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100/50">
                  <p class="text-xs text-gray-500 mb-1">交易对数量</p>
                  <p class="text-xl font-bold text-gray-800">{{ exchangeInfo.tradingPairs }}</p>
                </div>
                <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100/50">
                  <p class="text-xs text-gray-500 mb-1">注册地区</p>
                  <p class="text-xl font-bold text-gray-800">{{ exchangeInfo.region }}</p>
                </div>
                <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100/50">
                  <p class="text-xs text-gray-500 mb-1">KYC认证</p>
                  <p class="text-xl font-bold text-gray-800">{{ exchangeInfo.kyc ? '✅ 支持' : '❌ 不支持' }}</p>
                </div>
              </div>
              
              <!-- 简介 -->
              <div class="mb-6">
                <h3 class="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span class="w-1.5 h-6 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full"></span>
                  交易所简介
                </h3>
                <div class="bg-gray-50 rounded-xl p-4 border border-gray-100 min-h-[80px]">
                  <!-- 预设中文描述优先显示 -->
                  <p v-if="getExchangeDescZh(exchangeInfo.id)" class="text-gray-600 leading-relaxed">
                    {{ getExchangeDescZh(exchangeInfo.id) }}
                  </p>
                  <!-- 翻译加载中 -->
                  <div v-else-if="translating" class="flex items-center gap-3">
                    <div class="animate-spin w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full"></div>
                    <span class="text-gray-400 text-sm">正在翻译...</span>
                  </div>
                  <!-- 翻译结果 -->
                  <p v-else-if="translatedDescription" class="text-gray-600 leading-relaxed">
                    {{ translatedDescription }}
                  </p>
                  <!-- 原文 -->
                  <p v-else-if="exchangeInfo.description" class="text-gray-600 leading-relaxed">
                    {{ exchangeInfo.description }}
                  </p>
                  <!-- 无描述 -->
                  <p v-else class="text-gray-400 italic">
                    该交易所暂无详细描述，暂无详细描述可访问官网了解更多。
                  </p>
                </div>
              </div>
              
              <!-- 链接 -->
              <div class="flex flex-wrap gap-3">
                <a :href="exchangeInfo.officialUrl" target="_blank" class="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition flex items-center gap-2 font-medium">
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
          <div class="bg-white rounded-2xl shadow-xl shadow-orange-500/10 border border-gray-100/80 overflow-hidden">
            <div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h3 class="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span class="w-1.5 h-6 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full"></span>
                {{ getExchangeNameZh(exchangeInfo.id) || exchangeInfo.name }} 交易对
              </h3>
              <select v-model="filters.type" class="px-4 py-2 bg-gray-100 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option value="usd">美元</option>
                <option value="cny">人民币</option>
              </select>
            </div>
            
            <!-- 加载状态 -->
            <div v-if="pairsLoading" class="flex justify-center py-12">
              <div class="animate-spin w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full"></div>
            </div>
            
            <!-- 表格 -->
            <div v-else class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                    <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">交易对</th>
                    <th class="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">最新价</th>
                    <th class="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">24H成交量</th>
                    <th class="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">24H成交额</th>
                    <th class="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">24H涨跌</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-if="tradingPairs.length === 0">
                    <td colspan="6" class="px-6 py-12 text-center text-gray-400">暂无交易对数据</td>
                  </tr>
                  <tr v-for="(pair, index) in tradingPairs" :key="pair.symbol" class="hover:bg-orange-50/30 transition">
                    <td class="px-6 py-4">
                      <span class="w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm" :class="index < 3 ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'">
                        {{ index + 1 }}
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-3">
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
          <!-- 基本信息 -->
          <div class="bg-white rounded-2xl shadow-lg border border-gray-100/80 overflow-hidden">
            <div class="bg-gradient-to-r from-gray-50 to-orange-50/30 px-6 py-4 border-b border-gray-100">
              <h3 class="font-bold text-gray-800">📋 基本信息</h3>
            </div>
            <div class="p-6 space-y-4">
              <div class="flex justify-between items-center py-2 border-b border-gray-100">
                <span class="text-gray-500 text-sm">KYC认证</span>
                <span class="font-medium text-gray-800">{{ exchangeInfo.kyc ? '✅ 支持' : '❌ 不支持' }}</span>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-gray-100">
                <span class="text-gray-500 text-sm">API接口</span>
                <span class="font-medium text-gray-800">{{ exchangeInfo.apiEnabled ? '✅ 支持' : '❌ 不支持' }}</span>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-gray-100">
                <span class="text-gray-500 text-sm">注册地区</span>
                <span class="font-medium text-gray-800">{{ exchangeInfo.region }}</span>
              </div>
              <div class="flex justify-between items-center py-2">
                <span class="text-gray-500 text-sm">交易对数量</span>
                <span class="font-medium text-gray-800">{{ exchangeInfo.tradingPairs }}</span>
              </div>
            </div>
          </div>

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
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { fetchExchangeDetail, fetchTradingPairs, fetchExchangeDescription, translateToZh, getNavigationExchange, getPresetDescription, getExchangeNameZh, getExchangeDescZh } from '../store/exchange'

const route = useRoute()

const loading = ref(true)
const error = ref(null)
const pairsLoading = ref(true)
const translating = ref(false)
const translatedDescription = ref('')

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
  translatedDescription.value = ''

  // 从导航状态快速显示
  const navExchange = getNavigationExchange()
  if (navExchange) {
    exchangeInfo.name = navExchange.name || '加载中...'
    exchangeInfo.logo = navExchange.image || ''
    exchangeInfo.rank = navExchange.trust_score_rank || '-'
    exchangeInfo.tradingPairs = navExchange.number_of_markets || '-'
    exchangeInfo.volume24h = '$' + formatVolume(navExchange.trade_volume_24h_btc)
  }

  try {
    // 并行加载：详情、交易对、描述
    const results = await Promise.allSettled([
      fetchExchangeDetail(exchangeId),
      fetchTradingPairs(exchangeId),
      fetchExchangeDescription(exchangeId)
    ])

    // 处理详情
    if (results[0].status === 'fulfilled') {
      Object.assign(exchangeInfo, results[0].value)
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

    // 处理描述翻译
    const descriptionResult = results[2]
    console.log('[ExchangeDetail] 描述结果:', descriptionResult)
    if (descriptionResult.status === 'fulfilled' && descriptionResult.value) {
      console.log('[ExchangeDetail] 原文:', descriptionResult.value.substring(0, 100))
      // 有描述，进行翻译
      translating.value = true
      translateToZh(descriptionResult.value)
        .then(translated => {
          console.log('[ExchangeDetail] 翻译结果:', translated ? translated.substring(0, 50) : '无')
          // 检查翻译是否有效（不是原文且长度合理）
          if (translated && translated !== descriptionResult.value && translated.length > 5) {
            translatedDescription.value = translated
          } else {
            // 翻译失败或无效，尝试用预设描述
            const presetDesc = getPresetDescription(route.params.id)
            if (presetDesc) {
              translatedDescription.value = presetDesc
              console.log('[ExchangeDetail] 使用预设描述')
            }
          }
        })
        .catch(err => {
          console.error('[ExchangeDetail] 翻译失败:', err)
          // 失败时用预设描述
          const presetDesc = getPresetDescription(route.params.id)
          if (presetDesc) {
            translatedDescription.value = presetDesc
          }
        })
        .finally(() => {
          translating.value = false
        })
    } else {
      console.log('[ExchangeDetail] 描述为空，尝试预设')
      const presetDesc = getPresetDescription(route.params.id)
      if (presetDesc) {
        translatedDescription.value = presetDesc
      }
    }

  } catch (err) {
    console.error('加载交易所数据失败:', err)
    error.value = '数据加载失败，请检查网络'
  } finally {
    loading.value = false
    pairsLoading.value = false
  }
}

onMounted(() => {
  const exchangeId = route.params.id
  if (exchangeId) {
    loadExchangeData(exchangeId)
  } else {
    error.value = '缺少交易所ID'
    loading.value = false
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
