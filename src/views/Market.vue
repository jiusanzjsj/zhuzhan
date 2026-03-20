<template>
  <div class="app">
    <!-- Header -->
    <header class="header">
      <div class="header-left">
        <img src="/src/assets/logo.jpg" class="brand-icon" />
        <span class="brand">三叔.BTC</span>
      </div>
      <nav class="nav">
        <a href="/" class="nav-item active">行情</a>
        <a href="#kline" class="nav-item">K线</a>
        <a href="#news" class="nav-item">快讯</a>
      </nav>
      <div class="header-right">
        <span class="time">{{ currentTime }}</span>
      </div>
    </header>

    <!-- Ticker Bar -->
    <div class="ticker-bar">
      <div class="ticker-wrap">
        <a v-for="coin in [...coinList,...coinList]" :key="coin.symbol+'-dup'" class="ticker-item" @click.prevent="goToChart(coin.symbol)">
          <span class="ticker-symbol">{{ coin.symbol }}</span>
          <span class="ticker-price">${{ formatPrice(coin.price) }}</span>
          <span class="ticker-change" :class="coin.change>=0?'up':'down'">
            {{ coin.change>=0?'+':'' }}{{ coin.change?.toFixed(2) || '0.00' }}%
          </span>
        </a>
      </div>
    </div>

    <!-- Main Content -->
    <main class="main">
      <!-- Left Sidebar - Categories -->
      <aside class="sidebar">
        <h3 class="sidebar-title">📊 概念分类</h3>
        <div class="category-list">
          <a v-for="(cat,i) in categories" :key="i" class="category-item" :class="{active:activeCategory===i}" @click.prevent="activeCategory=i">
            <span class="cat-name">{{ cat.name }}</span>
            <span class="cat-change" :class="cat.change>=0?'up':'down'">{{ cat.change>=0?'+':'' }}{{ cat.change }}%</span>
          </a>
        </div>
      </aside>

      <!-- Right - Data Table -->
      <div class="content">
        <div class="table-header">
          <span class="th th-rank">#</span>
          <span class="th th-coin">币种</span>
          <span class="th th-price">价格</span>
          <span class="th th-change">24H</span>
          <span class="th th-market">市值</span>
          <span class="th th-volume">成交量(24h)</span>
          <span class="th th-supply">流通量</span>
        </div>
        
        <div class="table-body">
          <a v-for="(coin,i) in sortedList" :key="coin.symbol" class="table-row" @click.prevent="goToChart(coin.symbol)">
            <span class="td td-rank">{{ i+1 }}</span>
            <span class="td td-coin">
              <img :src="'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/' + coin.symbol.toLowerCase() + '.png'" class="coin-icon" :alt="coin.symbol" @error="onImageError($event, coin.symbol)">
              <div class="coin-info">
                <span class="coin-symbol">{{ coin.symbol }}</span>
                <span class="coin-name">{{ coin.name }}</span>
              </div>
            </span>
            <span class="td td-price">${{ formatPrice(coin.price) }}</span>
            <span class="td td-change" :class="coin.change>=0?'up':'down'">
              {{ coin.change>=0?'+':'' }}{{ coin.change?.toFixed(2) || '0.00' }}%
            </span>
            <span class="td td-market">${{ formatMarket(coin.market) }}</span>
            <span class="td td-volume">${{ formatVolume(coin.volume) }}</span>
            <span class="td td-supply">{{ formatSupply(coin.supply) }}</span>
          </a>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="footer">
      <span>📊 数据来源：Binance</span>
      <span>⏰ 实时更新</span>
      <span>© 2026 三叔.BTC</span>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const currentTime = ref('')
const activeCategory = ref(0)
let timeTimer = null, ws = null

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
  { symbol: 'BTC', name: 'Bitcoin', market: 1400000000000, volume: 350000000000, supply: 19990000, color: '#F7931A', pair: 'btcusdt', image: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png' },
  { symbol: 'ETH', name: 'Ethereum', market: 260000000000, volume: 150000000000, supply: 120000000, color: '#627EEA', pair: 'ethusdt', image: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png' },
  { symbol: 'USDT', name: 'Tether', market: 1838000000000, volume: 600000000000, supply: 183800000000, color: '#26A17B', pair: 'usdtusdt', image: 'https://assets.coingecko.com/coins/images/325/small/Tether.png' },
  { symbol: 'XRP', name: 'Ripple', market: 88000000000, volume: 25000000000, supply: 99000000000, color: '#23292F', pair: 'xrpusdt', image: 'https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png' },
  { symbol: 'BNB', name: 'BNB', market: 87000000000, volume: 15000000000, supply: 153000000, color: '#F3BA2F', pair: 'bnbusdt', image: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png' },
  { symbol: 'USDC', name: 'USD Coin', market: 77000000000, volume: 50000000000, supply: 77000000000, color: '#2775CA', pair: 'usdcusdt', image: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png' },
  { symbol: 'SOL', name: 'Solana', market: 50000000000, volume: 25000000000, supply: 46000000, color: '#9945FF', pair: 'solusdt', image: 'https://assets.coingecko.com/coins/images/4128/small/solana.png' },
  { symbol: 'TRX', name: 'TRON', market: 28000000000, volume: 5000000000, supply: 87000000000, color: '#FF0013', pair: 'trxusdt', image: 'https://assets.coingecko.com/coins/images/1094/small/tron-logo.png' },
  { symbol: 'DOGE', name: 'Dogecoin', market: 14000000000, volume: 8000000000, supply: 140000000000, color: '#C2A633', pair: 'dogeusdt', image: 'https://assets.coingecko.com/coins/images/5/small/dogecoin.png' },
  { symbol: 'ADA', name: 'Cardano', market: 12000000000, volume: 3500000000, supply: 35000000000, color: '#0033AD', pair: 'adausdt', image: 'https://assets.coingecko.com/coins/images/975/small/cardano.png' },
  { symbol: 'AVAX', name: 'Avalanche', market: 11000000000, volume: 3500000000, supply: 41000000, color: '#E84142', pair: 'avaxusdt', image: 'https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png' },
  { symbol: 'DOT', name: 'Polkadot', market: 10000000000, volume: 2500000000, supply: 1500000000, color: '#E6007A', pair: 'dotusdt', image: 'https://assets.coingecko.com/coins/images/12171/small/polkadot.png' },
  { symbol: 'LINK', name: 'Chainlink', market: 9000000000, volume: 2500000000, supply: 600000000, color: '#2A5ADA', pair: 'linkusdt', image: 'https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png' },
  { symbol: 'MATIC', name: 'Polygon', market: 8000000000, volume: 2000000000, supply: 9800000000, color: '#8247E5', pair: 'maticusdt', image: 'https://assets.coingecko.com/coins/images/4713/small/polygon.png' },
  { symbol: 'LTC', name: 'Litecoin', market: 7000000000, volume: 3000000000, supply: 76000000, color: '#BFBBBB', pair: 'ltcusdt', image: 'https://assets.coingecko.com/coins/images/2/small/litecoin.png' },
  { symbol: 'SHIB', name: 'Shiba Inu', market: 6000000000, volume: 1500000000, supply: 589000000000000, color: '#FFA409', pair: 'shibusdt', image: 'https://assets.coingecko.com/coins/images/11939/small/shiba.png' },
  { symbol: 'DAI', name: 'Dai', market: 5000000000, volume: 1000000000, supply: 5000000000, color: '#F5AC3E', pair: 'daiusdt', image: 'https://assets.coingecko.com/coins/images/9936/small/494.png' },
  { symbol: 'UNI', name: 'Uniswap', market: 4500000000, volume: 1500000000, supply: 550000000, color: '#FF007A', pair: 'uniusdt', image: 'https://assets.coingecko.com/coins/images/12504/small/uniswap-uni.png' },
  { symbol: 'ATOM', name: 'Cosmos', market: 3500000000, volume: 1200000000, supply: 400000000, color: '#2E3148', pair: 'atomusdt', image: 'https://assets.coingecko.com/coins/images/1481/small/cosmos_hub.png' },
  { symbol: 'NEAR', name: 'NEAR Protocol', market: 3000000000, volume: 1000000000, supply: 110000000, color: '#00C08B', pair: 'nearusdt', image: 'https://assets.coingecko.com/coins/images/10365/small/near.jpg' },
]

const coinList = ref(coinConfig.map(c => ({ ...c, price: 0, change: 0 })))

const onImageError = (e, symbol) => {
  e.target.style.display = 'none'
  const parent = e.target.parentNode
  const fallback = document.createElement('div')
  fallback.className = 'coin-icon'
  fallback.style.backgroundColor = '#F97316'
  fallback.textContent = symbol?.charAt(0) || '?'
  parent.appendChild(fallback)
}

const sortedList = computed(() => {
  let list = [...coinList.value]
  if (activeCategory.value === 0) return list
  return list
})

const formatPrice = (p) => p ? p.toFixed(2) : '0.00'
const formatMarket = (v) => v >= 1e12 ? (v / 1e12).toFixed(1) + '万亿' : v >= 1e8 ? (v / 1e8).toFixed(1) + '亿' : v
const formatVolume = (v) => v >= 1e12 ? (v / 1e12).toFixed(1) + '万亿' : v >= 1e8 ? (v / 1e8).toFixed(1) + '亿' : v
const formatSupply = (s) => s >= 1e9 ? (s / 1e9).toFixed(1) + '亿' : s >= 1e6 ? (s / 1e6).toFixed(1) + '万' : s

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
    for (const c of coinConfig) {
      const r = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${c.pair.toUpperCase()}`)
      const d = await r.json()
      const x = coinList.value.find(y => y.symbol === c.symbol)
      if (x && d.priceChangePercent) x.change = parseFloat(d.priceChangePercent)
    }
  } catch {}
}

onMounted(() => {
  currentTime.value = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
  timeTimer = setInterval(() => {
    currentTime.value = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
  }, 1000)
  connectWS()
  fetchChange()
})

onUnmounted(() => { ws?.close(); clearInterval(timeTimer) })
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap');
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Noto Sans SC', sans-serif; background: #f5f5f5; color: #333; font-size: 14px; }
a { text-decoration: none; color: inherit; }
.app { min-height: 100vh; display: flex; flex-direction: column; }

/* Header */
.header { background: #fff; border-bottom: 1px solid #e5e5e5; padding: 0 20px; display: flex; align-items: center; height: 50px; }
.header-left { display: flex; align-items: center; }
.brand-icon { width: 28px; height: 28px; margin-right: 8px; border-radius: 50%; }
.brand { font-size: 18px; font-weight: 700; color: #F97316; display: flex; align-items: center; }
.nav { display: flex; margin-left: 40px; gap: 5px; }
.nav-item { padding: 15px 12px; font-size: 14px; color: #666; transition: color 0.2s; }
.nav-item:hover, .nav-item.active { color: #F97316; border-bottom: 2px solid #F97316; }
.header-right { margin-left: auto; font-size: 12px; color: #999; }

/* Ticker Bar */
.ticker-bar { background: #fff; border-bottom: 1px solid #e5e5e5; padding: 8px 0; overflow: hidden; }
.ticker-wrap { display: flex; gap: 15px; padding: 0 20px; min-width: max-content; animation: tickerScroll 30s linear infinite; }
.ticker-wrap:hover { animation-play-state: paused; }
@keyframes tickerScroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
.ticker-item { display: flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 4px; white-space: nowrap; cursor: pointer; flex-shrink: 0; }
.ticker-symbol { font-weight: 600; font-size: 13px; }
.ticker-price { font-weight: 500; font-size: 13px; font-family: Arial; }
.ticker-change { font-size: 12px; padding: 1px 5px; border-radius: 3px; }
.ticker-change.up { color: #22c55e; background: #dcfce7; }
.ticker-change.down { color: #ef4444; background: #fee2e2; }

/* Main */
.main { flex: 1; max-width: 1200px; margin: 0 auto; padding: 15px; display: flex; gap: 15px; width: 100%; justify-content: center; }
.content { flex: 1; max-width: 900px; }

/* Sidebar */
.sidebar { width: 200px; flex-shrink: 0; background: #fff; border: 1px solid #e5e5e5; border-radius: 8px; padding: 15px; height: fit-content; }
.sidebar-title { font-size: 14px; font-weight: 600; padding-bottom: 10px; border-bottom: 1px solid #eee; margin-bottom: 10px; }
.category-list { display: flex; flex-direction: column; gap: 4px; }
.category-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; border-radius: 6px; font-size: 13px; cursor: pointer; transition: all 0.2s; }
.category-item:hover, .category-item.active { background: #F97316; color: #fff; }
.cat-name { font-weight: 500; }
.cat-change { font-size: 11px; }
.cat-change.up { color: #22c55e; }
.cat-change.down { color: #ef4444; }
.category-item.active .cat-change.up, .category-item.active .cat-change.down { color: #fff; }

/* Content */
.content { flex: 1; min-width: 0; background: #fff; border: 1px solid #e5e5e5; border-radius: 8px; overflow: hidden; }

/* Table Header */
.table-header { display: flex; align-items: center; padding: 12px 15px; background: #fafafa; border-bottom: 1px solid #eee; font-size: 12px; color: #999; font-weight: 500; }
.th { text-align: right; }
.th-rank { width: 40px; text-align: center; }
.th-coin { flex: 1; text-align: left; min-width: 120px; }
.th-price { width: 100px; }
.th-change { width: 80px; }
.th-market { width: 100px; }
.th-volume { width: 100px; }
.th-supply { width: 100px; }

/* Table Body */
.table-body { max-height: 70vh; overflow-y: auto; }
.table-row { display: flex; align-items: center; padding: 12px 15px; border-bottom: 1px solid #f5f5f5; cursor: pointer; transition: background 0.2s; }
.table-row:hover { background: #fafafa; }
.td { text-align: right; font-size: 13px; }
.td-rank { width: 40px; text-align: center; color: #999; }
.td-coin { flex: 1; display: flex; align-items: center; gap: 10px; min-width: 120px; text-align: left; }
.coin-icon { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 12px; }
.coin-icon-img { width: 28px; height: 28px; border-radius: 50%; object-fit: cover; }
.coin-info { display: flex; flex-direction: column; }
.coin-symbol { font-weight: 600; font-size: 14px; }
.coin-name { font-size: 11px; color: #999; }
.td-price { width: 100px; font-weight: 600; font-family: Arial; }
.td-change { width: 80px; font-weight: 500; }
.td-change.up { color: #22c55e; }
.td-change.down { color: #ef4444; }
.td-market { width: 100px; color: #666; }
.td-volume { width: 100px; color: #666; }
.td-supply { width: 100px; color: #666; }

/* Footer */
.footer { background: #fff; border-top: 1px solid #e5e5e5; padding: 15px 20px; text-align: center; font-size: 12px; color: #999; }
.footer span { margin: 0 10px; }

/* Responsive */
@media (max-width: 900px) {
  .main { flex-direction: column; }
  .sidebar { width: 100%; }
  .table-header, .table-row { flex-wrap: wrap; }
  .th-market, .th-volume, .th-supply, .td-market, .td-volume, .td-supply { display: none; }
}
</style>
