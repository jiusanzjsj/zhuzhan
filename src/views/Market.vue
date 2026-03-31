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
        <div class="flex items-center px-11 py-3.5 bg-gray-50/50 border-b border-gray-100 text-xs text-gray-500 font-medium">
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
            <div class="w-32 text-right flex flex-col items-end -ml-2">
              <span class="font-mono font-semibold text-gray-800">${{ formatPrice(coin.price) }}</span>
              <span class="text-xs text-gray-400">¥{{ formatCNY(coin.price) }}</span>
            </div>
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

let ws = null

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
      tooltip: { 
        trigger: 'item', 
        backgroundColor: 'rgba(255,255,255,0.95)', 
        borderColor: '#e5e7eb', 
        textStyle: { color: '#374151', fontSize: 12 }, 
        padding: [8, 12],
        formatter: (params) => `${params.name}: <b style="color:${params.color}">${params.value}%</b>`
      },
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
      tooltip: { 
        trigger: 'item', 
        backgroundColor: 'rgba(255,255,255,0.95)', 
        borderColor: '#e5e7eb', 
        textStyle: { color: '#374151', fontSize: 12 }, 
        padding: [8, 12],
        formatter: (params) => `${params.name}: <b style="color:${params.color}">${params.value}%</b>`
      },
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

// 缓存键名
const CACHE_KEY = 'market_stats_cache'
const CACHE_EXPIRY_KEY = 'market_stats_expiry'

// 获取缓存过期时间 (次日零点)
const getNextMidnight = () => {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  return tomorrow.getTime()
}

// 检查缓存是否有效
const isCacheValid = () => {
  try {
    const expiry = localStorage.getItem(CACHE_EXPIRY_KEY)
    if (!expiry) return false
    const expiryTime = parseInt(expiry)
    return Date.now() < expiryTime
  } catch {
    return false
  }
}

// 从缓存加载数据
const loadFromCache = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (cached) {
      const data = JSON.parse(cached)
      totalVolume24h.value = data.volume || 0
      totalMarketCap.value = data.marketCap || 0
      fearGreedIndex.value = data.fearIndex || 50
      upPercent.value = data.upPercent || 50
      downPercent.value = data.downPercent || 50
      return true
    }
  } catch {}
  return false
}

// 保存数据到缓存
const saveToCache = () => {
  try {
    const data = {
      volume: totalVolume24h.value,
      marketCap: totalMarketCap.value,
      fearIndex: fearGreedIndex.value,
      upPercent: upPercent.value,
      downPercent: downPercent.value,
      savedAt: Date.now()
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(data))
    localStorage.setItem(CACHE_EXPIRY_KEY, getNextMidnight().toString())
    console.log('[Market] 统计数据已缓存')
  } catch (e) {
    console.error('缓存失败:', e)
  }
}

// 定时器ID
let hourlyTimer = null

// 获取下一个整点时间戳
const getNextHour = () => {
  const now = new Date()
  const nextHour = new Date(now)
  nextHour.setMinutes(0, 0, 0)
  nextHour.setHours(nextHour.getHours() + 1)
  return nextHour.getTime()
}

// 设置每小时整点定时刷新
const setupHourlyRefresh = () => {
  if (hourlyTimer) clearTimeout(hourlyTimer)
  
  const now = Date.now()
  const nextHourTime = getNextHour()
  const msUntilNextHour = nextHourTime - now
  
  const minutes = Math.round(msUntilNextHour / 1000 / 60)
  console.log(`[Market] 距离下次刷新: ${minutes} 分钟 (${new Date(nextHourTime).toLocaleTimeString()})`)
  
  hourlyTimer = setTimeout(() => {
    console.log('[Market] 整点定时刷新...')
    fetchStats(true) // 强制刷新
    setupHourlyRefresh() // 重新设置下次定时器
  }, msUntilNextHour)
}

const fetchStats = async (forceRefresh = false) => {
  // 检查缓存
  if (!forceRefresh && isCacheValid() && loadFromCache()) {
    console.log('[Market] 从缓存加载统计数据')
    updateCharts()
    statsLoading.value = false
    return
  }
  
  statsLoading.value = true
  
  try {
    // 获取24H成交额（从CoinGecko获取）
    try {
      const cgRes = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=1&page=1&sparkline=false&price_change_percentage=24h')
      const cgData = await cgRes.json()
      if (cgData && cgData[0] && cgData[0].total_volume) {
        totalVolume24h.value = cgData[0].total_volume
      }
    } catch (e) {
      console.error('获取24H成交额失败:', e)
    }

    // 获取涨跌分布（从Binance获取全量ticker）
    try {
      const res = await fetch('/binance-api/api/v3/ticker/24hr')
      const data = await res.json()
      const upCoins = data.filter(t => t.symbol.endsWith('USDT') && parseFloat(t.priceChangePercent) > 0).length
      const downCoins = data.filter(t => t.symbol.endsWith('USDT') && parseFloat(t.priceChangePercent) < 0).length
      const total = upCoins + downCoins
      upPercent.value = total > 0 ? Math.round((upCoins / total) * 100) : 50
      downPercent.value = total > 0 ? Math.round((downCoins / total) * 100) : 50
    } catch (e) {
      console.error('获取涨跌分布失败:', e)
    }
  } catch (e) {
    console.error('fetchStats error:', e)
  }
  
  // 获取恐慌指数 (CoinMarketCap API)
  try {
    // 你的 CMC API Key
    const CMC_API_KEY = 'd7cabf5dc77c446e9dc16b1e8eba8979'
    
    const cmcRes = await fetch('https://pro-api.coinmarketcap.com/v3/fear-and-greed/latest', {
      headers: { 'X-CMC_PRO_API_KEY': CMC_API_KEY }
    })
    const cmcData = await cmcRes.json()
    
    if (cmcData.data && cmcData.data.value) {
      fearGreedIndex.value = cmcData.data.value
    } else {
      throw new Error('CMC无数据')
    }
  } catch (e) {
    // 备用：alternative.me
    try {
      const fsRes = await fetch('https://api.alternative.me/fng/')
      const fsData = await fsRes.json()
      if (fsData.data && fsData.data[0]) {
        fearGreedIndex.value = parseInt(fsData.data[0].value)
      }
    } catch (e2) {
      console.error('fear index error:', e2)
    }
  }
  
  // 获取总市值（从CoinGecko全球市场获取）
  try {
    const cgRes = await fetch('https://api.coingecko.com/api/v3/global')
    const cgData = await cgRes.json()
    if (cgData && cgData.data && cgData.data.total_market_cap && cgData.data.total_market_cap.usd) {
      totalMarketCap.value = cgData.data.total_market_cap.usd
    }
  } catch (e) {
    console.error('获取总市值失败:', e)
  }
  
  // 保存到缓存
  saveToCache()
  
  // 更新图表
  updateCharts()
  statsLoading.value = false
}

const sortedList = computed(() => {
  // 固定13个流行币种，无序展示
  return coinList.value
})

const formatPrice = (p) => p ? p.toFixed(2) : '0.00'
const formatCNY = (p) => p ? (p * 7.3).toFixed(0) : '0'
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
      const res = await fetch(`/binance-api/api/v3/ticker/24hr?symbol=${c.pair.toUpperCase()}`)
      const d = await res.json()
      console.log('[Market] Binance响应:', c.symbol, 'price:', d.lastPrice, 'change:', d.priceChangePercent)
      return { symbol: c.symbol, price: d.lastPrice ? parseFloat(d.lastPrice) : 0, change: d.priceChangePercent ? parseFloat(d.priceChangePercent) : 0 }
    })
    const results = await Promise.all(promises)
    console.log('[Market] 全部结果:', results)
    results.forEach(r => {
      const idx = coinList.value.findIndex(c => c.symbol === r.symbol)
      if (idx !== -1) {
        coinList.value[idx] = { ...coinList.value[idx], price: r.price, change: r.change }
      }
    })
    console.log('[Market] coinList更新后:', coinList.value.map(c => ({ symbol: c.symbol, price: c.price, change: c.change })))
  } catch (e) {
    console.error('fetchChange error:', e)
  }
}

onMounted(() => {
  // 先从缓存加载显示，再后台刷新
  if (loadFromCache()) {
    console.log('[Market] 页面加载: 从缓存渲染')
    nextTick(() => {
      initCharts()
    })
    // 缓存命中也要拉取币价（走 Binance API）
    fetchChange()
    // 后台异步刷新统计
    fetchStats()
  } else {
    // 无缓存，正常加载
    fetchStats().then(() => {
      nextTick(() => {
        initCharts()
      })
    })
    // 同时获取币价
    fetchChange()
  }

  // 设置每小时整点定时刷新
  setupHourlyRefresh()

  // WebSocket连接（实时更新币价）
  connectWS()
})

onUnmounted(() => { 
  ws?.close()
  if (hourlyTimer) clearTimeout(hourlyTimer)
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
