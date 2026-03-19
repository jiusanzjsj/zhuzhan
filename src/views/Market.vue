<template>
  <div class="app-container">
    <header class="header">
      <div class="logo-area">
        <img src="/images/logo.jpg" class="logo-img">
        <span class="site-name">三叔.BTC</span>
      </div>
      <div class="time-display">{{ currentTime }}</div>
    </header>

    <div class="coin-list">
      <div class="coin-card" v-for="coin in coinList" :key="coin.symbol" @click="goToChart(coin.symbol)">
        <div class="coin-left">
          <img :src="coin.icon" class="coin-icon">
          <span class="coin-symbol">{{ coin.symbol }}</span>
        </div>
        <div class="coin-right">
          <span class="coin-price">${{ formatPrice(coin.price) }}</span>
          <span class="coin-change" :class="coin.change >= 0 ? 'up' : 'down'">
            {{ coin.change >= 0 ? '+' : '' }}{{ coin.change.toFixed(2) }}%
          </span>
        </div>
      </div>
    </div>
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

// Binance WebSocket 实时推送
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

// 获取24h涨跌
const fetch24hChange = async () => {
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
  fetch24hChange()
})

onUnmounted(() => {
  if (ws) ws.close()
  if (timeTimer) clearInterval(timeTimer)
})
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #f5f5f5; min-height: 100vh; }
.app-container { max-width: 600px; margin: 0 auto; padding: 20px; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.logo-area { display: flex; align-items: center; gap: 10px; }
.logo-img { width: 40px; height: 40px; border-radius: 8px; }
.site-name { font-size: 20px; font-weight: bold; color: #333; }
.time-display { font-size: 14px; color: #666; }
.coin-list { display: flex; flex-direction: column; gap: 12px; }
.coin-card { display: flex; justify-content: space-between; align-items: center; background: white; border-radius: 12px; padding: 16px; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.coin-left { display: flex; align-items: center; gap: 12px; }
.coin-icon { width: 32px; height: 32px; border-radius: 50%; }
.coin-symbol { font-weight: 600; font-size: 16px; color: #333; }
.coin-right { display: flex; flex-direction: column; align-items: flex-end; }
.coin-price { font-weight: bold; font-size: 16px; color: #333; }
.coin-change { font-size: 14px; font-weight: 500; }
.coin-change.up { color: #22c55e; }
.coin-change.down { color: #ef4444; }
</style>
