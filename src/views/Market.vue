<template>
  <div class="market-page">
    <!-- Ticker Bar -->
    <div class="bg-white border-b border-gray-100 shadow-sm">
      <div class="max-w-7xl mx-auto">
        <div class="flex gap-3 px-4 py-2.5 min-w-max">
          <a v-for="coin in [...coinList,...coinList]" :key="coin.symbol+'-dup'" @click.prevent="goToChart(coin.symbol)" class="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer whitespace-nowrap transition-all hover:scale-105">
            <span class="font-bold text-gray-800 text-sm">{{ coin.symbol }}</span>
            <span class="font-mono font-medium text-gray-700">${{ formatPrice(coin.price) }}</span>
            <span class="text-xs font-medium px-1.5 py-0.5 rounded" :class="coin.change>=0 ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'">
              {{ coin.change>=0?'+':''}}{{ coin.change?.toFixed(2) || '0.00' }}%
            </span>
          </a>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 py-5 flex gap-5">
      <!-- Left Sidebar -->
      <aside class="w-56 flex-shrink-0">
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div class="px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white">
            <h3 class="font-semibold text-sm">📊 概念分类</h3>
          </div>
          <div class="p-2">
            <a v-for="(cat,i) in categories" :key="i" @click.prevent="activeCategory=i" class="flex justify-between items-center px-3 py-2.5 rounded-xl cursor-pointer transition-all" :class="activeCategory===i ? 'bg-gradient-to-r from-orange-50 to-amber-50 text-orange-600' : 'hover:bg-gray-50'">
              <span class="font-medium text-sm">{{ cat.name }}</span>
              <span class="text-xs font-medium px-2 py-0.5 rounded-full" :class="cat.change>=0 ? (activeCategory===i ? 'bg-orange-100 text-orange-600' : 'bg-green-50 text-green-500') : (activeCategory===i ? 'bg-orange-100 text-orange-600' : 'bg-red-50 text-red-500')">
                {{ cat.change>=0?'+':''}}{{ cat.change }}%
              </span>
            </a>
          </div>
        </div>
      </aside>

      <!-- Right - Data Table -->
      <div class="flex-1 min-w-0 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <!-- Table Header -->
        <div class="flex items-center px-5 py-3.5 bg-gray-50/50 border-b border-gray-100 text-xs text-gray-500 font-medium">
          <span class="w-10 text-center">#</span>
          <span class="flex-1 min-w-[140px] text-left">币种</span>
          <span class="w-28 text-right">价格</span>
          <span class="w-24 text-right">24H</span>
          <span class="w-28 text-right">市值</span>
          <span class="w-28 text-right">成交量</span>
          <span class="w-28 text-right">流通量</span>
        </div>
        
        <!-- Table Body -->
        <div class="max-h-[70vh] overflow-y-auto">
          <a v-for="(coin,i) in sortedList" :key="coin.symbol" @click.prevent="goToChart(coin.symbol)" class="flex items-center px-5 py-3.5 border-b border-gray-50/50 hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-amber-50/30 cursor-pointer transition-all group">
            <span class="w-10 text-center text-gray-400 font-medium">{{ i+1 }}</span>
            <span class="flex-1 min-w-[140px] flex items-center gap-3">
              <div class="relative">
                <img :src="'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/' + coin.symbol.toLowerCase() + '.png'" class="w-9 h-9 rounded-full ring-2 ring-gray-100 group-hover:ring-orange-200 transition" @error="onImageError($event)" alt="">
                <div v-if="coin.change >= 0" class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                <div v-else class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
              </div>
              <div class="flex flex-col">
                <span class="font-bold text-gray-800">{{ coin.symbol }}</span>
                <span class="text-xs text-gray-400">{{ coin.name }}</span>
              </div>
            </span>
            <span class="w-28 text-right font-mono font-semibold text-gray-800">${{ formatPrice(coin.price) }}</span>
            <span class="w-24 text-right font-bold" :class="coin.change>=0 ? 'text-green-500' : 'text-red-500'">
              {{ coin.change>=0?'+':''}}{{ coin.change?.toFixed(2) || '0.00' }}%
            </span>
            <span class="w-28 text-right text-gray-500 font-medium">${{ formatMarket(coin.market) }}</span>
            <span class="w-28 text-right text-gray-500">${{ formatVolume(coin.volume) }}</span>
            <span class="w-28 text-right text-gray-400 text-sm">{{ formatSupply(coin.supply) }}</span>
          </a>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const activeCategory = ref(0)
let ws = null

const categories = [
  { name: '全部币种', change: -2.1 },
  { name: '稳定币', change: -0.75 },
  { name: '交易所平台币', change: -1.15 },
  { name: 'Defi币', change: -2.72 },
  { name: 'RWA概念币', change: -0.50 },
  { name: '迷因Memes', change: 2.93 },
  { name: 'AI人工智能', change: 0.94 },
]

const coinConfig = [
  { symbol: 'BTC', name: 'Bitcoin', market: 1400000000000, volume: 350000000000, supply: 19990000, color: '#F7931A', pair: 'btcusdt' },
  { symbol: 'ETH', name: 'Ethereum', market: 260000000000, volume: 150000000000, supply: 120000000, color: '#627EEA', pair: 'ethusdt' },
  { symbol: 'USDT', name: 'Tether', market: 1838000000000, volume: 600000000000, supply: 183800000000, color: '#26A17B', pair: 'usdtusdt' },
  { symbol: 'XRP', name: 'Ripple', market: 88000000000, volume: 25000000000, supply: 99000000000, color: '#23292F', pair: 'xrpusdt' },
  { symbol: 'BNB', name: 'BNB', market: 87000000000, volume: 15000000000, supply: 153000000, color: '#F3BA2F', pair: 'bnbusdt' },
  { symbol: 'USDC', name: 'USD Coin', market: 77000000000, volume: 50000000000, supply: 77000000000, color: '#2775CA', pair: 'usdcusdt' },
  { symbol: 'SOL', name: 'Solana', market: 50000000000, volume: 25000000000, supply: 46000000, color: '#9945FF', pair: 'solusdt' },
  { symbol: 'TRX', name: 'TRON', market: 28000000000, volume: 5000000000, supply: 87000000000, color: '#FF0013', pair: 'trxusdt' },
  { symbol: 'DOGE', name: 'Dogecoin', market: 14000000000, volume: 8000000000, supply: 140000000000, color: '#C2A633', pair: 'dogeusdt' },
  { symbol: 'ADA', name: 'Cardano', market: 12000000000, volume: 3500000000, supply: 35000000000, color: '#0033AD', pair: 'adausdt' },
  { symbol: 'AVAX', name: 'Avalanche', market: 11000000000, volume: 3500000000, supply: 41000000, color: '#E84142', pair: 'avaxusdt' },
  { symbol: 'DOT', name: 'Polkadot', market: 10000000000, volume: 2500000000, supply: 1500000000, color: '#E6007A', pair: 'dotusdt' },
  { symbol: 'LINK', name: 'Chainlink', market: 9000000000, volume: 2500000000, supply: 600000000, color: '#2A5ADA', pair: 'linkusdt' },
  { symbol: 'MATIC', name: 'Polygon', market: 8000000000, volume: 2000000000, supply: 9800000000, color: '#8247E5', pair: 'maticusdt' },
  { symbol: 'LTC', name: 'Litecoin', market: 7000000000, volume: 3000000000, supply: 76000000, color: '#BFBBBB', pair: 'ltcusdt' },
  { symbol: 'SHIB', name: 'Shiba Inu', market: 6000000000, volume: 1500000000, supply: 589000000000000, color: '#FFA409', pair: 'shibusdt' },
  { symbol: 'DAI', name: 'Dai', market: 5000000000, volume: 1000000000, supply: 5000000000, color: '#F5AC3E', pair: 'daiusdt' },
  { symbol: 'UNI', name: 'Uniswap', market: 4500000000, volume: 1500000000, supply: 550000000, color: '#FF007A', pair: 'uniusdt' },
  { symbol: 'ATOM', name: 'Cosmos', market: 3500000000, volume: 1200000000, supply: 400000000, color: '#2E3148', pair: 'atomusdt' },
  { symbol: 'NEAR', name: 'NEAR Protocol', market: 3000000000, volume: 1000000000, supply: 110000000, color: '#00C08B', pair: 'nearusdt' },
]

const coinList = ref(coinConfig.map(c => ({ ...c, price: 0, change: 0 })))

const sortedList = computed(() => {
  let list = [...coinList.value]
  if (activeCategory.value === 0) return list
  return list
})

const formatPrice = (p) => p ? p.toFixed(2) : '0.00'
const formatMarket = (v) => v >= 1e12 ? (v / 1e12).toFixed(1) + '万亿' : v >= 1e8 ? (v / 1e8).toFixed(1) + '亿' : v
const formatVolume = (v) => v >= 1e12 ? (v / 1e12).toFixed(1) + '万亿' : v >= 1e8 ? (v / 1e8).toFixed(1) + '亿' : v
const formatSupply = (s) => s >= 1e9 ? (s / 1e9).toFixed(1) + '亿' : s >= 1e6 ? (s / 1e6).toFixed(1) + '万' : s

const onImageError = (e) => {
  e.target.style.display = 'none'
}

const goToChart = (s) => window.location.href = `/chart/${s}`

const connectWS = () => {
  const streams = coinConfig.map(c => c.pair + '@miniTicker').join('/')
  ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`)
  ws.onmessage = (e) => {
    try {
      const d = JSON.parse(e.data).data
      if (!d) return
      const c = coinList.value.find(x => x.symbol === d.s.replace('USDT', ''))
      if (c && d.c) c.price = parseFloat(d.c)
    } catch {}
  }
  ws.onclose = () => setTimeout(connectWS, 3000)
}

const fetchChange = async () => {
  try {
    const promises = coinConfig.map(async (c) => {
      const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${c.pair.toUpperCase()}`)
      const d = await res.json()
      return { symbol: c.symbol, change: d.priceChangePercent ? parseFloat(d.priceChangePercent) : 0 }
    })
    const results = await Promise.all(promises)
    results.forEach(r => {
      const coin = coinList.value.find(c => c.symbol === r.symbol)
      if (coin) coin.change = r.change
    })
  } catch (e) {
    console.error('fetchChange error:', e)
  }
}

onMounted(() => {
  connectWS()
  fetchChange()
})

onUnmounted(() => { ws?.close() })
</script>
