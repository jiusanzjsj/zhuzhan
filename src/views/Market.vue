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

    <!-- 热门币种横向滚动 -->
    <div class="ticker-bar">
      <div class="ticker-scroll">
        <div 
          v-for="coin in coinList" 
          :key="coin.symbol" 
          class="ticker-item"
          @click="goToChart(coin.symbol)"
        >
          <span class="ticker-symbol">{{ coin.symbol }}</span>
          <span class="ticker-price">${{ formatPrice(coin.price) }}</span>
          <span class="ticker-change" :class="coin.change >= 0 ? 'up' : 'down'">
            {{ coin.change >= 0 ? '+' : '' }}{{ coin.change.toFixed(2) }}%
          </span>
        </div>
      </div>
    </div>

    <!-- 主内容 -->
    <main class="main">
      <!-- 行情表格 -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">📊 行情榜单</h2>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>币种</th>
              <th>价格</th>
              <th>24h涨跌</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="(coin, index) in coinList" 
              :key="coin.symbol"
              @click="goToChart(coin.symbol)"
            >
              <td>{{ index + 1 }}</td>
              <td class="coin-cell">
                <img :src="coin.icon" class="coin-icon">
                <div>
                  <div class="coin-symbol">{{ coin.symbol }}</div>
                  <div class="coin-name">{{ coin.name }}</div>
                </div>
              </td>
              <td class="price-cell">${{ formatPrice(coin.price) }}</td>
              <td>
                <span class="change-tag" :class="coin.change >= 0 ? 'up' : 'down'">
                  {{ coin.change >= 0 ? '+' : '' }}{{ coin.change.toFixed(2) }}%
                </span>
              </td>
              <td>
                <button class="trade-btn">交易</button>
              </td>
            </tr>
          </tbody>
        </table>
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
  --primary: #F97316;
  --bg: #F8FAFC;
  --white: #FFFFFF;
  --text: #1E293B;
  --text-secondary: #64748B;
  --border: #E2E8F0;
  --green: #22C55E;
  --red: #EF4444;
  --shadow: 0 1px 3px rgba(0,0,0,0.1);
}

body {
  font-family: 'Inter', -apple-system, sans-serif;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
}

.app { min-height: 100vh; }

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: var(--white);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left { display: flex; align-items: center; gap: 12px; }
.logo { width: 36px; height: 36px; border-radius: 8px; object-fit: cover; }
.brand { font-size: 20px; font-weight: 700; color: var(--primary); }
.time { font-size: 14px; color: var(--text-secondary); }

/* Ticker Bar */
.ticker-bar {
  background: var(--white);
  border-bottom: 1px solid var(--border);
  padding: 12px 0;
  overflow-x: auto;
}

.ticker-scroll {
  display: flex;
  gap: 24px;
  padding: 0 24px;
  min-width: max-content;
}

.ticker-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: background 0.2s;
}

.ticker-item:hover { background: var(--bg); }

.ticker-symbol { font-weight: 600; }
.ticker-price { font-weight: 600; font-family: monospace; }
.ticker-change { font-size: 12px; font-weight: 500; padding: 2px 6px; border-radius: 4px; }
.ticker-change.up { color: var(--green); background: rgba(34,197,94,0.1); }
.ticker-change.down { color: var(--red); background: rgba(239,68,68,0.1); }

/* Main */
.main { padding: 24px; max-width: 1200px; margin: 0 auto; }

/* Card */
.card {
  background: var(--white);
  border-radius: 12px;
  box-shadow: var(--shadow);
  overflow: hidden;
}

.card-header { padding: 16px 20px; border-bottom: 1px solid var(--border); }
.card-title { font-size: 16px; font-weight: 600; }

/* Table */
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; color: var(--text-secondary); background: var(--bg); }
.data-table td { padding: 14px 16px; border-bottom: 1px solid var(--border); }
.data-table tr { cursor: pointer; transition: background 0.2s; }
.data-table tr:hover { background: var(--bg); }

.coin-cell { display: flex; align-items: center; gap: 10px; }
.coin-icon { width: 28px; height: 28px; border-radius: 50%; }
.coin-symbol { font-weight: 600; }
.coin-name { font-size: 12px; color: var(--text-secondary); }
.price-cell { font-weight: 600; font-family: monospace; }

.change-tag { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 13px; font-weight: 500; }
.change-tag.up { color: var(--green); background: rgba(34,197,94,0.1); }
.change-tag.down { color: var(--red); background: rgba(239,68,68,0.1); }

.trade-btn {
  padding: 6px 14px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
}

/* Footer */
.footer {
  display: flex;
  justify-content: center;
  gap: 32px;
  padding: 20px;
  font-size: 12px;
  color: var(--text-secondary);
  border-top: 1px solid var(--border);
}

/* Responsive */
@media (max-width: 768px) {
  .main { padding: 16px; }
  .ticker-scroll { padding: 0 16px; }
}
</style>
