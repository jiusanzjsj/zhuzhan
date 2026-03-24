<template>
  <div class="market-page">
    <!-- Ticker Bar -->
    <div class="bg-gradient-to-r from-orange-50 via-white to-amber-50 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-3">
        <div class="bg-white/80 backdrop-blur-sm rounded-xl border-t border-b border-orange-200 shadow-[0_2px_12px_rgba(249,115,22,0.08)] p-2 overflow-hidden relative">
          <div class="ticker-wrap flex gap-3 items-center">
            <div class="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-orange-50 to-transparent z-10 pointer-events-none"></div>
            <div class="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-amber-50 to-transparent z-10 pointer-events-none"></div>
          <a v-for="coin in [...coinList.slice(0,13),...coinList.slice(0,13)]" :key="coin.symbol+'-dup'" @click.prevent="goToChart(coin.symbol)" class="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-gray-50 cursor-pointer whitespace-nowrap transition-all flex-shrink-0">
            <img :src="'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/' + coin.symbol.toLowerCase() + '.png'" class="w-5 h-5 rounded-full" @error="onImageError($event)" :alt="coin.symbol" :data-symbol="coin.symbol">
            <span class="font-bold text-gray-800 text-xs">{{ coin.symbol }}</span>
            <span class="font-mono font-medium text-gray-700 text-xs">${{ formatPrice(coin.price) }}</span>
            <span class="text-xs font-medium px-1 py-0.5 rounded" :class="coin.change>=0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'">
              {{ coin.change>=0?'+':''}}{{ coin.change?.toFixed(2) || '0.00' }}%
            </span>
          </a>
        </div>
        </div>
      </div>
    </div>

    <!-- 海报 -->
    <div class="max-w-7xl mx-auto px-4 py-4">
      <img src="/banner.png" alt="Banner" class="w-full rounded-lg shadow-sm">
    </div>

    <!-- 数据统计卡片 -->
    <div class="bg-gray-50 border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 py-3">
        <div class="grid grid-cols-4 gap-3">
          <!-- 24H成交额 -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-3">
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm text-gray-400">24H成交额</span>
              <span class="text-lg">📊</span>
            </div>
            <div v-if="statsLoading" class="h-20 skeleton-glow"></div>
            <div v-else ref="volumeChart" class="h-20"></div>
            <div v-if="statsLoading" class="h-7 w-24 skeleton-text mt-2"></div>
            <div v-else class="text-lg font-bold text-gray-800">${{ formatVolume(totalVolume24h) }}</div>
          </div>
          <!-- 总市值 -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-3">
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm text-gray-400">总市值</span>
              <span class="text-lg">💰</span>
            </div>
            <div v-if="statsLoading" class="h-20 skeleton-glow"></div>
            <div v-else ref="marketChart" class="h-20"></div>
            <div v-if="statsLoading" class="h-7 w-24 skeleton-text mt-2"></div>
            <div v-else class="text-lg font-bold text-gray-800">${{ formatMarket(totalMarketCap) }}</div>
          </div>
          <!-- 恐慌指数 -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-3">
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm text-gray-400">恐慌指数</span>
              <span class="text-lg">😱</span>
            </div>
            <div v-if="statsLoading" class="h-12 skeleton-glow"></div>
            <div v-else class="flex items-center gap-2">
              <div class="text-3xl font-bold" :class="fearGreedIndex >= 50 ? 'text-green-500' : 'text-red-500'">{{ fearGreedIndex }}</div>
              <span class="text-sm px-2 py-1 rounded-full font-medium" :class="fearGreedIndex >= 50 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'">{{ fearGreedIndex >= 50 ? '贪婪' : '恐慌' }}</span>
            </div>
            <div v-if="!statsLoading" class="w-full bg-gray-100 rounded-full h-2 mt-2 overflow-hidden">
              <div class="h-full rounded-full transition-all" :class="fearGreedIndex >= 50 ? 'bg-green-500' : 'bg-red-500'" :style="{ width: fearGreedIndex + '%' }"></div>
            </div>
          </div>
          <!-- 涨跌分布 -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-3">
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm text-gray-400">24H涨跌</span>
              <span class="text-lg">📈</span>
            </div>
            <div v-if="statsLoading" class="h-20 skeleton-glow"></div>
            <div v-else ref="pieChart" class="h-20"></div>
            <div v-if="statsLoading" class="h-5 w-16 skeleton-text mt-2"></div>
            <div v-else class="flex justify-between text-sm mt-1">
              <span class="text-green-500">↑{{ upPercent }}%</span>
              <span class="text-red-500">↓{{ downPercent }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>


    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 py-5">
      <!-- Data Table -->
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
                <img :src="'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/' + coin.symbol.toLowerCase() + '.png'" class="w-9 h-9 rounded-full ring-2 ring-gray-100 group-hover:ring-orange-200 transition" @error="onImageError($event)" :alt="coin.symbol" :data-symbol="coin.symbol">
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
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'

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
  { symbol: 'BNB', name: 'BNB', market: 87000000000, volume: 15000000000, supply: 153000000, color: '#F3BA2F', pair: 'bnbusdt' },
  { symbol: 'SOL', name: 'Solana', market: 50000000000, volume: 25000000000, supply: 46000000, color: '#9945FF', pair: 'solusdt' },
  { symbol: 'XRP', name: 'Ripple', market: 88000000000, volume: 25000000000, supply: 99000000000, color: '#23292F', pair: 'xrpusdt' },
  { symbol: 'TRX', name: 'TRON', market: 28000000000, volume: 5000000000, supply: 87000000000, color: '#FF0013', pair: 'trxusdt' },
  { symbol: 'DOGE', name: 'Dogecoin', market: 14000000000, volume: 8000000000, supply: 140000000000, color: '#C2A633', pair: 'dogeusdt' },
  { symbol: 'ADA', name: 'Cardano', market: 12000000000, volume: 3500000000, supply: 35000000000, color: '#0033AD', pair: 'adausdt' },
  { symbol: 'AVAX', name: 'Avalanche', market: 11000000000, volume: 3500000000, supply: 41000000, color: '#E84142', pair: 'avaxusdt' },
  { symbol: 'DOT', name: 'Polkadot', market: 10000000000, volume: 2500000000, supply: 1500000000, color: '#E6007A', pair: 'dotusdt' },
  { symbol: 'LINK', name: 'Chainlink', market: 9000000000, volume: 2500000000, supply: 600000000, color: '#2A5ADA', pair: 'linkusdt' },
  { symbol: 'MATIC', name: 'Polygon', market: 8000000000, volume: 2000000000, supply: 9800000000, color: '#8247E5', pair: 'polusdt' },
  { symbol: 'LTC', name: 'Litecoin', market: 7000000000, volume: 3000000000, supply: 76000000, color: '#BFBBBB', pair: 'ltcusdt' },
  { symbol: 'SHIB', name: 'Shiba Inu', market: 6000000000, volume: 1500000000, supply: 589000000000000, color: '#FFA409', pair: 'shibusdt' },
  { symbol: 'PEPE', name: 'Pepe', market: 5000000000, volume: 3000000000, supply: 4200000000000000, color: '#529652', pair: 'pepeusdt' },
  { symbol: 'WIF', name: 'dogwifhat', market: 3000000000, volume: 1500000000, supply: 1000000000, color: '#FF6B6B', pair: 'wifusdt' },
  { symbol: 'SUI', name: 'Sui', market: 4000000000, volume: 2000000000, supply: 3000000000, color: '#6FB8F2', pair: 'suiusdt' },
  { symbol: 'APT', name: 'Aptos', market: 4000000000, volume: 1800000000, supply: 1000000000, color: '#14F0A8', pair: 'aptusdt' },
  { symbol: 'ARB', name: 'Arbitrum', market: 3500000000, volume: 1500000000, supply: 1300000000, color: '#28A0F0', pair: 'arbusdt' },
  { symbol: 'OP', name: 'Optimism', market: 3000000000, volume: 1200000000, supply: 1200000000, color: '#FF0420', pair: 'opusdt' },
  { symbol: 'INJ', name: 'Injective', market: 2500000000, volume: 800000000, supply: 100000000, color: '#00F2FE', pair: 'injusdt' },
  { symbol: 'FIL', name: 'Filecoin', market: 2500000000, volume: 1000000000, supply: 700000000, color: '#0090FF', pair: 'filusdt' },
  { symbol: 'RUNE', name: 'THORChain', market: 2000000000, volume: 500000000, supply: 350000000, color: '#FF8533', pair: 'runeusdt' },
  { symbol: 'NEAR', name: 'NEAR Protocol', market: 3000000000, volume: 1000000000, supply: 110000000, color: '#00C08B', pair: 'nearusdt' },
  { symbol: 'ATOM', name: 'Cosmos', market: 3500000000, volume: 1200000000, supply: 400000000, color: '#2E3148', pair: 'atomusdt' },
  { symbol: 'UNI', name: 'Uniswap', market: 4500000000, volume: 1500000000, supply: 550000000, color: '#FF007A', pair: 'uniusdt' },
  { symbol: 'AAVE', name: 'Aave', market: 2000000000, volume: 600000000, supply: 16000000, color: '#2EBAC6', pair: 'aaveusdt' },
  { symbol: 'MKR', name: 'Maker', market: 1800000000, volume: 500000000, supply: 900000, color: '#1AAB9B', pair: 'mkrusdt' },
  { symbol: 'CRV', name: 'Curve DAO', market: 1500000000, volume: 400000000, supply: 3000000000, color: '#FF6B6B', pair: 'crvusdt' },
  { symbol: 'BCH', name: 'Bitcoin Cash', market: 12000000000, volume: 3000000000, supply: 19700000, color: '#8DC351', pair: 'bchusdt' },
  { symbol: 'TON', name: 'Toncoin', market: 18000000000, volume: 8000000000, supply: 5000000000, color: '#0098EA', pair: 'tonusdt' },
  { symbol: 'NOT', name: 'Notcoin', market: 2500000000, volume: 1500000000, supply: 100000000000, color: '#FF4040', pair: 'notusdt' },
  { symbol: 'PNUT', name: 'Peanut the Squirrel', market: 2000000000, volume: 800000000, supply: 1000000000, color: '#FFB347', pair: 'pnutusdt' },
  { symbol: 'VINE', name: 'Vine Protocol', market: 1500000000, volume: 500000000, supply: 1000000000, color: '#00D4AA', pair: 'vineusdt' },
  { symbol: 'AI16Z', name: 'ai16z', market: 1500000000, volume: 500000000, supply: 1000000000, color: '#00D4AA', pair: 'ai16zusdt' },
  { symbol: 'GOAT', name: 'Goat', market: 800000000, volume: 300000000, supply: 1000000000, color: '#FFB347', pair: 'goatusdt' },
  { symbol: 'VIRTUAL', name: 'Virtual Protocol', market: 1200000000, volume: 400000000, supply: 2000000000, color: '#6FB8F2', pair: 'virtualusdt' },
  { symbol: 'FET', name: 'Fetch.ai', market: 2500000000, volume: 800000000, supply: 1500000000, color: '#2A5ADA', pair: 'fetusdt' },
  { symbol: 'RENDER', name: 'Render', market: 3000000000, volume: 1000000000, supply: 500000000, color: '#FF6B6B', pair: 'renderusdt' },
  { symbol: 'GRT', name: 'The Graph', market: 2000000000, volume: 600000000, supply: 10000000000, color: '#6747ED', pair: 'grtusdt' },
  { symbol: 'STX', name: 'Stacks', market: 2500000000, volume: 800000000, supply: 1400000000, color: '#5546FF', pair: 'stxusdt' },
  { symbol: 'IMX', name: 'Immutable', market: 2000000000, volume: 600000000, supply: 1500000000, color: '#00C2E4', pair: 'imxusdt' },
  { symbol: 'ENS', name: 'Ethereum Name Service', market: 1500000000, volume: 400000000, supply: 200000000, color: '#529652', pair: 'ensusdt' },
  { symbol: 'BLUR', name: 'Blur', market: 1000000000, volume: 500000000, supply: 3000000000, color: '#FF6B6B', pair: 'blurusdt' },
  { symbol: 'MKR', name: 'Maker', market: 1800000000, volume: 500000000, supply: 900000, color: '#1AAB9B', pair: 'mkrusdt' },
  { symbol: 'CRV', name: 'Curve DAO', market: 1500000000, volume: 400000000, supply: 3000000000, color: '#FF6B6B', pair: 'crvusdt' },
  { symbol: 'BCH', name: 'Bitcoin Cash', market: 12000000000, volume: 3000000000, supply: 19700000, color: '#8DC351', pair: 'bchusdt' },
  { symbol: 'TON', name: 'Toncoin', market: 18000000000, volume: 8000000000, supply: 5000000000, color: '#0098EA', pair: 'tonusdt' },
  { symbol: 'NOT', name: 'Notcoin', market: 2500000000, volume: 1500000000, supply: 100000000000, color: '#FF4040', pair: 'notusdt' },
  { symbol: 'PNUT', name: 'Peanut the Squirrel', market: 2000000000, volume: 800000000, supply: 1000000000, color: '#FFB347', pair: 'pnutusdt' },
]

const coinList = ref(coinConfig.map(c => ({ ...c, price: 0, change: 0 })))

// ECharts refs
const volumeChart = ref(null)
const marketChart = ref(null)
const fearChart = ref(null)
const pieChart = ref(null)
let volumeChartInstance = null
let marketChartInstance = null
let fearChartInstance = null
let pieChartInstance = null

const initCharts = () => {
  // 成交额 - 迷你趋势图
  if (volumeChart.value) {
    volumeChartInstance = echarts.init(volumeChart.value)
    volumeChartInstance.setOption({
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(255,255,255,0.95)', borderColor: '#e5e7eb', textStyle: { color: '#374151', fontSize: 12 }, padding: [8, 12], formatter: (params) => `24H成交额<br/>$${formatVolume(totalVolume24h.value)}` },
      grid: { top: 2, bottom: 18, left: 0, right: 0 },
      xAxis: { type: 'category', data: ['1', '2', '3', '4', '5', '6', '7'], axisLine: { show: false }, axisTick: { show: false }, axisLabel: { show: false } },
      yAxis: { type: 'value', show: false },
      series: [{
        type: 'line',
        data: [30, 45, 35, 50, 40, 60, totalVolume24h.value / 1e12],
        smooth: true,
        symbol: 'none',
        lineStyle: { color: '#3b82f6', width: 2 },
        areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(59, 130, 246, 0.3)' }, { offset: 1, color: 'rgba(59, 130, 246, 0)' }]) }
      }]
    })
  }
  
  // 总市值 - 环形图
  if (marketChart.value) {
    marketChartInstance = echarts.init(marketChart.value)
    marketChartInstance.setOption({
      tooltip: { trigger: 'item', backgroundColor: 'rgba(255,255,255,0.95)', borderColor: '#e5e7eb', textStyle: { color: '#374151', fontSize: 12 }, padding: [8, 12], formatter: (params) => `总市值<br/>$${formatMarket(totalMarketCap.value)}` },
      series: [{
        type: 'pie',
        radius: ['60%', '80%'],
        center: ['50%', '50%'],
        data: [{ value: totalMarketCap.value / 1e12, name: '市值' }],
        itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [{ offset: 0, color: '#8b5cf6' }, { offset: 1, color: '#a78bfa' }]) },
        label: { show: false },
        emphasis: { scale: true, scaleSize: 5 }
      }]
    })
  }
  
  // 恐慌指数 - 仪表盘
  if (fearChart.value) {
    fearChartInstance = echarts.init(fearChart.value)
    const fearColor = fearGreedIndex.value >= 50 ? '#22c55e' : '#ef4444'
    fearChartInstance.setOption({
      tooltip: { trigger: 'item', backgroundColor: 'rgba(255,255,255,0.95)', borderColor: '#e5e7eb', textStyle: { color: '#374151', fontSize: 12 }, padding: [8, 12], formatter: () => `恐慌指数: ${fearGreedIndex.value}<br/>${fearGreedIndex.value >= 50 ? '贪婪' : '恐慌'}` },
      series: [{
        type: 'gauge',
        startAngle: 200,
        endAngle: -20,
        min: 0,
        max: 100,
        splitNumber: 10,
        itemStyle: { color: fearColor },
        progress: { show: true, width: 8, roundCap: true },
        pointer: { show: false },
        axisLine: { lineStyle: { width: 8, color: [[1, '#e5e7eb']] } },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        detail: { 
          valueAnimation: true, 
          fontSize: 24, 
          fontWeight: 'bold',
          offsetCenter: [0, '20%'],
          color: fearColor,
          formatter: '{value}'
        },
        data: [{ value: fearGreedIndex.value }]
      }]
    })
  }
  
  // 涨跌分布 - 饼图
  if (pieChart.value) {
    pieChartInstance = echarts.init(pieChart.value)
    pieChartInstance.setOption({
      tooltip: { trigger: 'item', backgroundColor: 'rgba(255,255,255,0.95)', borderColor: '#e5e7eb', textStyle: { color: '#374151', fontSize: 12 }, padding: [8, 12] },
      series: [{
        type: 'pie',
        radius: ['50%', '80%'],
        center: ['50%', '50%'],
        data: [
          { value: upPercent.value, name: '上涨', itemStyle: { color: '#22c55e' } },
          { value: downPercent.value, name: '下跌', itemStyle: { color: '#ef4444' } }
        ],
        label: { show: false },
        emphasis: { scale: true, scaleSize: 5 }
      }]
    })
  }
}

const updateCharts = () => {
  // 更新成交额趋势图
  if (volumeChartInstance) {
    volumeChartInstance.setOption({
      series: [{ data: [30, 45, 35, 50, 40, 60, totalVolume24h.value / 1e12] }]
    })
  }
  // 更新总市值
  if (marketChartInstance) {
    marketChartInstance.setOption({
      series: [{ data: [{ value: totalMarketCap.value / 1e12 }] }]
    })
  }
  // 更新恐慌指数
  if (fearChartInstance) {
    const fearColor = fearGreedIndex.value >= 50 ? '#22c55e' : '#ef4444'
    fearChartInstance.setOption({
      series: [{
        itemStyle: { color: fearColor },
        detail: { color: fearColor },
        data: [{ value: fearGreedIndex.value }]
      }]
    })
  }
  // 更新涨跌分布
  if (pieChartInstance) {
    pieChartInstance.setOption({
      series: [{
        data: [
          { value: upPercent.value, name: '上涨', itemStyle: { color: '#22c55e' } },
          { value: downPercent.value, name: '下跌', itemStyle: { color: '#ef4444' } }
        ]
      }]
    })
  }
}

// 数据统计
const totalVolume24h = ref(0)
const totalMarketCap = ref(0)
const fearGreedIndex = ref(50)
const upPercent = ref(50)
const downPercent = ref(50)
const statsLoading = ref(true)

const fetchStats = async () => {
  statsLoading.value = true
  try {
    // 从Binance获取24h交易量
    const res = await fetch('https://api.binance.com/api/v3/ticker/24hr')
    const data = await res.json()
    let volume = 0
    data.forEach(t => {
      if (t.symbol.endsWith('USDT')) {
        volume += parseFloat(t.quoteVolume || 0)
      }
    })
    totalVolume24h.value = volume
    
    // 计算涨跌分布
    const upCoins = data.filter(t => t.symbol.endsWith('USDT') && parseFloat(t.priceChangePercent) > 0).length
    const downCoins = data.filter(t => t.symbol.endsWith('USDT') && parseFloat(t.priceChangePercent) < 0).length
    const total = upCoins + downCoins
    upPercent.value = total > 0 ? Math.round((upCoins / total) * 100) : 50
    downPercent.value = total > 0 ? Math.round((downCoins / total) * 100) : 50
  } catch (e) {
    console.error('fetchStats error:', e)
  }
  
  // 获取恐慌指数 (Alternative.me API)
  try {
    const fsRes = await fetch('https://api.alternative.me/fng/')
    const fsData = await fsRes.json()
    if (fsData.data && fsData.data[0]) {
      fearGreedIndex.value = parseInt(fsData.data[0].value)
    }
  } catch (e) {
    console.error('fear index error:', e)
  }
  
  // 估算总市值 (前100币种)
  totalMarketCap.value = coinList.value.reduce((sum, c) => sum + (c.market || 0), 0)
  
  // 更新图表
  updateCharts()
  statsLoading.value = false
}

const sortedList = computed(() => {
  // 只返回前13个币种
  return coinList.value.slice(0, 13)
})

const formatPrice = (p) => p ? p.toFixed(2) : '0.00'
const formatMarket = (v) => v >= 1e12 ? (v / 1e12).toFixed(1) + '万亿' : v >= 1e8 ? (v / 1e8).toFixed(1) + '亿' : v
const formatVolume = (v) => v >= 1e12 ? (v / 1e12).toFixed(1) + '万亿' : v >= 1e8 ? (v / 1e8).toFixed(1) + '亿' : v
const formatSupply = (s) => s >= 1e9 ? (s / 1e9).toFixed(1) + '亿' : s >= 1e6 ? (s / 1e6).toFixed(1) + '万' : s

const onImageError = (e) => {
  e.target.style.display = 'none'
}

const goToChart = (s) => {
  // 暂时禁用跳转，点击只打印日志
  console.log('Selected:', s)
}

const connectWS = () => {
  // 连接所有币种
  const streams = coinConfig.map(c => c.pair + '@ticker').join('/')
  ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`)
  ws.onmessage = (e) => {
    try {
      const d = JSON.parse(e.data).data
      if (!d) return
      const c = coinList.value.find(x => x.symbol === d.s.replace('USDT', ''))
      if (c) {
        if (d.c) c.price = parseFloat(d.c)
        if (d.P) c.change = parseFloat(d.P)
      }
    } catch {}
  }
  ws.onclose = () => setTimeout(connectWS, 3000)
}

const fetchChange = async () => {
  try {
    const promises = coinConfig.map(async (c) => {
      const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${c.pair.toUpperCase()}`)
      const d = await res.json()
      return { symbol: c.symbol, price: d.lastPrice ? parseFloat(d.lastPrice) : 0, change: d.priceChangePercent ? parseFloat(d.priceChangePercent) : 0 }
    })
    const results = await Promise.all(promises)
    results.forEach(r => {
      const coin = coinList.value.find(c => c.symbol === r.symbol)
      if (coin) {
        coin.price = r.price
        coin.change = r.change
      }
    })
  } catch (e) {
    console.error('fetchChange error:', e)
  }
}

onMounted(() => {
  connectWS()
  fetchChange()
  fetchStats().then(() => {
    nextTick(() => {
      initCharts()
    })
  })
})

onUnmounted(() => { 
  ws?.close()
  volumeChartInstance?.dispose()
  marketChartInstance?.dispose()
  fearChartInstance?.dispose()
  pieChartInstance?.dispose()
})
</script>

<style>
/* 走马灯容器样式 */
.ticker-wrap {
  width: 200%;           /* 宽度是屏幕的2倍，用于循环滚动 */
  animation: ticker-scroll 30s linear infinite;  /* 30秒滚动一次，无限循环 */
  display: flex;         /* 弹性布局 */
  align-items: center;  /* 垂直居中 */
}
.ticker-wrap:hover {
  animation-play-state: paused;  /* 鼠标悬停时暂停滚动 */
}
@keyframes ticker-scroll {
  0% { transform: translateX(0); }       /* 开始位置 */
  100% { transform: translateX(-50%); } /* 滚动到一半的位置 */
}

/* 走马灯每个项目的样式 */
.ticker-wrap a {
  display: flex;                    /* 弹性布局 */
  align-items: center;             /* 垂直居中 */
  gap: 6px;                        /* 项目内元素间距 */
  padding: 6px 12px;              /* 内边距 */
  margin-right: 8px;              /* 右外边距 */
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);  /* 渐变背景 */
  border-radius: 20px;            /* 圆角20px */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);  /* 阴影 */
  transition: all 0.3s ease;       /* 过渡动画0.3秒 */
  white-space: nowrap;             /* 不换行 */
  border: 1px solid #f0f0f0;      /* 边框 */
}
.ticker-wrap a:hover {
  transform: translateY(-2px);    /* 悬停时向上移动2px */
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.2);  /* 悬停时橙色阴影 */
  border-color: #F97316;         /* 悬停时边框变橙色 */
}
.ticker-wrap a img {
  width: 20px;        /* 图标宽度20px */
  height: 20px;       /* 图标高度20px */
  border-radius: 50%; /* 圆形头像 */
}
.ticker-wrap a .font-bold {
  font-size: 13px;    /* 币种名字体大小 */
  color: #1f2937;     /* 字体颜色深灰 */
}
.ticker-wrap a .font-mono {
  font-size: 12px;    /* 价格字体大小 */
  color: #6b7280;     /* 价格颜色中灰 */
}
.ticker-wrap a .text-xs {
  font-size: 11px;    /* 涨跌字体大小 */
  padding: 2px 6px;  /* 涨跌内边距 */
  border-radius: 10px; /* 涨跌圆角 */
}

.ticker-wrap:hover {
  animation-play-state: paused;
}
@keyframes ticker-scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

/* 炫酷骨架屏 */
.skeleton-glow {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%);
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}
.skeleton-glow::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(249, 115, 22, 0.15), transparent);
  animation: shimmer 1.5s infinite;
}
.skeleton-glow::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 8px;
  animation: border-glow 2s ease-in-out infinite;
}
.skeleton-text {
  background: linear-gradient(90deg, #e5e7eb 0%, #d1d5db 50%, #e5e7eb 100%);
  background-size: 200% 100%;
  animation: text-shimmer 1.2s infinite;
  border-radius: 4px;
}

@keyframes shimmer {
  0% { left: -50%; }
  100% { left: 150%; }
}

@keyframes border-glow {
  0%, 100% { box-shadow: inset 0 0 0 1px rgba(249, 115, 22, 0.1); }
  50% { box-shadow: inset 0 0 0 2px rgba(249, 115, 22, 0.3), 0 0 15px rgba(249, 115, 22, 0.2); }
}

@keyframes text-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
</style>
