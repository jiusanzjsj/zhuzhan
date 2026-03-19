<template>
  <div class="chart-container">
    <!-- 顶部导航 -->
    <header class="header">
      <div class="header-inner">
        <div class="left-section">
          <router-link to="/" class="back-button">
            ← 返回
          </router-link>
          <router-link to="/" class="logo-area">
            <img src="/images/logo.jpg" class="logo-img">
            <span class="site-name">三叔.BTC</span>
          </router-link>
        </div>
        
        <div class="coin-title">
          <img :src="coinInfo?.icon" class="coin-icon" @error="handleImgError">
          <span class="coin-symbol">{{ symbol }}</span>
          <span class="coin-name">{{ coinInfo?.name }}</span>
        </div>

        <div class="header-right">
          <span class="price-display">${{ formatPrice(currentPrice) }}</span>
          <span class="price-change" :class="priceChange >= 0 ? 'up' : 'down'">
            {{ priceChange >= 0 ? '+' : '' }}{{ priceChange.toFixed(2) }}%
          </span>
        </div>
      </div>
    </header>

    <!-- TradingView widget -->
    <div class="chart-main">
      <div class="chart-wrapper">
        <div class="tradingview-widget-container" ref="widgetContainer">
          <div id="tradingview_chart"></div>
        </div>
      </div>
    </div>

    <!-- 底部信息 -->
    <div class="chart-footer">
      <div class="footer-info">
        <span>📊 数据来源：TradingView</span>
        <span>⏰ 更新时间：{{ currentTime }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const symbol = ref(route.params.symbol || 'BTC')
const currentPrice = ref(0)
const priceChange = ref(0)
const currentTime = ref('')
const widgetContainer = ref(null)
let timeTimer = null
let widget = null

const coinConfig = {
  BTC: { name: '比特币', icon: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png', pair: 'btcusdt', tvSymbol: 'BINANCE:BTCUSDT' },
  ETH: { name: '以太坊', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', pair: 'ethusdt', tvSymbol: 'BINANCE:ETHUSDT' },
  BNB: { name: '币安币', icon: 'https://cryptologos.cc/logos/bnb-bnb-logo.png', pair: 'bnbusdt', tvSymbol: 'BINANCE:BNBUSDT' },
  SOL: { name: 'Solana', icon: 'https://cryptologos.cc/logos/solana-sol-logo.png', pair: 'solusdt', tvSymbol: 'BINANCE:SOLUSDT' },
  XRP: { name: '瑞波币', icon: 'https://cryptologos.cc/logos/xrp-xrp-logo.png', pair: 'xrpusdt', tvSymbol: 'BINANCE:XRPUSDT' },
  ADA: { name: '艾达币', icon: 'https://cryptologos.cc/logos/cardano-ada-logo.png', pair: 'adausdt', tvSymbol: 'BINANCE:ADAUSDT' },
  DOGE: { name: '狗狗币', icon: 'https://cryptologos.cc/logos/dogecoin-doge-logo.png', pair: 'dogeusdt', tvSymbol: 'BINANCE:DOGEUSDT' },
  DOT: { name: '波卡', icon: 'https://cryptologos.cc/logos/polkadot-new-dot-logo.png', pair: 'dotusdt', tvSymbol: 'BINANCE:DOTUSDT' },
  AVAX: { name: '雪崩', icon: 'https://cryptologos.cc/logos/avalanche-avax-logo.png', pair: 'avaxusdt', tvSymbol: 'BINANCE:AVAXUSDT' },
  LINK: { name: 'Chainlink', icon: 'https://cryptologos.cc/logos/chainlink-link-logo.png', pair: 'linkusdt', tvSymbol: 'BINANCE:LINKUSDT' },
  MATIC: { name: 'Polygon', icon: 'https://cryptologos.cc/logos/polygon-matic-logo.png', pair: 'maticusdt', tvSymbol: 'BINANCE:MATICUSDT' },
  LTC: { name: '莱特币', icon: 'https://cryptologos.cc/logos/litecoin-ltc-logo.png', pair: 'ltcusdt', tvSymbol: 'BINANCE:LTCUSDT' },
}

const coinInfo = ref(coinConfig[symbol.value] || coinConfig.BTC)

const formatPrice = (p) => {
  if (!p || isNaN(p)) return '0.00'
  if (p >= 1000) return p.toLocaleString()
  if (p >= 1) return p.toFixed(2)
  return p.toFixed(4)
}

const handleImgError = (e) => {
  e.target.src = 'https://via.placeholder.com/32/3b82f6/fff?text='
}

const initWidget = () => {
  if (!window.TradingView) {
    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/tv.js'
    script.onload = () => createWidget()
    document.head.appendChild(script)
  } else {
    createWidget()
  }
}

const createWidget = () => {
  if (!window.TradingView || !document.getElementById('tradingview_chart')) return
  
  const tvSymbol = coinInfo.value?.tvSymbol || 'BINANCE:BTCUSDT'
  
  widget = new window.TradingView.widget({
    width: '100%',
    height: 500,
    symbol: tvSymbol,
    interval: '60',
    timezone: 'Asia/Shanghai',
    theme: 'light',
    style: '1',
    locale: 'zh_CN',
    toolbar_bg: '#ffffff',
    enable_publishing: false,
    allow_symbol_change: true,
    container_id: 'tradingview_chart',
    hide_side_toolbar: false,
    studies: ['RSI@tv-basicstudies', 'MASimple@tv-basicstudies'],
    show_popup_button: true,
    popup_width: '1000',
    popup_height: '650',
  })
}

const fetch24hChange = async () => {
  try {
    const pair = coinInfo.value?.pair || 'btcusdt'
    const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${pair.toUpperCase()}`)
    const data = await res.json()
    priceChange.value = parseFloat(data.priceChangePercent) || 0
    currentPrice.value = parseFloat(data.lastPrice) || 0
  } catch (e) {}
}

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
}

onMounted(() => {
  initWidget()
  fetch24hChange()
  updateTime()
  timeTimer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timeTimer) clearInterval(timeTimer)
})

watch(() => route.params.symbol, (newSymbol) => {
  if (newSymbol) {
    symbol.value = newSymbol
    coinInfo.value = coinConfig[newSymbol] || coinConfig.BTC
    initWidget()
    fetch24hChange()
  }
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary: #f97316;
  --primary-light: #fb923c;
  --blue: #3b82f6;
  --success: #22c55e;
  --danger: #ef4444;
  --bg: #f8fafc;
  --card: #ffffff;
  --border: #e2e8f0;
  --text: #1e293b;
  --text-secondary: #64748b;
  --text-muted: #94a3b8;
}

body {
  font-family: 'DM Sans', -apple-system, sans-serif;
  background: var(--bg);
  color: var(--text);
}

.chart-container {
  min-height: 100vh;
  background: var(--bg);
}

/* 头部 */
.header {
  background: var(--card);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.left-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}

.logo-box {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-icon {
  font-size: 18px;
  font-weight: 700;
}

.site-name {
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
}

.coin-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.coin-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
}

.coin-symbol {
  font-size: 18px;
  font-weight: 700;
}

.coin-name {
  font-size: 14px;
  color: var(--text-secondary);
}

.back-button {
  color: var(--primary);
  text-decoration: none;
  font-weight: 500;
  padding: 8px 14px;
  background: rgba(247,147,26,0.1);
  border-radius: var(--radius-md);
  transition: all 0.2s;
}

.back-button:hover {
  background: rgba(247,147,26,0.2);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.price-display {
  font-family: 'JetBrains Mono', monospace;
  font-size: 20px;
  font-weight: 700;
}

.price-change {
  font-size: 14px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 6px;
}

.price-change.up {
  color: var(--success);
  background: rgba(34, 197, 94, 0.1);
}

.price-change.down {
  color: var(--danger);
  background: rgba(239, 68, 68, 0.1);
}

/* 图表区域 */
.chart-main {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.chart-wrapper {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
}

.tradingview-widget-container {
  width: 100%;
  height: 500px;
}

#tradingview_chart {
  width: 100%;
  height: 100%;
}

/* 底部 */
.chart-footer {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px 20px;
}

.footer-info {
  display: flex;
  justify-content: center;
  gap: 24px;
  font-size: 12px;
  color: var(--text-muted);
}
</style>
