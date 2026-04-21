<template>
  <div class="min-h-screen bg-[#0f0f1a]">
    <!-- 精美横幅 -->
    <div class="bg-gradient-to-r from-yellow-500/10 via-yellow-500/20 to-yellow-500/10 border-b border-yellow-500/20">
      <div class="max-w-7xl mx-auto px-4 py-5">
        <div class="flex items-center gap-4">
          <!-- 返回按钮 -->
          <router-link to="/" class="inline-flex items-center gap-1.5 text-yellow-400/80 hover:text-yellow-400 transition px-2 py-1 rounded-lg bg-yellow-500/10 -ml-1 border border-yellow-500/20">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            <span class="text-sm font-medium">返回首页</span>
          </router-link>
          <div class="w-14 h-14 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/10 transform rotate-3">
            <svg class="w-7 h-7 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
            </svg>
          </div>
          <div class="flex-1">
            <h1 class="text-xl font-bold text-yellow-400 drop-shadow-sm">交易所详情</h1>
            <p class="text-yellow-500/60 text-sm mt-0.5">全球加密货币交易所详细信息</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading && !exchangeInfo.name" class="max-w-7xl mx-auto px-4 py-6 sm:py-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <div v-for="i in 3" :key="i" class="bg-[#16162a] rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-yellow-500/15 animate-pulse">
          <div class="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div class="w-12 sm:w-16 h-12 sm:h-16 bg-[#1e1e35] rounded-xl sm:rounded-2xl"></div>
            <div class="flex-1">
              <div class="h-5 sm:h-6 bg-[#1e1e35] rounded w-24 sm:w-32 mb-2"></div>
              <div class="h-3 sm:h-4 bg-[#1e1e35] rounded w-16 sm:w-20"></div>
            </div>
          </div>
          <div class="space-y-2">
            <div class="h-3 sm:h-4 bg-[#1e1e35] rounded"></div>
            <div class="h-3 sm:h-4 bg-[#1e1e35] rounded w-3/4"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error && !exchangeInfo.name" class="max-w-7xl mx-auto px-4 py-12 sm:py-16 text-center">
      <div class="bg-[#16162a] rounded-xl sm:rounded-2xl p-8 sm:p-12 border border-yellow-500/15 inline-block">
        <div class="text-red-400 mb-4">
          <svg class="w-12 sm:w-16 h-12 sm:h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        </div>
        <p class="text-slate-500 mb-4">{{ error }}</p>
        <router-link to="/" class="inline-flex px-4 sm:px-6 py-2 sm:py-3 bg-yellow-500/10 text-yellow-400 rounded-lg sm:rounded-xl hover:bg-yellow-500/20 transition border border-yellow-500/20 shadow-md">
          返回首页
        </router-link>
      </div>
    </div>

    <!-- 交易所详情 -->
    <div v-else-if="exchangeInfo.name" class="max-w-7xl mx-auto px-4 py-6 sm:py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <!-- 左侧主内容 -->
        <div class="lg:col-span-2 space-y-4 sm:space-y-6">
          <!-- 交易所概览卡片 -->
          <div class="bg-[#16162a] rounded-xl sm:rounded-2xl border border-yellow-500/15 overflow-hidden">
            <div class="bg-gradient-to-r from-yellow-500/5 to-yellow-500/10 px-4 sm:px-6 py-4 sm:py-5 border-b border-yellow-500/10">
              <div class="flex items-center gap-3 sm:gap-4">
                <img :src="exchangeInfo.logo" :alt="exchangeInfo.name" class="w-14 sm:w-20 h-14 sm:h-20 rounded-xl sm:rounded-2xl bg-[#1e1e35] shadow-lg p-1 border border-yellow-500/10">
                <div class="flex-1 min-w-0">
                  <h2 class="text-lg sm:text-2xl font-bold text-slate-200 mb-1 truncate">{{ getExchangeNameZh(exchangeInfo.id) || exchangeInfo.name }}</h2>
                  <div class="flex flex-wrap items-center gap-2">
                    <span v-if="exchangeInfo.rank && exchangeInfo.rank !== '-'" class="px-2 sm:px-3 py-0.5 sm:py-1 bg-yellow-500/10 backdrop-blur-sm rounded-lg text-yellow-400 text-xs sm:text-sm font-medium border border-yellow-500/20">
                      🏆 #{{ exchangeInfo.rank }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div class="p-4 sm:p-6">
              <!-- 核心数据 -->
              <div class="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div class="bg-yellow-500/5 rounded-xl p-3 sm:p-4 border border-yellow-500/10">
                  <p class="text-xs text-slate-500 mb-1">24h成交额</p>
                  <p class="text-base sm:text-xl font-bold text-slate-200 truncate">{{ exchangeInfo.volume24h }}</p>
                </div>
                <div class="bg-green-500/5 rounded-xl p-3 sm:p-4 border border-green-500/10">
                  <p class="text-xs text-slate-500 mb-1">交易对</p>
                  <p class="text-base sm:text-xl font-bold text-slate-200">{{ exchangeInfo.tradingPairs }}</p>
                </div>
                <div class="bg-blue-500/5 rounded-xl p-3 sm:p-4 border border-blue-500/10">
                  <p class="text-xs text-slate-500 mb-1">地区</p>
                  <p class="text-base sm:text-xl font-bold text-slate-200 truncate">{{ exchangeInfo._countryDisplay }}</p>
                </div>
                <div class="bg-purple-500/5 rounded-xl p-3 sm:p-4 border border-purple-500/10">
                  <p class="text-xs text-slate-500 mb-1">KYC</p>
                  <p class="text-base sm:text-xl font-bold text-slate-200">
                    {{ exchangeInfo._kycDisplay === '是' ? '✅' : exchangeInfo._kycDisplay === '否' ? '❌' : '❓' }}
                  </p>
                </div>
              </div>

              <!-- 简介 -->
              <div class="mb-4 sm:mb-6">
                <h3 class="text-base sm:text-lg font-bold text-slate-300 mb-2 sm:mb-3 flex items-center gap-2">
                  <span class="w-1 h-5 sm:h-6 bg-gradient-to-b from-yellow-500 to-amber-500 rounded-full"></span>
                  交易所简介
                </h3>
                <div class="bg-[#1e1e35] rounded-xl p-3 sm:p-4 border border-yellow-500/10 min-h-[60px] sm:min-h-[80px]">
                  <p v-if="exchangeDescription" class="text-slate-400 text-sm sm:text-base leading-relaxed">
                    {{ exchangeDescription }}
                  </p>
                  <p v-else class="text-slate-600 italic text-sm">
                    该交易所暂无详细描述，可访问官网了解更多。
                  </p>
                </div>
              </div>

              <!-- 链接 -->
              <div class="flex flex-wrap gap-2 sm:gap-3">
                <a :href="exchangeInfo.officialUrl" target="_blank" class="px-3 sm:px-5 py-2 sm:py-2.5 bg-yellow-500/10 text-yellow-400 rounded-lg sm:rounded-xl hover:bg-yellow-500/20 transition flex items-center gap-2 text-sm font-medium border border-yellow-500/20">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                  </svg>
                  访问官网
                </a>
                <a v-if="exchangeInfo.twitter" :href="exchangeInfo.twitter" target="_blank" class="px-5 py-2.5 bg-[#1e1e35] text-slate-400 rounded-xl hover:bg-[#1e1e35]/80 transition flex items-center gap-2 border border-yellow-500/10">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.514l-5.106-6.677-5.829 6.677h-3.328l7.754-8.835L2.25 2.25h6.514l4.721 6.244 5.259-6.244zM17.002 20.331h1.834L6.822 4.189H4.853l12.149 16.142z"/></svg>
                  Twitter
                </a>
                <a v-if="exchangeInfo.telegram" :href="exchangeInfo.telegram" target="_blank" class="px-5 py-2.5 bg-[#1e1e35] text-slate-400 rounded-xl hover:bg-[#1e1e35]/80 transition flex items-center gap-2 border border-yellow-500/10">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                  Telegram
                </a>
              </div>
            </div>
          </div>

          <!-- 交易对列表 -->
          <div class="bg-[#16162a] rounded-xl sm:rounded-2xl border border-yellow-500/15 overflow-hidden">
            <div class="px-4 sm:px-6 py-3 sm:py-5 border-b border-yellow-500/10">
              <h3 class="text-sm sm:text-lg font-bold text-slate-300 flex items-center gap-2">
                <span class="w-1 h-5 sm:h-6 bg-gradient-to-b from-yellow-500 to-amber-500 rounded-full"></span>
                <span class="hidden xs:inline">{{ getExchangeNameZh(exchangeInfo.id) || exchangeInfo.name }}</span>
                <span class="xs:hidden">交易对</span>
              </h3>
            </div>

            <!-- 加载状态 -->
            <div v-if="pairsLoading" class="flex justify-center py-8 sm:py-12">
              <div class="animate-spin w-8 h-8 sm:w-10 sm:h-10 border-2 sm:border-3 border-yellow-500/20 border-t-yellow-500 rounded-full"></div>
            </div>

            <!-- 表格 -->
            <div v-else class="sm:overflow-x-auto">
              <!-- 移动端卡片布局 -->
              <div class="sm:hidden divide-y divide-yellow-500/10">
                <div v-if="tradingPairs.length === 0" class="px-4 py-8 text-center text-slate-600 text-sm">
                  暂无交易对数据
                </div>
                <div
                  v-for="(pair, index) in tradingPairs.slice(0, 10)"
                  :key="pair.symbol"
                  class="px-4 py-3 hover:bg-yellow-500/5 transition"
                >
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2">
                      <span class="w-6 h-6 flex items-center justify-center rounded font-bold text-xs" :class="index < 3 ? 'bg-yellow-500/10 text-yellow-400' : 'bg-[#1e1e35] text-slate-500'">
                        {{ index + 1 }}
                      </span>
                      <img v-if="pair.coinIcon" :src="pair.coinIcon" class="w-6 h-6 rounded-full" @error="(e) => e.target.style.display = 'none'">
                      <span class="font-bold text-slate-200">{{ pair.symbol }}</span>
                    </div>
                  </div>
                  <div class="flex justify-between text-xs text-slate-500 pl-8">
                    <span>{{ pair.price }}</span>
                    <span>市值: {{ pair.marketCap }}</span>
                  </div>
                </div>
              </div>

              <!-- 桌面端表格 -->
              <table v-if="tradingPairs.length > 0" class="hidden sm:table w-full">
                <thead class="bg-[#1e1e35] border-b border-yellow-500/10">
                  <tr>
                    <th class="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">#</th>
                    <th class="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">交易对</th>
                    <th class="px-4 sm:px-6 py-3 sm:py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">最新价</th>
                    <th class="px-4 sm:px-6 py-3 sm:py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">24H成交额</th>
                    <th class="px-4 sm:px-6 py-3 sm:py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">市值</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-yellow-500/10">
                  <tr v-for="(pair, index) in tradingPairs" :key="pair.symbol" class="hover:bg-yellow-500/5 transition">
                    <td class="px-4 sm:px-6 py-3 sm:py-4">
                      <span class="w-6 sm:w-8 h-6 sm:h-8 flex items-center justify-center rounded-lg font-bold text-xs sm:text-sm" :class="index < 3 ? 'bg-yellow-500/10 text-yellow-400' : 'bg-[#1e1e35] text-slate-500'">
                        {{ index + 1 }}
                      </span>
                    </td>
                    <td class="px-4 sm:px-6 py-3 sm:py-4">
                      <div class="flex items-center gap-2 sm:gap-3">
                        <img v-if="pair.coinIcon" :src="pair.coinIcon" :alt="pair.symbol" class="w-8 h-8 rounded-full" @error="(e) => e.target.style.display = 'none'">
                        <div>
                          <p class="font-bold text-slate-200">{{ pair.symbol }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 text-right font-mono font-medium text-slate-300">{{ pair.price }}</td>
                    <td class="px-6 py-4 text-right text-slate-400">${{ pair.volume24h }}</td>
                    <td class="px-6 py-4 text-right text-slate-400">{{ pair.marketCap }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- 右侧信息栏 -->
        <aside class="space-y-6">
          <!-- 关注交易所 -->
          <div class="bg-gradient-to-br from-yellow-500/10 via-yellow-500/15 to-amber-500/10 rounded-2xl p-6 border border-yellow-500/20 shadow-lg shadow-yellow-500/5 relative overflow-hidden">
            <div class="absolute -top-10 -right-10 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl"></div>
            <div class="relative">
              <h3 class="font-bold text-lg mb-2 text-yellow-400">🏆 关注交易所</h3>
              <p class="text-yellow-500/60 text-sm mb-4">获取最新动态和深度分析</p>
              <button class="w-full py-3 bg-yellow-500/10 text-yellow-400 font-bold rounded-xl hover:bg-yellow-500/20 transition border border-yellow-500/20 shadow-lg">
                + 关注
              </button>
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
import { fetchExchangeDetail, getNavigationExchange, getPresetDescription, getExchangeNameZh, fetchExchanges, getExchangeCountryZh, getExchangeKycZh } from '../store/exchange'
import { updatePageSeo } from '../utils/seo'

const route = useRoute()

const loading = ref(true)
const error = ref(null)
const pairsLoading = ref(true)
const exchangeDescription = ref('')
const baseUrl = 'https://openupbtc.com'
let refreshTimer = null

const setExchangeSeo = (exchangeId) => {
  const displayName = getExchangeNameZh(exchangeId) || exchangeInfo.name || '交易所'
  const description = exchangeDescription.value ? exchangeDescription.value.slice(0, 120) : `查看${displayName}交易所详情，包括排名、24小时成交额、交易对数量、地区与KYC信息。`

  updatePageSeo({
    title: `${displayName}交易所详情 - 排名、交易对与成交额 - 比特视界`,
    description,
    keywords: `${displayName},${exchangeId},加密货币交易所,交易所排名,交易平台,比特视界`,
    image: exchangeInfo.logo || `${baseUrl}/logo.png`,
    url: `${baseUrl}/exchange/${exchangeId}`,
    type: 'website'
  })
}

const exchangeInfo = reactive({
  name: '', logo: '', rank: '-', followers: 0, description: '',
  officialUrl: '#', twitter: '', telegram: '', region: '-',
  tradingPairs: '-', apiEnabled: false, kyc: false, volume24h: '-'
})

const tradingPairs = ref([])

const loadExchangeData = async (exchangeId) => {
  loading.value = true
  error.value = null
  pairsLoading.value = true
  exchangeDescription.value = ''

  let previewData = null
  if (route.query.p) {
    try {
      previewData = JSON.parse(decodeURIComponent(atob(route.query.p)))
    } catch { previewData = null }
  }
  if (!previewData) { previewData = getNavigationExchange() }
  if (previewData) {
    exchangeInfo.name = previewData.name || '加载中...'
    exchangeInfo.logo = previewData.image || previewData.logo || ''
    exchangeInfo.rank = previewData.trust_score_rank || '-'
    exchangeInfo.tradingPairs = previewData.number_of_markets || '-'
    exchangeInfo.volume24h = '$' + formatVolume(previewData.trade_volume_24h_btc)
  }

  try {
    const detail = await fetchExchangeDetail(exchangeId)
    Object.assign(exchangeInfo, detail)
    exchangeInfo._countryDisplay = getExchangeCountryZh(exchangeId) || exchangeInfo.region || '-'
    exchangeInfo._kycDisplay = getExchangeKycZh(exchangeId) || '未知'
    if (detail.tradingPairsList) { tradingPairs.value = detail.tradingPairsList }
    const presetDesc = getPresetDescription(exchangeId)
    if (presetDesc) { exchangeDescription.value = presetDesc }
  } catch (err) {
    console.error('加载交易所数据失败:', err)
    error.value = '数据加载失败，请检查网络'
  } finally {
    loading.value = false
    pairsLoading.value = false
    setExchangeSeo(exchangeId)
  }
}

const scheduleMidnightRefresh = () => {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 1, 0, 0)
  const msUntilMidnight = tomorrow.getTime() - now.getTime()

  fetchExchanges(false).catch(() => {})

  refreshTimer = setTimeout(() => {
    fetchExchanges(true).catch(() => {})
    refreshTimer = setInterval(() => {
      fetchExchanges(true).catch(() => {})
    }, 24 * 60 * 60 * 1000)
  }, msUntilMidnight)
}

onMounted(() => {
  scheduleMidnightRefresh()
  const exchangeId = route.params.id
  if (exchangeId) { loadExchangeData(exchangeId) } else { error.value = '缺少交易所ID'; loading.value = false }
})

onUnmounted(() => {
  if (refreshTimer) { clearTimeout(refreshTimer); clearInterval(refreshTimer); refreshTimer = null }
})

watch(() => route.params.id, (newId) => {
  if (newId) { loadExchangeData(newId) }
})

const formatVolume = (vol) => {
  if (!vol) return '-'
  if (vol >= 1e9) return (vol / 1e9).toFixed(2) + 'B'
  if (vol >= 1e6) return (vol / 1e6).toFixed(2) + 'M'
  if (vol >= 1e3) return (vol / 1e3).toFixed(2) + 'K'
  return vol.toFixed(2)
}
</script>