<template>
  <div class="max-w-7xl mx-auto px-4 py-6">
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center gap-3">
        <div class="w-1 h-7 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full"></div>
        <h2 class="text-xl font-bold text-gray-800">📊 K线行情</h2>
      </div>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-5">
      <section class="space-y-5">
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
            <div class="flex items-center gap-3 min-w-0">
              <img
                :src="coinIconUrl(selectedCoin.base)"
                :alt="selectedCoin.base"
                class="w-10 h-10 rounded-full object-cover bg-gray-50"
                @error="onImgError"
              >
              <div>
                <div class="text-lg font-bold text-gray-800">{{ selectedCoin.symbol }}</div>
                <div class="text-xs text-gray-400">{{ selectedCoin.name }}</div>
              </div>
            </div>

            <div class="text-right">
              <div class="text-2xl font-bold text-gray-900 font-mono">
                ${{ formatPrice(selectedTicker.lastPrice) }}
              </div>
              <div
                class="inline-flex items-center mt-1 px-2.5 py-1 rounded-lg text-sm font-semibold"
                :class="selectedTicker.priceChangePercent >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'"
              >
                {{ selectedTicker.priceChangePercent >= 0 ? '+' : '' }}{{ formatPercent(selectedTicker.priceChangePercent) }}%
              </div>
            </div>
          </div>

          <div class="p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="rounded-xl bg-slate-50 border border-slate-100 p-4">
              <div class="text-xs text-slate-400 mb-1">24H最高</div>
              <div class="text-base font-semibold text-slate-800 font-mono">${{ formatPrice(selectedTicker.highPrice) }}</div>
            </div>
            <div class="rounded-xl bg-slate-50 border border-slate-100 p-4">
              <div class="text-xs text-slate-400 mb-1">24H最低</div>
              <div class="text-base font-semibold text-slate-800 font-mono">${{ formatPrice(selectedTicker.lowPrice) }}</div>
            </div>
            <div class="rounded-xl bg-slate-50 border border-slate-100 p-4">
              <div class="text-xs text-slate-400 mb-1">24H成交量</div>
              <div class="text-base font-semibold text-slate-800 font-mono">{{ formatCompact(selectedTicker.volume) }}</div>
            </div>
            <div class="rounded-xl bg-slate-50 border border-slate-100 p-4">
              <div class="text-xs text-slate-400 mb-1">24H成交额</div>
              <div class="text-base font-semibold text-slate-800 font-mono">${{ formatCompact(selectedTicker.quoteVolume) }}</div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 min-h-[220px]">
          <div class="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <div>
              <h3 class="text-base font-bold text-gray-800">{{ selectedCoin.symbol }} 实时数据</h3>
              <p class="text-sm text-gray-400 mt-1">当前页已接入实时行情逻辑，后续可以继续接 K线图表。</p>
            </div>
            <div class="text-xs text-gray-400">
              {{ loading ? '加载中...' : `最近更新：${lastUpdated || '--'}` }}
            </div>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div class="rounded-xl border border-orange-100 bg-orange-50/60 p-4">
              <div class="text-xs text-orange-500 mb-1">最新价</div>
              <div class="text-lg font-bold text-gray-900 font-mono">${{ formatPrice(selectedTicker.lastPrice) }}</div>
            </div>
            <div class="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
              <div class="text-xs text-blue-500 mb-1">涨跌额</div>
              <div class="text-lg font-bold text-gray-900 font-mono">{{ signedPrice(selectedTicker.priceChange) }}</div>
            </div>
            <div class="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
              <div class="text-xs text-emerald-500 mb-1">涨跌幅</div>
              <div class="text-lg font-bold font-mono" :class="selectedTicker.priceChangePercent >= 0 ? 'text-green-600' : 'text-red-600'">
                {{ selectedTicker.priceChangePercent >= 0 ? '+' : '' }}{{ formatPercent(selectedTicker.priceChangePercent) }}%
              </div>
            </div>
            <div class="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <div class="text-xs text-slate-400 mb-1">开盘价</div>
              <div class="text-base font-semibold text-slate-800 font-mono">${{ formatPrice(selectedTicker.openPrice) }}</div>
            </div>
            <div class="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <div class="text-xs text-slate-400 mb-1">成交笔数</div>
              <div class="text-base font-semibold text-slate-800 font-mono">{{ formatCompact(selectedTicker.count) }}</div>
            </div>
            <div class="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <div class="text-xs text-slate-400 mb-1">加权均价</div>
              <div class="text-base font-semibold text-slate-800 font-mono">${{ formatPrice(selectedTicker.weightedAvgPrice) }}</div>
            </div>
          </div>
        </div>
      </section>

      <aside class="w-full">
        <div class="flex items-center gap-2 mb-4">
          <div class="w-1 h-5 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full"></div>
          <h3 class="font-bold text-gray-800">🔥 热门币种</h3>
        </div>
        <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div
            v-for="coin in hotCoins"
            :key="coin.symbol"
            @click="selectCoin(coin.symbol)"
            class="flex justify-between items-center px-4 py-3.5 border-b border-gray-50 cursor-pointer transition"
            :class="selectedSymbol === coin.symbol ? 'bg-gradient-to-r from-orange-50 to-amber-50' : 'hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50'"
          >
            <div class="flex items-center gap-3 min-w-0">
              <img
                :src="coinIconUrl(coin.base)"
                :alt="coin.base"
                class="w-8 h-8 rounded-full object-cover bg-gray-50"
                @error="onImgError"
              >
              <div class="min-w-0">
                <div class="font-bold text-gray-800 truncate">{{ coin.symbol }}</div>
                <div class="text-xs text-gray-400 truncate">{{ coin.name }}</div>
              </div>
            </div>
            <div class="text-right ml-3">
              <div class="font-mono font-semibold" :class="coin.priceChangePercent >= 0 ? 'text-green-500' : 'text-red-500'">
                ${{ formatPrice(coin.lastPrice) }}
              </div>
              <div class="text-xs font-medium" :class="coin.priceChangePercent >= 0 ? 'text-green-500' : 'text-red-500'">
                {{ coin.priceChangePercent >= 0 ? '+' : '' }}{{ formatPercent(coin.priceChangePercent) }}%
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'

const COIN_CONFIG = [
  { symbol: 'BTCUSDT', name: 'Bitcoin' },
  { symbol: 'ETHUSDT', name: 'Ethereum' },
  { symbol: 'BNBUSDT', name: 'BNB' },
  { symbol: 'SOLUSDT', name: 'Solana' },
  { symbol: 'XRPUSDT', name: 'XRP' },
  { symbol: 'DOGEUSDT', name: 'Dogecoin' }
]

const makeTicker = (symbol, name = '') => ({
  symbol,
  name,
  base: symbol.replace('USDT', ''),
  lastPrice: 0,
  priceChange: 0,
  priceChangePercent: 0,
  highPrice: 0,
  lowPrice: 0,
  volume: 0,
  quoteVolume: 0,
  openPrice: 0,
  weightedAvgPrice: 0,
  count: 0
})

const hotCoins = ref(COIN_CONFIG.map(item => makeTicker(item.symbol, item.name)))
const selectedSymbol = ref('BTCUSDT')
const loading = ref(false)
const lastUpdated = ref('')
let refreshTimer = null

const selectedCoin = computed(() => {
  return hotCoins.value.find(item => item.symbol === selectedSymbol.value) || hotCoins.value[0]
})

const selectedTicker = computed(() => selectedCoin.value || makeTicker('BTCUSDT', 'Bitcoin'))

const normalizeTicker = (raw, fallback = {}) => ({
  symbol: raw.symbol || fallback.symbol || 'BTCUSDT',
  name: fallback.name || raw.name || '',
  base: (raw.symbol || fallback.symbol || 'BTCUSDT').replace('USDT', ''),
  lastPrice: Number(raw.lastPrice || 0),
  priceChange: Number(raw.priceChange || 0),
  priceChangePercent: Number(raw.priceChangePercent || 0),
  highPrice: Number(raw.highPrice || raw.high || 0),
  lowPrice: Number(raw.lowPrice || raw.low || 0),
  volume: Number(raw.volume || 0),
  quoteVolume: Number(raw.quoteVolume || 0),
  openPrice: Number(raw.openPrice || 0),
  weightedAvgPrice: Number(raw.weightedAvgPrice || 0),
  count: Number(raw.count || 0)
})

const fetchTicker = async (symbol) => {
  const res = await fetch(`/binance-api/api/v3/ticker/24hr?symbol=${symbol}`)
  if (!res.ok) throw new Error(`ticker ${symbol} failed`)
  return res.json()
}

const fetchAllTickers = async () => {
  loading.value = true
  try {
    const results = await Promise.all(
      COIN_CONFIG.map(async (coin) => {
        try {
          const data = await fetchTicker(coin.symbol)
          return normalizeTicker(data, coin)
        } catch {
          return normalizeTicker({}, coin)
        }
      })
    )
    hotCoins.value = results
    lastUpdated.value = new Date().toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  } finally {
    loading.value = false
  }
}

const selectCoin = (symbol) => {
  selectedSymbol.value = symbol
}

const coinIconUrl = (base) => `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/${String(base || '').toLowerCase()}.png`

const onImgError = (e) => {
  e.target.style.display = 'none'
}

const formatPrice = (value) => {
  const num = Number(value || 0)
  if (!Number.isFinite(num)) return '0.00'
  if (num >= 1000) return num.toLocaleString('en-US', { maximumFractionDigits: 2 })
  if (num >= 1) return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })
  return num.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 8 })
}

const formatPercent = (value) => Number(value || 0).toFixed(2)

const formatCompact = (value) => {
  const num = Number(value || 0)
  if (!Number.isFinite(num)) return '0'
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B'
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M'
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K'
  return num.toLocaleString('en-US', { maximumFractionDigits: 2 })
}

const signedPrice = (value) => {
  const num = Number(value || 0)
  const text = formatPrice(Math.abs(num))
  return `${num >= 0 ? '+' : '-'}$${text}`
}

onMounted(async () => {
  await fetchAllTickers()
  refreshTimer = setInterval(fetchAllTickers, 5000)
})

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer)
})
</script>
