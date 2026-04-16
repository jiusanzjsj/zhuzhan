<template>
  <div class="chart-page">
    <div class="max-w-[1200px] mx-auto px-[15px] pt-[15px]">
      <button class="back-home-chip" @click="goHome">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        返回首页
      </button>
    </div>
    <!-- Main -->
    <div class="main">
      <!-- Left Column -->
      <div class="col-left">
        <!-- Price Panel -->
        <div class="price-panel">
          <div class="price-row">
            <img :src="'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/' + symbol.toLowerCase() + '.png'" class="w-8 h-8 rounded-full" @error="onImgError($event)" alt="">
            <span class="ml-2 text-xl font-bold text-gray-800">{{ symbol }}</span>
            <span class="price-value">${{ formatPrice(price) }}</span>
            <span class="price-change" :class="change >= 0 ? 'up' : 'down'">
              {{ change >= 0 ? '+' : '' }}{{ change.toFixed(2) }}%
            </span>
          </div>
          <div class="price-stats">
            <div class="stat">
              <span class="label">24H最高</span>
              <span class="val">${{ formatPrice(high24h) }}</span>
            </div>
            <div class="stat">
              <span class="label">24H最低</span>
              <span class="val">${{ formatPrice(low24h) }}</span>
            </div>
            <div class="stat">
              <span class="label">24H成交量</span>
              <span class="val">{{ formatVol(volume24h) }}</span>
            </div>
            <div class="stat">
              <span class="label">24H成交额</span>
              <span class="val">${{ formatMarket(quoteVolume) }}</span>
            </div>
          </div>
        </div>

        <!-- Tab Bar -->
        <div class="tab-bar">
          <a href="javascript:;" class="tab active">K线</a>
          <a href="javascript:;" class="tab">趋势</a>
          <a href="javascript:;" class="tab">数据</a>
          <a href="javascript:;" class="tab">合约</a>
          <a href="javascript:;" class="tab">钱包</a>
          <div class="tab-spacer"></div>
          <span class="intervals">
            <a href="javascript:;" class="interval">1分</a>
            <a href="javascript:;" class="interval">5分</a>
            <a href="javascript:;" class="interval">15分</a>
            <a href="javascript:;" class="interval active">1时</a>
            <a href="javascript:;" class="interval">4时</a>
            <a href="javascript:;" class="interval">1天</a>
            <a href="javascript:;" class="interval">1周</a>
          </span>
        </div>

        <!-- Chart -->
        <div class="chart-box">
          <div id="tradingview_chart"></div>
          <a href="https://www.tradingview.com/chart/?symbol=BINANCE:BTCUSDT" target="_blank" class="draw-tool-btn">🎨 画图工具</a>
        </div>

        <!-- AI分析 -->
        <div class="ai-panel">
          <h3>🤖 AI行情分析</h3>
          <p>根据当前技术指标和趋势分析，预计短期内价格可能呈现震荡上行趋势，建议关注支撑位 ${{ formatPrice(price * 0.98) }} 和压力位 ${{ formatPrice(price * 1.02) }}。</p>
        </div>

        <!-- 交易平台 -->
        <div class="exchange-panel">
          <h3>🏦 交易平台</h3>
          <table class="exchange-table">
            <thead>
              <tr>
                <th>平台</th>
                <th>交易对</th>
                <th>价格</th>
                <th>24H成交量</th>
                <th>占比</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><img src="https://bin.bnbstatic.com/static/images/favicon.ico" class="w-5 h-5 inline-block mr-2 align-middle" onerror="this.style.display='none'">Binance</td>
                <td>BTC/USDT</td>
                <td>${{ formatPrice(price) }}</td>
                <td>{{ formatVol(volume24h * 0.35) }}</td>
                <td>35%</td>
              </tr>
              <tr>
                <td><img src="https://www.okx.com/favicon.ico" class="w-5 h-5 inline-block mr-2 align-middle" onerror="this.style.display='none'">OKX</td>
                <td>BTC/USDT</td>
                <td>${{ formatPrice(price * 1.001) }}</td>
                <td>{{ formatVol(volume24h * 0.2) }}</td>
                <td>20%</td>
              </tr>
              <tr>
                <td><img src="https://www.bybit.com/favicon.ico" class="w-5 h-5 inline-block mr-2 align-middle" onerror="this.style.display='none'">Bybit</td>
                <td>BTC/USDT</td>
                <td>${{ formatPrice(price * 0.999) }}</td>
                <td>{{ formatVol(volume24h * 0.15) }}</td>
                <td>15%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Right Column -->
      <div class="col-right">
        <div class="panel">
          <h3 class="panel-title">🔥 热门币种</h3>
          <div class="hot-list">
            <a v-for="coin in hotCoins" :key="coin.symbol" :href="'/chart/' + coin.symbol" class="hot-item">
              <img :src="'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/' + coin.symbol.toLowerCase() + '.png'" class="hot-icon" @error="onHotImgError($event)" alt="">
              <div class="hot-info">
                <span class="hot-symbol">{{ coin.symbol }}</span>
                <span class="hot-name">{{ coin.name }}</span>
              </div>
              <div class="hot-price">
                <span class="price">${{ formatPrice(coin.price) }}</span>
                <span class="change" :class="coin.change >= 0 ? 'up' : 'down'">{{ coin.change >= 0 ? '+' : '' }}{{ coin.change.toFixed(2) }}%</span>
              </div>
            </a>
          </div>
        </div>

        <div class="panel">
          <h3 class="panel-title">📈 热搜币种</h3>
          <div class="hot-list">
            <a v-for="coin in hotCoins" :key="'s-'+coin.symbol" :href="'/chart/' + coin.symbol" class="hot-item">
              <img :src="'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/' + coin.symbol.toLowerCase() + '.png'" class="hot-icon" @error="onHotImgError($event)" alt="">
              <div class="hot-info">
                <span class="hot-symbol">{{ coin.symbol }}</span>
                <span class="hot-name">{{ coin.name }}</span>
              </div>
              <div class="hot-price">
                <span class="price">${{ formatPrice(coin.price) }}</span>
                <span class="change" :class="coin.change >= 0 ? 'up' : 'down'">{{ coin.change >= 0 ? '+' : '' }}{{ coin.change.toFixed(2) }}%</span>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { updatePageSeo } from '../utils/seo'

const currentTime = ref('')
const price = ref(0), change = ref(0), high24h = ref(0), low24h = ref(0), volume24h = ref(0), quoteVolume = ref(0)
let timeTimer = null, ws = null
const router = useRouter()

const path = window.location.pathname
const match = path.match(/\/chart\/(\w+)/)
const symbol = match ? match[1] : 'BTC'
const pair = `${symbol.toLowerCase()}usdt`
const baseUrl = 'https://openupbtc.com'

const setChartSeo = () => {
  const upperSymbol = String(symbol || 'BTC').toUpperCase()
  updatePageSeo({
    title: `${upperSymbol}实时价格走势 - ${upperSymbol}行情K线图表 - 比特视界`,
    description: `查看${upperSymbol}实时价格、24小时涨跌幅、成交量和专业K线走势图，快速了解${upperSymbol}/USDT市场行情与技术分析。`,
    keywords: `${upperSymbol},${upperSymbol}价格,${upperSymbol}行情,${upperSymbol}实时价格,${upperSymbol}K线,加密货币行情`,
    image: `${baseUrl}/logo.png`,
    url: `${baseUrl}/chart/${upperSymbol}`,
    type: 'website'
  })
}

const hotCoins = ref([
  { symbol: 'BTC', name: 'Bitcoin', price: 0, change: 0, color: '#F7931A' },
  { symbol: 'ETH', name: 'Ethereum', price: 0, change: 0, color: '#627EEA' },
  { symbol: 'BNB', name: 'BNB', price: 0, change: 0, color: '#F3BA2F' },
  { symbol: 'SOL', name: 'Solana', price: 0, change: 0, color: '#9945FF' },
  { symbol: 'XRP', name: 'XRP', price: 0, change: 0, color: '#23292F' },
  { symbol: 'USDT', name: 'Tether', price: 0, change: 0, color: '#26A17B' },
  { symbol: 'ADA', name: 'Cardano', price: 0, change: 0, color: '#0033AD' },
  { symbol: 'DOGE', name: 'Dogecoin', price: 0, change: 0, color: '#C2A633' },
])

const formatPrice = (p) => p ? p.toFixed(2) : '0.00'

const onImgError = (e) => {
  e.target.style.display = 'none'
}

const onHotImgError = (e) => {
  e.target.style.display = 'none'
}
const goHome = () => router.push('/')
const formatVol = (v) => v >= 1e9 ? (v / 1e9).toFixed(1) + '亿' : v >= 1e6 ? (v / 1e6).toFixed(1) + '万' : v
const formatMarket = (v) => v >= 1e12 ? (v / 1e12).toFixed(1) + '万亿' : v >= 1e9 ? (v / 1e9).toFixed(1) + '亿' : v

// TradingView
const initChart = () => {
  if (window.TradingView) {
    new window.TradingView.widget({
      autosize: true,
      symbol: `BINANCE:${symbol}USDT`,
      interval: '60',
      timezone: 'Asia/Shanghai',
      theme: 'light',
      style: '1',
      locale: 'zh_CN',
      toolbar_bg: '#f1f3f6',
      enable_publishing: false,
      allow_symbol_change: true,
      container_id: 'tradingview_chart',
      hide_sidebar: true,
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
    })
  }
}

const loadTV = () => {
  if (window.TradingView) {
    initChart()
  } else {
    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/tv.js'
    script.onload = initChart
    document.head.appendChild(script)
  }
}

// WebSocket
const connectWS = () => {
  ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${pair}@ticker`)
  ws.onmessage = (e) => {
    try {
      const d = JSON.parse(e.data).data
      if (d) {
        price.value = parseFloat(d.c)
        change.value = parseFloat(d.P)
        high24h.value = parseFloat(d.h)
        low24h.value = parseFloat(d.l)
        volume24h.value = parseFloat(d.v)
        quoteVolume.value = parseFloat(d.q)
      }
    } catch {}
  }
  ws.onclose = () => setTimeout(connectWS, 3000)
}

const fetchHotCoins = async () => {
  const cfg = { BTC: 'btcusdt', ETH: 'ethusdt', BNB: 'bnbusdt', SOL: 'solusdt', XRP: 'xrpusdt', USDT: 'usdtusdt', ADA: 'adausdt', DOGE: 'dogeusdt' }
  for (const coin of hotCoins.value) {
    try {
      const res = await fetch(`/binance-api/api/v3/ticker/24hr?symbol=${cfg[coin.symbol].toUpperCase()}`)
      const d = await res.json()
      coin.price = parseFloat(d.lastPrice) || 0
      coin.change = parseFloat(d.priceChangePercent) || 0
    } catch {
      coin.price = 0
      coin.change = 0
    }
  }
}

onMounted(() => {
  setChartSeo()
  currentTime.value = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
  timeTimer = setInterval(() => {
    currentTime.value = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
  }, 1000)
  connectWS()
  fetchHotCoins()
  loadTV()
})

onUnmounted(() => {
  ws?.close()
  clearInterval(timeTimer)
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap');
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Noto Sans SC', sans-serif; background: #f5f5f5; color: #333; }
a { text-decoration: none; color: inherit; }
.app { min-height: 100vh; }
.back-home-chip { display:inline-flex; align-items:center; gap:6px; border:1px solid #e5e7eb; background:#fff; color:#475569; padding:8px 12px; border-radius:10px; font-size:13px; font-weight:600; cursor:pointer; transition:all .2s; }
.back-home-chip:hover { background:#fff7ed; color:#f97316; border-color:#fdba74; }

.header { background: #fff; border-bottom: 1px solid #e5e5e5; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; }
.header-left { display: flex; align-items: center; gap: 12px; }
.back-btn { color: #666; font-size: 14px; padding: 8px 16px; background: #f5f5f5; border-radius: 6px; }
.brand { font-size: 18px; font-weight: 700; color: #F97316; }
.symbol-tag { background: #F97316; color: #fff; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; }
.time { font-size: 13px; color: #999; }

.main { max-width: 1200px; margin: 0 auto; padding: 15px; display: flex; gap: 15px; }
.col-left { flex: 1; min-width: 0; }
.col-right { width: 300px; flex-shrink: 0; }

.price-panel { background: #fff; border: 1px solid #e5e5e5; border-radius: 8px; padding: 20px; margin-bottom: 10px; }
.price-row { display: flex; align-items: baseline; gap: 12px; margin-bottom: 15px; }
.price-value { font-size: 32px; font-weight: 700; }
.price-change { font-size: 16px; font-weight: 600; padding: 4px 10px; border-radius: 4px; }
.price-change.up { color: #22c55e; background: #dcfce7; }
.price-change.down { color: #ef4444; background: #fee2e2; }
.price-stats { display: flex; gap: 20px; }
.stat { text-align: center; }
.stat .label { display: block; font-size: 12px; color: #999; margin-bottom: 4px; }
.stat .val { font-size: 14px; font-weight: 600; }

.tab-bar { background: #fff; border: 1px solid #e5e5e5; border-radius: 8px; padding: 0 15px; margin-bottom: 10px; display: flex; align-items: center; height: 44px; }
.tab { padding: 10px 15px; color: #666; font-size: 14px; border-bottom: 2px solid transparent; }
.tab.active { color: #F97316; border-bottom-color: #F97316; font-weight: 600; }
.tab-spacer { flex: 1; }
.intervals { display: flex; gap: 8px; }
.interval { padding: 4px 8px; font-size: 12px; color: #666; border-radius: 4px; }
.interval.active { background: #F97316; color: #fff; }

.chart-box { background: #fff; border: 1px solid #e5e5e5; border-radius: 8px; height: 450px; overflow: hidden; margin-bottom: 10px; position: relative; }
#tradingview_chart { width: 100%; height: 100%; }
.draw-tool-btn { position: absolute; bottom: 15px; right: 15px; background: #F97316; color: #fff; padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: 500; z-index: 100; box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
.draw-tool-btn:hover { background: #ea580c; }

.ai-panel { background: #fff; border: 1px solid #e5e5e5; border-radius: 8px; padding: 15px; margin-bottom: 10px; }
.ai-panel h3 { font-size: 14px; margin-bottom: 10px; }
.ai-panel p { font-size: 13px; color: #666; line-height: 1.6; }

.exchange-panel { background: #fff; border: 1px solid #e5e5e5; border-radius: 8px; padding: 15px; }
.exchange-panel h3 { font-size: 14px; margin-bottom: 10px; }
.exchange-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.exchange-table th { text-align: left; padding: 8px; border-bottom: 1px solid #eee; color: #999; font-weight: 500; }
.exchange-table td { padding: 8px; border-bottom: 1px solid #f5f5f5; }

.panel { background: #fff; border: 1px solid #e5e5e5; border-radius: 8px; padding: 15px; margin-bottom: 10px; }
.panel-title { font-size: 14px; font-weight: 600; padding-bottom: 10px; border-bottom: 1px solid #f0f0f0; margin-bottom: 12px; }

.hot-list { display: flex; flex-direction: column; gap: 8px; }
.hot-item { display: flex; align-items: center; gap: 10px; padding: 6px; border-radius: 6px; }
.hot-item:hover { background: #f9f9f9; }
.hot-icon { width: 24px; height: 24px; border-radius: 50%; object-fit: cover; }
.hot-info { flex: 1; }
.hot-symbol { font-weight: 600; font-size: 13px; display: block; }
.hot-name { font-size: 11px; color: #999; }
.hot-price { text-align: right; }
.hot-price .price { display: block; font-size: 12px; font-weight: 600; }
.hot-price .change { font-size: 11px; }
.hot-price .up { color: #22c55e; }
.hot-price .down { color: #ef4444; }

@media (max-width: 900px) {
  .main { flex-direction: column; }
  .col-right { width: 100%; }
  .price-stats { flex-wrap: wrap; }
  .stat { min-width: 45%; }
}
</style>
