<template>
  <div class="app">
    <!-- 顶部导航 -->
    <header class="header">
      <div class="header-left">
        <img src="/images/logo.jpg" class="logo">
        <span class="brand">三叔.BTC</span>
      </div>
      <div class="header-right">
        <span class="time">{{ currentTime }}</span>
      </div>
    </header>

    <!-- 主内容 -->
    <main class="main">
      <div class="coin-grid">
        <div 
          v-for="coin in coinList" 
          :key="coin.symbol" 
          class="coin-card"
          @click="goToChart(coin.symbol)"
        >
          <div class="card-header">
            <img :src="coin.icon" class="coin-icon">
            <div class="coin-info">
              <span class="coin-symbol">{{ coin.symbol }}</span>
              <span class="coin-name">{{ coin.name }}</span>
            </div>
          </div>
          <div class="card-body">
            <span class="price">${{ formatPrice(coin.price) }}</span>
            <span class="change" :class="coin.change >= 0 ? 'up' : 'down'">
              {{ coin.change >= 0 ? '▲' : '▼' }}
              {{ coin.change >= 0 ? '+' : '' }}{{ coin.change.toFixed(2) }}%
            </span>
          </div>
          <div class="card-bg"></div>
        </div>
      </div>
    </main>

    <!-- 底部 -->
    <footer class="footer">
      <span>📊 数据：Binance API</span>
      <span>⏰ 实时更新</span>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const currentTime = ref('')
let timeTimer = null
let ws = null

const coinConfig = [
  { symbol: 'BTC', name: 'Bitcoin', icon: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png', pair: 'btcusdt' },
  { symbol: 'ETH', name: 'Ethereum', icon: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png', pair: 'ethusdt' },
  { symbol: 'BNB', name: 'BNB', icon: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png', pair: 'bnbusdt' },
  { symbol: 'SOL', name: 'Solana', icon: 'https://assets.coingecko.com/coins/images/4128/small/solana.png', pair: 'solusdt' },
  { symbol: 'XRP', name: 'XRP', icon: 'https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png', pair: 'xrpusdt' },
  { symbol: 'ADA', name: 'Cardano', icon: 'https://assets.coingecko.com/coins/images/975/small/cardano.png', pair: 'adausdt' },
  { symbol: 'DOGE', name: 'Dogecoin', icon: 'https://assets.coingecko.com/coins/images/5/small/dogecoin.png', pair: 'dogeusdt' },
  { symbol: 'DOT', name: 'Polkadot', icon: 'https://assets.coingecko.com/coins/images/12171/small/polkadot.png', pair: 'dotusdt' },
  { symbol: 'AVAX', name: 'Avalanche', icon: 'https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png', pair: 'avaxusdt' },
  { symbol: 'LINK', name: 'Chainlink', icon: 'https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png', pair: 'linkusdt' },
  { symbol: 'MATIC', name: 'Polygon', icon: 'https://assets.coingecko.com/coins/images/4713/small/polygon.png', pair: 'maticusdt' },
  { symbol: 'LTC', name: 'Litecoin', icon: 'https://assets.coingecko.com/coins/images/2/small/litecoin.png', pair: 'ltcusdt' },
]

const coinList = ref(coinConfig.map(c => ({ ...c, price: 0, change: 0 })))

const formatPrice = (p) => {
  if (!p || isNaN(p)) return '0.00'
  if (p >= 1000) return p.toLocaleString()
  if (p >= 1) return p.toFixed(2)
  return p.toFixed(4)
}

const goToChart = (symbol) => {
  window.location.href = `/chart/${symbol}`
}

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
}

// Binance WebSocket
const connectWebSocket = () => {
  const streams = coinConfig.map(c => `${c.pair}@miniTicker`).join('/')
  ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`)
  
  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data)
      const data = msg.data
      if (!data) return
      const symbol = data.s.replace('USDT', '')
      const price = parseFloat(data.c)
      const coin = coinList.value.find(c => c.symbol === symbol)
      if (coin && price > 0) {
        coin.price = price
      }
    } catch (e) {}
  }
  ws.onclose = () => setTimeout(connectWebSocket, 3000)
}

const fetchChange = async () => {
  try {
    for (const coin of coinConfig) {
      const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${coin.pair.toUpperCase()}`)
      const data = await res.json()
      const c = coinList.value.find(x => x.symbol === coin.symbol)
      if (c && data.priceChangePercent) {
        c.change = parseFloat(data.priceChangePercent)
      }
    }
  } catch (e) {}
}

onMounted(() => {
  updateTime()
  timeTimer = setInterval(updateTime, 1000)
  connectWebSocket()
  fetchChange()
})

onUnmounted(() => {
  if (ws) ws.close()
  if (timeTimer) clearInterval(timeTimer)
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

* { margin: 0; padding: 0; box-sizing: border-box; }

:root {
  --bg-dark: #0a0a0f;
  --bg-card: #14141f;
  --bg-card-hover: #1a1a28;
  --accent: #00ff88;
  --accent-glow: rgba(0, 255, 136, 0.15);
  --text-primary: #ffffff;
  --text-secondary: #8888aa;
  --red: #ff4444;
  --green: #00ff88;
}

body {
  font-family: 'Inter', -apple-system, sans-serif;
  background: var(--bg-dark);
  color: var(--text-primary);
  min-height: 100vh;
  background-image: 
    radial-gradient(ellipse at top, rgba(0, 255, 136, 0.05) 0%, transparent 50%),
    radial-gradient(ellipse at bottom right, rgba(100, 100, 255, 0.03) 0%, transparent 50%);
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: rgba(20, 20, 31, 0.8);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  object-fit: cover;
}

.brand {
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(135deg, #fff 0%, #00ff88 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.time {
  font-size: 14px;
  color: var(--text-secondary);
  font-family: 'JetBrains Mono', monospace;
}

/* Main */
.main {
  flex: 1;
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

/* Coin Grid */
.coin-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.coin-card {
  background: var(--bg-card);
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
}

.coin-card:hover {
  background: var(--bg-card-hover);
  transform: translateY(-4px);
  border-color: rgba(0, 255, 136, 0.3);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 0 40px var(--accent-glow);
}

.card-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, transparent 0%, var(--accent-glow) 100%);
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
}

.coin-card:hover .card-bg {
  opacity: 1;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.coin-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.coin-info {
  display: flex;
  flex-direction: column;
}

.coin-symbol {
  font-size: 16px;
  font-weight: 600;
}

.coin-name {
  font-size: 12px;
  color: var(--text-secondary);
}

.card-body {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.price {
  font-size: 24px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
}

.change {
  font-size: 14px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 8px;
}

.change.up {
  color: var(--green);
  background: rgba(0, 255, 136, 0.1);
}

.change.down {
  color: var(--red);
  background: rgba(255, 68, 68, 0.1);
}

/* Footer */
.footer {
  display: flex;
  justify-content: center;
  gap: 32px;
  padding: 20px;
  color: var(--text-secondary);
  font-size: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

/* Responsive */
@media (max-width: 600px) {
  .coin-grid {
    grid-template-columns: 1fr;
  }
  
  .header {
    padding: 16px;
  }
  
  .main {
    padding: 16px;
  }
}
</style>
