<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-50 to-white">
    <!-- 海报图 -->
    <div class="max-w-6xl mx-auto px-4 py-4">
      <img src="@/assets/banner.png" alt="交易所榜单" class="w-full h-auto object-cover rounded-xl shadow-lg" />
    </div>

    <!-- 内容区域 -->
    <div class="max-w-6xl mx-auto px-4 py-6">
      <!-- 搜索和排序 -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-3">
          <select
            v-model="sortBy"
            class="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-orange-400"
          >
            <option value="trust_score_rank">评分排序</option>
            <option value="trade_volume_24h">交易量排序</option>
            <option value="name">名称排序</option>
          </select>
        </div>
      </div>

      <!-- 表格头部 - 桌面端 -->
      <div class="hidden sm:flex bg-slate-200 rounded-t-xl px-4 lg:px-6 py-3 items-center text-xs font-semibold text-slate-500 uppercase tracking-wide">
        <div class="w-12">排名</div>
        <div class="flex-1">交易所</div>
        <div class="w-24 lg:w-28 text-center">类型</div>
        <div class="w-28 lg:w-32 text-right">24h交易量</div>
        <div class="hidden lg:block w-20 text-center">国家</div>
        <div class="hidden sm:block w-20 lg:w-24 text-center">评分</div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="bg-white rounded-b-xl p-8 sm:p-12 text-center">
        <div class="animate-spin w-10 h-10 mx-auto mb-4 border-3 border-orange-500 border-t-transparent rounded-full"></div>
        <p class="text-slate-500">正在加载交易所数据...</p>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="bg-white rounded-b-xl p-8 sm:p-12 text-center">
        <p class="text-red-500 mb-4">{{ error }}</p>
        <button @click="handleRefresh" class="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
          重试
        </button>
      </div>

      <!-- 数据列表 -->
      <div v-else class="bg-white rounded-b-xl divide-y divide-slate-100">
        <div
          v-for="(exchange, index) in filteredAndSortedExchanges"
          :key="exchange.id"
          class="px-4 py-3 sm:py-4 hover:bg-orange-50/50 transition cursor-pointer group"
          @click="navigateToDetail(exchange)"
          @mouseenter="prefetchDetail(exchange.id)"
        >
          <!-- 移动端卡片布局 -->
          <div class="sm:hidden">
            <div class="flex items-center gap-3 mb-2">
              <span
                class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                :class="{
                  'bg-amber-400 text-white': index === 0,
                  'bg-slate-300 text-white': index === 1,
                  'bg-amber-600 text-white': index === 2,
                  'bg-slate-100 text-slate-500': index > 2
                }"
              >
                {{ index + 1 }}
              </span>
              <img :src="exchange.image" :alt="exchange.name" class="w-10 h-10 rounded-full object-cover" @error="(e) => e.target.style.display = 'none'" />
              <div class="flex-1 min-w-0">
                <div class="font-semibold text-black group-hover:text-orange-600 transition truncate">
                  {{ getExchangeNameZh(exchange.id) || exchange.name }}
                </div>
                <div class="text-xs text-slate-400">
                  {{ getExchangeDescZh(exchange.id) || exchange.country || '-' }}
                </div>
              </div>
            </div>
            <div class="flex items-center justify-between pl-11">
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 bg-white text-gray-700 text-xs rounded border border-slate-200">{{ exchange._typeDisplay }}</span>
                <span class="text-sm">{{ exchange._countryDisplay }}</span>
              </div>
              <div class="text-right">
                <div class="font-mono font-semibold text-slate-800 text-sm">
                  ${{ formatVolume(exchange.trade_volume_24h_btc) }} BTC
                </div>
              </div>
            </div>
          </div>

          <!-- 桌面端表格布局 -->
          <div class="hidden sm:flex items-center px-2 lg:px-0">
            <!-- 排名 -->
            <div class="w-12 flex items-center justify-center">
              <span
                class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                :class="{
                  'bg-amber-400 text-white': index === 0,
                  'bg-slate-300 text-white': index === 1,
                  'bg-amber-600 text-white': index === 2,
                  'bg-slate-100 text-slate-500': index > 2
                }"
              >
                {{ index + 1 }}
              </span>
            </div>

            <!-- 交易所信息 -->
            <div class="flex-1 flex items-center gap-3">
              <img
                :src="exchange.image"
                :alt="exchange.name"
                class="w-10 h-10 rounded-full object-cover"
                @error="(e) => e.target.style.display = 'none'"
              />
              <div>
                <div class="font-semibold text-black group-hover:text-orange-600 transition">
                  {{ getExchangeNameZh(exchange.id) || exchange.name }}
                </div>
                <div class="text-xs text-slate-400 hidden lg:block">
                  {{ getExchangeDescZh(exchange.id) || exchange.country || '-' }}
                </div>
              </div>
            </div>

            <!-- 类型 -->
            <div class="w-24 lg:w-28 flex justify-center">
              <span class="px-2 py-1 bg-white text-gray-700 text-xs rounded border border-slate-200">
                {{ exchange._typeDisplay }}
              </span>
            </div>

            <!-- 24h交易量 -->
            <div class="w-28 lg:w-32 text-right">
              <div class="font-mono font-semibold text-slate-800">
                ${{ formatVolume(exchange.trade_volume_24h_btc) }} BTC
              </div>
              <div class="text-xs text-slate-400 hidden lg:block">
                ≈ ${{ formatVolume((exchange.trade_volume_24h_btc || 0) * 67500) }}
              </div>
            </div>

            <!-- 国家 -->
            <div class="hidden lg:block w-20 text-center">
              <span class="text-sm text-slate-500">
                {{ exchange._countryDisplay }}
              </span>
            </div>

            <!-- 评分 -->
            <div class="hidden sm:flex w-20 lg:w-24 items-center justify-center gap-0.5">
              <svg
                v-for="i in 10"
                :key="i"
                class="w-3.5 h-3.5"
                :class="i <= (exchange.trust_score || 0) ? 'text-amber-400' : 'text-slate-200'"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部提示 -->
      <div class="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl">
        <p class="text-xs text-blue-600 text-center">
          数据来源:CoinGecko | 评分基于交易量、流动性、监管合规性等维度综合评估
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchExchanges, setNavigationExchange, getExchangeNameZh, getExchangeDescZh, getExchangeCountryZh, getCountryZh, getExchangeTypeZh } from '../store/exchange'

const router = useRouter()

const sortBy = ref('trust_score_rank')
const loading = ref(true)
const error = ref(null)

const exchanges = ref([])

// ... [保留原有的 countryFlags, countryToRegion, getCountryFlag, getRegion 代码] ...
const countryFlags = {
  'CN': '🇨🇳', 'US': '🇺🇸', 'HK': '🇭🇰', 'JP': '🇯🇵', 'KR': '🇰🇷',
  'UK': '🇬🇧', 'DE': '🇩🇪', 'SG': '🇸🇬', 'AU': '🇦🇺', 'CA': '🇨🇦',
  'SE': '🇸🇪', 'CH': '🇨🇭', 'VN': '🇻🇳', 'TH': '🇹🇭', 'MY': '🇲🇾',
  'IN': '🇮🇳', 'BR': '🇧🇷', 'RU': '🇷🇺', 'EU': '🇪🇺'
}

const getCountryFlag = (country) => {
  return countryFlags[country] || '🌍'
}

const countryToRegion = {
  // ... [保留原有映射数据] ...
  'CN': '🌏 亚太', 'HK': '🌏 亚太', 'JP': '🌏 亚太', 'KR': '🌏 亚太',
  'SG': '🌏 亚太', 'VN': '🌏 亚太', 'TH': '🌏 亚太', 'MY': '🌏 亚太',
  'IN': '🌏 亚太', 'ID': '🌏 亚太', 'PH': '🌏 亚太', 'TW': '🌏 亚太',
  'AU': '🌏 亚太', 'NZ': '🌏 亚太',
  'US': '🌎 北美', 'CA': '🌎 北美', 'MX': '🌎 北美',
  'UK': '🌍 欧洲', 'DE': '🌍 欧洲', 'SE': '🌍 欧洲', 'CH': '🌍 欧洲',
  'RU': '🌍 欧洲', 'EU': '🌍 欧洲', 'NL': '🌍 欧洲', 'FR': '🌍 欧洲',
  'ES': '🌍 欧洲', 'IT': '🌍 欧洲', 'PL': '🌍 欧洲', 'CY': '🌍 欧洲',
  'AE': '🏜️ 中东', 'IL': '🏜️ 中东', 'TR': '🏜️ 中东', 'SA': '🏜️ 中东',
  'BR': '🌎 南美', 'AR': '🌎 南美', 'CL': '🌎 南美', 'VE': '🌎 南美',
  'KE': '🌍 非洲', 'NG': '🌍 非洲', 'ZA': '🌍 非洲',
}

const getRegion = (country) => {
  return countryToRegion[country] || (country ? '🌍 其他' : '-')
}

const loadExchanges = async (forceRefresh = false) => {
  try {
    loading.value = true
    error.value = null
    const list = await fetchExchanges(forceRefresh)
 exchanges.value = list.map(e => ({
      ...e,
      _countryDisplay: getExchangeCountryZh(e.id) || getCountryZh(e.country) || '-',
      _typeDisplay: getExchangeTypeZh(e.id) || 'CEX'
    }))
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const handleRefresh = () => {
  loadExchanges(true)
}

const navigateToDetail = (exchange) => {
  const preview = btoa(encodeURIComponent(JSON.stringify({
    name: exchange.name || '',
    image: exchange.image || '',
    trust_score_rank: exchange.trust_score_rank || '-',
    number_of_markets: exchange.number_of_markets || '-',
    trade_volume_24h_btc: exchange.trade_volume_24h_btc || 0
  })))
  router.push({
    name: 'ExchangeDetail',
    params: { id: exchange.id },
    query: { p: preview }
  })
}

onMounted(() => {
  loadExchanges()
})

const formatVolume = (vol) => {
  if (!vol) return '-'
  if (vol >= 1e9) return (vol / 1e9).toFixed(2) + 'B'
  if (vol >= 1e6) return (vol / 1e6).toFixed(2) + 'M'
  if (vol >= 1e3) return (vol / 1e3).toFixed(2) + 'K'
  return vol.toFixed(2)
}

// --- 新增代码开始 ---

// 只展示指定的 6 家交易所
// 注意：火币在 CoinGecko 中常见 id 为 htx，这里同时兼容 huobi/htx
const ALLOWED_EXCHANGE_IDS = new Set([
  'binance',
  'okex',
  'okx',
  'bybitspot',
  'bybit',
  'gateio',
  'gate',
  'bitget',
  'huobi',
  'htx'
])

// 创建过滤后的排序列表
const filteredAndSortedExchanges = computed(() => {
  // 1. 先过滤出白名单中的交易所
  let result = exchanges.value.filter(exchange => ALLOWED_EXCHANGE_IDS.has(exchange.id))

  // 2. 再排序
  if (sortBy.value === 'trust_score_rank') {
    result.sort((a, b) => a.trust_score_rank - b.trust_score_rank)
  } else if (sortBy.value === 'trade_volume_24h') {
    result.sort((a, b) => b.trade_volume_24h_btc - a.trade_volume_24h_btc)
  } else if (sortBy.value === 'name') {
    result.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
  }

  return result
})

// --- 新增代码结束 ---

// 注意：模板中已使用 filteredAndSortedExchanges
</script>