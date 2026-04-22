<template>
  <div class="min-h-screen bg-[#0f0f1a] text-slate-200">
    <div class="max-w-[1400px] mx-auto px-3 md:px-4 py-3 md:py-4 space-y-3 md:space-y-4">
      <!-- 顶部无缝滚动行情条 -->
      <section class="bg-[#16162a] border border-yellow-500/20 rounded-2xl shadow-lg shadow-yellow-500/5 overflow-hidden">
        <div class="overflow-hidden py-2 bg-[#0f0f1a]/50">
          <div class="ticker-wrapper">
            <div class="ticker-content">
              <button
                v-for="coin in [...tickerCoins, ...tickerCoins]"
                :key="coin.symbol + '-' + Math.random()"
                class="flex items-center gap-2 px-4 py-1.5 bg-[#1e1e35] border border-yellow-500/20 rounded-xl hover:border-yellow-500/60 hover:bg-[#1e1e35]/80 transition whitespace-nowrap mx-2"
                @click="goToChart(coin.symbol)"
              >
                <img
                  :src="'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/' + coin.symbol.toLowerCase() + '.png'"
                  class="w-5 h-5 rounded-full"
                  @error="onImageError($event)"
                  :alt="coin.symbol"
                >
                <div class="leading-tight text-left">
                  <div class="text-xs font-semibold text-slate-200">{{ coin.symbol }}</div>
                  <div class="text-[11px] text-slate-400">${{ formatPrice(coin.price) }}</div>
                </div>
                <span class="text-[11px] font-semibold px-2 py-1 rounded-lg" :class="coin.change >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'">
                  {{ coin.change >= 0 ? '+' : '' }}{{ (coin.change || 0).toFixed(2) }}%
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- 三栏主体 -->
      <section class="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)_320px] gap-3 md:gap-4 items-start">
        <!-- 左：恐慌指数 + 币种排行 -->
        <div class="space-y-3 md:space-y-4 xl:sticky xl:top-[72px]">
          <!-- 市场情绪 -->
          <div class="bg-[#16162a] border border-yellow-500/20 rounded-2xl shadow-lg shadow-yellow-500/5 overflow-hidden">
            <div class="px-4 py-3 border-b border-yellow-500/10 flex items-center justify-between">
              <div>
                <h2 class="text-sm font-semibold text-slate-200">市场情绪</h2>
              </div>
              <!-- <span class="text-lg">😶‍🌫️</span> -->
            </div>
            <div class="p-4">
              <div class="rounded-2xl p-4 border" :class="fearGreedIndex >= 50 ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'">
                <div class="flex items-end justify-between gap-3">
                  <div>
                    <div class="text-xs text-slate-500 mb-1">恐慌与贪婪指数</div>
                    <div class="text-4xl font-bold leading-none" :class="fearGreedIndex >= 50 ? 'text-green-400' : 'text-red-400'">{{ fearGreedIndex }}</div>
                  </div>
                  <span class="text-xs font-semibold px-2.5 py-1.5 rounded-full" :class="fearGreedIndex >= 50 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'">
                    {{ fearGreedIndex >= 50 ? '偏贪婪' : '偏恐慌' }}
                  </span>
                </div>
                <div class="mt-4 h-2.5 bg-[#0f0f1a] rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-500"
                    :class="fearGreedIndex >= 50 ? 'bg-green-500' : 'bg-red-500'"
                    :style="{ width: fearGreedIndex + '%' }"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- 币种排行 -->
          <div class="bg-[#16162a] border border-yellow-500/20 rounded-2xl shadow-lg shadow-yellow-500/5 overflow-hidden">
            <div class="px-4 py-3 border-b border-yellow-500/10 flex items-center justify-between">
              <div>
                <h2 class="text-sm font-semibold text-slate-200">币种排行</h2>
              </div>
              <span class="text-xs text-yellow-500/60">Top {{ sortedList.length }}</span>
            </div>
            <div class="divide-y divide-yellow-500/10">
              <button
                v-for="(coin, index) in sortedList"
                :key="coin.symbol"
                class="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-yellow-500/5 transition"
                @click="goToChart(coin.symbol)"
              >
                <div class="w-7 text-xs font-semibold text-slate-500">{{ index + 1 }}</div>
                <img
                  :src="'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/' + coin.symbol.toLowerCase() + '.png'"
                  class="w-8 h-8 rounded-full"
                  @error="onImageError($event)"
                  :alt="coin.symbol"
                >
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="font-semibold text-sm text-slate-200">{{ coin.symbol }}</span>
                    <span class="text-[11px] text-slate-500 truncate">{{ coin.name }}</span>
                  </div>
                  <div class="text-xs text-slate-400 mt-0.5">${{ formatPrice(coin.price) }}</div>
                </div>
                <div class="text-right">
                  <div class="text-sm font-semibold" :class="coin.change >= 0 ? 'text-green-400' : 'text-red-400'">
                    {{ coin.change >= 0 ? '+' : '' }}{{ (coin.change || 0).toFixed(2) }}%
                  </div>
                  <div class="text-[11px] text-slate-500">¥{{ formatCNY(coin.price) }}</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        <!-- 中：快讯 -->
        <div class="bg-[#16162a] border border-yellow-500/20 rounded-2xl shadow-lg shadow-yellow-500/5 overflow-hidden min-w-0">
          <div class="px-4 py-3 border-b border-yellow-500/10 flex items-center justify-between gap-3">
            <div>
              <h2 class="text-sm font-semibold text-slate-200">资讯</h2>
            </div>
            <div class="text-xs text-yellow-500/60">{{ newsList.length }} 条</div>
          </div>

          <div v-if="newsLoading" class="p-6 text-center text-sm text-slate-500">快讯加载中...</div>
          <div v-else class="divide-y divide-yellow-500/10">
            <button
              v-for="item in newsList"
              :key="item.id"
              class="w-full text-left px-4 py-3 hover:bg-yellow-500/5 transition"
              @click="navigateToDetail(item)"
            >
              <div class="flex items-start gap-3">
                <div class="w-[58px] flex-shrink-0 text-center">
                  <div class="text-[11px] font-semibold text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-2 py-1">
                    {{ item.time }}
                  </div>
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex gap-3">
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span class="text-[11px] px-2 py-0.5 rounded-md bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">{{ '比特视界' }}</span>
                        <span class="text-[11px] text-slate-500">快讯</span>
                      </div>
                      <h3 class="text-sm md:text-[15px] font-semibold leading-6 text-slate-200 line-clamp-2">{{ item.title }}</h3>
                      <p v-if="item.description" class="mt-1.5 text-[13px] leading-6 text-slate-400 line-clamp-2">{{ item.description }}</p>
                    </div>
                    <div v-if="item.image" class="w-[120px] h-[80px] flex-shrink-0 rounded-lg overflow-hidden bg-[#1e1e35] border border-yellow-500/10">
                      <img :src="item.image" :alt="item.title" class="w-full h-full object-cover" loading="lazy" />
                    </div>
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>

        <!-- 右：交易所 -->
        <div class="bg-[#16162a] border border-yellow-500/20 rounded-2xl shadow-lg shadow-yellow-500/5 overflow-hidden xl:sticky xl:top-[72px]">
          <div class="px-4 py-3 border-b border-yellow-500/10 flex items-center justify-between">
            <div>
              <h2 class="text-sm font-semibold text-slate-200">交易所</h2>
            </div>
            <span class="text-xs text-yellow-500/60">Top {{ exchangeList.length }}</span>
          </div>

          <div v-if="exchangeLoading" class="p-6 text-center text-sm text-slate-500">交易所数据加载中...</div>
          <div v-else class="divide-y divide-yellow-500/10">
            <button
              v-for="(exchange, index) in exchangeList"
              :key="exchange.id"
              class="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-yellow-500/5 transition"
              @click="navigateToExchange(exchange)"
            >
              <div class="w-7 text-xs font-semibold" :class="index < 3 ? 'text-yellow-400' : 'text-slate-500'">{{ index + 1 }}</div>
              <img
                :src="exchange.image"
                :alt="exchange.name"
                class="w-8 h-8 rounded-full object-cover bg-[#1e1e35]"
                @error="onImageError($event)"
              >
              <div class="flex-1 min-w-0">
                <div class="text-sm font-semibold text-slate-200 truncate">{{ getExchangeNameZh(exchange.id) || exchange.name }}</div>
                <div class="text-[11px] text-slate-500 truncate mt-0.5">{{ getExchangeBrief(exchange) }}</div>
              </div>

              <!-- <div class="text-right">
                <div class="text-[13px] font-semibold text-yellow-400">#{{ exchange.trust_score_rank || index + 1 }}</div>
                <div class="text-[11px] text-slate-500">{{ formatVolume(exchange.trade_volume_24h_btc) }} BTC</div>
              </div> -->

            </button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchNewsList, setNavigationArticle } from '../stores/newsStore'
import { fetchExchanges, getExchangeNameZh, getExchangeCountryZh, getCountryZh, getExchangeTypeZh, getExchangeDescZh } from '../store/exchange'

const router = useRouter()
let ws = null
let hourlyTimer = null

const coinConfig = [
  { symbol: 'BTC', name: 'Bitcoin', market: 1400000000000, volume: 350000000000, supply: 19990000, pair: 'btcusdt' },
  { symbol: 'ETH', name: 'Ethereum', market: 260000000000, volume: 150000000000, supply: 120000000, pair: 'ethusdt' },
  { symbol: 'BNB', name: 'BNB', market: 87000000000, volume: 15000000000, supply: 153000000, pair: 'bnbusdt' },
  { symbol: 'SOL', name: 'Solana', market: 50000000000, volume: 25000000000, supply: 46000000, pair: 'solusdt' },
  { symbol: 'XRP', name: 'Ripple', market: 88000000000, volume: 25000000000, supply: 99000000000, pair: 'xrpusdt' },
  { symbol: 'TRX', name: 'TRON', market: 28000000000, volume: 5000000000, supply: 87000000000, pair: 'trxusdt' },
  { symbol: 'DOGE', name: 'Dogecoin', market: 14000000000, volume: 8000000000, supply: 140000000000, pair: 'dogeusdt' },
  { symbol: 'ADA', name: 'Cardano', market: 12000000000, volume: 3500000000, supply: 35000000000, pair: 'adausdt' },
  { symbol: 'AVAX', name: 'Avalanche', market: 11000000000, volume: 3500000000, supply: 41000000, pair: 'avaxusdt' },
  { symbol: 'DOT', name: 'Polkadot', market: 10000000000, volume: 2500000000, supply: 1500000000, pair: 'dotusdt' },
  { symbol: 'LINK', name: 'Chainlink', market: 9000000000, volume: 2500000000, supply: 600000000, pair: 'linkusdt' },
  { symbol: 'MATIC', name: 'Polygon', market: 8000000000, volume: 2000000000, supply: 9800000000, pair: 'polusdt' },
  { symbol: 'LTC', name: 'Litecoin', market: 7000000000, volume: 3000000000, supply: 76000000, pair: 'ltcusdt' },
]

const coinList = ref(coinConfig.map(c => ({ ...c, price: 0, change: 0 })))
const fearGreedIndex = ref(50)
const upPercent = ref(50)
const downPercent = ref(50)

const newsList = ref([])
const newsLoading = ref(true)
const exchangeList = ref([
  { id: 'binance', name: '币安', desc: '全球最大加密货币交易所', image: '/images/exchanges/binance.jpg' },
  { id: 'okx', name: 'OKX', desc: '全球领先的数字资产交易所', image: '/images/exchanges/okx.png' },
  { id: 'bybit', name: 'Bybit', desc: '专业加密合约及现货交易所', image: '/images/exchanges/bybit.jpg' },
  { id: 'gate', name: 'Gate.io', desc: '老牌加密货币交易所', image: '/images/exchanges/gate.png' },
  { id: 'bitget', name: 'Bitget', desc: '合约跟单领先的交易所', image: '/images/exchanges/bitget.png' },
  { id: 'htx', name: 'HTX', desc: '全球知名的数字资产交易平台', image: '/images/exchanges/htx.png' }
])
const exchangeLoading = ref(false)

const currentTickerIndex = ref(0)
let tickerAutoPlay = null

const tickerGroups = computed(() => {
  const coins = coinList.value
  const groupSize = 5
  const groups = []
  for (let i = 0; i < coins.length; i += groupSize) {
    groups.push(coins.slice(i, i + groupSize))
  }
  return groups
})

const nextTicker = () => {
  if (tickerGroups.value.length > 0) {
    currentTickerIndex.value = (currentTickerIndex.value + 1) % tickerGroups.value.length
  }
}

const prevTicker = () => {
  if (tickerGroups.value.length > 0) {
    currentTickerIndex.value = currentTickerIndex.value === 0
      ? tickerGroups.value.length - 1
      : currentTickerIndex.value - 1
  }
}

const startTickerAutoPlay = () => {
  stopTickerAutoPlay()
  tickerAutoPlay = setInterval(nextTicker, 4000)
}

const stopTickerAutoPlay = () => {
  if (tickerAutoPlay) {
    clearInterval(tickerAutoPlay)
    tickerAutoPlay = null
  }
}

const CACHE_KEY = 'market_square_stats_cache'
const CACHE_EXPIRY_KEY = 'market_square_stats_expiry'

// 恐慌贪婪仪表盘
const sortedList = computed(() => coinList.value)
const tickerCoins = computed(() => coinList.value.slice(0, 8))

const formatPrice = (p) => p ? Number(p).toFixed(2) : '0.00'
const formatCNY = (p) => p ? (p * 7.3).toFixed(0) : '0'
const formatVolume = (v) => {
  if (!v && v !== 0) return '-'
  if (v >= 1e9) return (v / 1e9).toFixed(2) + 'B'
  if (v >= 1e6) return (v / 1e6).toFixed(2) + 'M'
  if (v >= 1e3) return (v / 1e3).toFixed(2) + 'K'
  return Number(v).toFixed(2)
}

const onImageError = (e) => {
  e.target.style.display = 'none'
}

const goToChart = (symbol) => {
  router.push({ name: 'Chart', params: { symbol } })
}

const navigateToDetail = (item) => {
  setNavigationArticle(item)
  router.push({ name: 'NewsDetail', params: { id: item.id } })
}

const getExchangeBrief = (exchange) => {
  return exchange.desc || '-'
}

const navigateToExchange = (exchange) => {
  router.push({ name: 'ExchangeDetail', params: { id: exchange.id } })
}

const getNextMidnight = () => {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  return tomorrow.getTime()
}

const isCacheValid = () => {
  try {
    const expiry = localStorage.getItem(CACHE_EXPIRY_KEY)
    return expiry ? Date.now() < parseInt(expiry) : false
  } catch {
    return false
  }
}

const loadFromCache = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) return false
    const data = JSON.parse(cached)
    fearGreedIndex.value = data.fearIndex || 50
    upPercent.value = data.upPercent || 50
    downPercent.value = data.downPercent || 50
    return true
  } catch {
    return false
  }
}

const saveToCache = () => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      fearIndex: fearGreedIndex.value,
      upPercent: upPercent.value,
      downPercent: downPercent.value,
      savedAt: Date.now()
    }))
    localStorage.setItem(CACHE_EXPIRY_KEY, getNextMidnight().toString())
  } catch {}
}

const getNextHour = () => {
  const now = new Date()
  const nextHour = new Date(now)
  nextHour.setMinutes(0, 0, 0)
  nextHour.setHours(nextHour.getHours() + 1)
  return nextHour.getTime()
}

const setupHourlyRefresh = () => {
  if (hourlyTimer) clearTimeout(hourlyTimer)
  hourlyTimer = setTimeout(async () => {
    await fetchStats(true)
    await Promise.all([loadNews(true), loadExchangesData(true)])
    setupHourlyRefresh()
  }, getNextHour() - Date.now())
}

const fetchStats = async (forceRefresh = false) => {
  if (!forceRefresh && isCacheValid() && loadFromCache()) return

  try {
    const fearRes = await fetch('https://api.alternative.me/fng/')
    const fearData = await fearRes.json()
    if (fearData?.data?.[0]?.value) {
      fearGreedIndex.value = parseInt(fearData.data[0].value)
    }
  } catch (e) {
    console.error('fear index error:', e)
  }

  saveToCache()
}

const fetchChange = async () => {
  try {
    const promises = coinConfig.map(async (c) => {
      const res = await fetch(`https://www.openupbtc.com/binance-api/api/v3/ticker/24hr?symbol=${c.pair.toUpperCase()}`)
      const d = await res.json()
      return {
        symbol: c.symbol,
        price: d.lastPrice ? parseFloat(d.lastPrice) : 0,
        change: d.priceChangePercent ? parseFloat(d.priceChangePercent) : 0
      }
    })
    const results = await Promise.all(promises)
    results.forEach(r => {
      const idx = coinList.value.findIndex(c => c.symbol === r.symbol)
      if (idx !== -1) {
        coinList.value[idx] = { ...coinList.value[idx], price: r.price, change: r.change }
      }
    })
    const upCoins = results.filter(r => r.change > 0).length
    const downCoins = results.filter(r => r.change < 0).length
    const total = upCoins + downCoins
    upPercent.value = total > 0 ? Math.round((upCoins / total) * 100) : 50
    downPercent.value = total > 0 ? Math.round((downCoins / total) * 100) : 50
    saveToCache()
  } catch (e) {
    console.error('fetchChange error:', e)
  }
}

const connectWS = () => {
  const streams = coinConfig.map(c => c.pair + '@ticker').join('/')
  const wsUrl = `wss://www.openupbtc.com/binance-ws/stream?streams=${streams}`

  ws = new WebSocket(wsUrl)

  ws.onmessage = (e) => {
    try {
      const d = JSON.parse(e.data).data
      if (!d) return
      const c = coinList.value.find(x => x.symbol === d.s.replace('USDT', ''))
      if (c) {
        if (d.c) c.price = parseFloat(d.c)
        if (d.P) c.change = parseFloat(d.P)
      }
    } catch (err) {
      console.error("解析WS数据失败", err)
    }
  }

  ws.onerror = (err) => {
    console.error("WS连接发生错误:", err)
  }

  ws.onclose = () => {
    console.log("WS连接已断开，3秒后重连...")
    setTimeout(connectWS, 3000)
  }
}

const loadNews = async (forceRefresh = false) => {
  try {
    newsLoading.value = true
    const result = await fetchNewsList(forceRefresh)
    newsList.value = (result.articles || []).slice(0, 16)
  } catch (e) {
    console.error('loadNews error:', e)
    newsList.value = []
  } finally {
    newsLoading.value = false
  }
}

const TARGET_EXCHANGES = ['binance', 'okx', 'bybit', 'gate', 'bitget', 'htx']

const getCanonicalExchangeKey = (exchange) => {
  const rawId = String(exchange?.id || '').toLowerCase().trim()
  const rawName = String(exchange?.name || '').toLowerCase().trim()
  const zhName = String(getExchangeNameZh(exchange?.id) || '').toLowerCase().trim()
  const text = `${rawId} ${rawName} ${zhName}`

  if (text.includes('binance us')) return ''
  if (text.includes('binance')) return 'binance'
  if (text.includes('okx') || text.includes('okex') || zhName.includes('欧易')) return 'okx'
  if (text.includes('bybit')) return 'bybit'
  if (text.includes('gate.io') || text.includes('gate') || zhName.includes('芝麻')) return 'gate'
  if (text.includes('bitget')) return 'bitget'
  if (text.includes('htx') || text.includes('huobi') || zhName.includes('火币')) return 'htx'

  return ''
}

const loadExchangesData = () => {
  // 使用写死数据，无需加载
}

onMounted(async () => {
  loadFromCache()
  await Promise.all([fetchStats(), fetchChange(), loadNews()])
  connectWS()
  setupHourlyRefresh()
})

onUnmounted(() => {
  ws?.close()
  if (hourlyTimer) clearTimeout(hourlyTimer)
})
</script>

<style scoped>
.ticker-wrapper {
  width: 100%;
  overflow: hidden;
}

.ticker-content {
  display: flex;
  animation: ticker-scroll 30s linear infinite;
  width: max-content;
}

.ticker-content:hover {
  animation-play-state: paused;
}

@keyframes ticker-scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}
</style>