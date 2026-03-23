<template>
  <div class="flex-1 bg-gradient-to-b from-gray-50 to-white">
    <!-- Banner -->
    <div class="h-32 bg-gradient-to-r from-orange-500 via-orange-400 to-amber-400 flex items-center justify-center">
      <div class="text-center">
        <h1 class="text-3xl font-bold text-white mb-2">全球交易所综合排行榜</h1>
        <p class="text-orange-100 text-sm">全球知名加密货币交易所数据一览</p>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="max-w-7xl mx-auto px-4 py-6">
      <!-- 筛选 tabs -->
      <div class="flex items-center gap-4 mb-6">
        <div class="flex bg-white rounded-lg p-1 shadow-sm border border-gray-100">
          <button 
            v-for="tab in tabs" 
            :key="tab.value"
            @click="activeTab = tab.value"
            :class="[
              'px-4 py-2 rounded-md text-sm font-medium transition-all',
              activeTab === tab.value 
                ? 'bg-orange-500 text-white shadow' 
                : 'text-gray-600 hover:text-orange-500'
            ]"
          >
            {{ tab.label }}
          </button>
        </div>
        
        <div class="ml-auto">
          <input 
            v-model="searchKeyword"
            type="text"
            placeholder="搜索交易所..."
            class="w-48 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-500"
          />
        </div>
      </div>

      <!-- 数据表格 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">#</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">交易平台</th>
              <th class="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">ExRank</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">24H额($)</th>
              <th class="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">24H涨跌</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">资产($)</th>
              <th class="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">交易对(个)</th>
              <th class="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">人气指数</th>
              <th class="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">7天成交额走势</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr 
              v-for="(exchange, index) in paginatedExchanges" 
              :key="exchange.id"
              class="hover:bg-orange-50/50 transition"
            >
              <td class="px-4 py-3 text-gray-400 font-mono">{{ index + 1 + (currentPage - 1) * pageSize }}</td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <img :src="exchange.image" :alt="exchange.name" class="w-8 h-8 rounded-lg" />
                  <div>
                    <div class="font-medium text-gray-800">{{ exchange.name }}</div>
                    <div class="text-xs text-gray-400">{{ exchange.country || '-' }}</div>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 text-center">
                <span :class="getScoreClass(exchange.trust_score)" class="px-2 py-1 rounded text-xs font-bold">
                  {{ exchange.trust_score || '-' }}
                </span>
              </td>
              <td class="px-4 py-3 text-right font-mono text-gray-700">${{ formatVolume(exchange.trade_volume_24h_btc) }}</td>
              <td class="px-4 py-3 text-center">
                <span :class="(exchange.trade_volume_change_24h || 0) >= 0 ? 'text-green-500' : 'text-red-500'" class="font-medium">
                  {{ (exchange.trade_volume_change_24h || 0) >= 0 ? '+' : '' }}{{ (exchange.trade_volume_change_24h || 0).toFixed(1) }}%
                </span>
              </td>
              <td class="px-4 py-3 text-right font-mono text-gray-700">${{ formatVolume(exchange.totalAssets || 0) }}</td>
              <td class="px-4 py-3 text-center text-gray-600">{{ exchange.number_of_markets || 0 }}</td>
              <td class="px-4 py-3 text-center text-orange-500 font-medium">#{{ exchange.trust_score_rank || '-' }}</td>
              <td class="px-4 py-3">
                <div class="h-8 flex items-center justify-center">
                  <!-- 简易走势线 -->
                  <svg class="w-28 h-8" viewBox="0 0 100 30">
                    <path 
                      d="M0,25 Q10,20 20,22 T40,15 T60,18 T80,10 T100,5"
                      fill="none"
                      stroke="#f97316"
                      stroke-width="2"
                    />
                    <path 
                      d="M0,25 Q10,20 20,22 T40,15 T60,18 T80,10 T100,5 L100,30 L0,30 Z"
                      fill="url(#orangeGradient)"
                      opacity="0.3"
                    />
                    <defs>
                      <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style="stop-color:#f97316"/>
                        <stop offset="100%" style="stop-color:#fff"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        
        <!-- 分页 -->
        <div class="flex justify-center py-4 border-t border-gray-100">
          <div class="flex gap-2">
            <button 
              v-for="page in totalPages" 
              :key="page"
              @click="currentPage = page"
              :class="[
                'w-10 h-10 rounded-lg text-sm font-medium transition',
                currentPage === page 
                  ? 'bg-orange-500 text-white' 
                  : 'text-gray-600 hover:bg-orange-50'
              ]"
            >
              {{ page }}
            </button>
          </div>
        </div>
      </div>

      <!-- 公告区域 -->
      <div class="mt-8">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">交易所公告</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            v-for="notice in notices" 
            :key="notice.id"
            class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer"
          >
            <div class="flex items-start gap-3">
              <img :src="notice.image" class="w-10 h-10 rounded-lg" />
              <div class="flex-1 min-w-0">
                <h3 class="text-sm font-medium text-gray-700 truncate">{{ notice.title }}</h3>
                <p class="text-xs text-gray-400 mt-1">{{ notice.exchange }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const tabs = [
  { label: '全部', value: 'all' },
  { label: '期货', value: 'future' },
  { label: 'DEX', value: 'dex' },
  { label: 'OTC', value: 'otc' }
]

const activeTab = ref('all')
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = 20

// 模拟交易所数据
const exchanges = ref([
  { id: 'binance', name: 'Binance', image: 'https://assets.coingecko.com/marketples/images/378/small/binance-circle.png', trust_score: 9.8, trade_volume_24h_btc: 125000000000, trade_volume_change_24h: 5.2, number_of_markets: 1439, trust_score_rank: 1, country: '日本', totalAssets: 25000000000 },
  { id: 'okx', name: 'OKX', image: 'https://assets.coingecko.com/marketples/images/96/small/okx.png', trust_score: 9.5, trade_volume_24h_btc: 45000000000, trade_volume_change_24h: 3.1, number_of_markets: 897, trust_score_rank: 2, country: '塞舌尔', totalAssets: 12000000000 },
  { id: 'bybit', name: 'Bybit', image: 'https://assets.coingecko.com/marketples/images/378/small/bybit.png', trust_score: 9.3, trade_volume_24h_btc: 35000000000, trade_volume_change_24h: -2.4, number_of_markets: 756, trust_score_rank: 3, country: '迪拜', totalAssets: 8000000000 },
  { id: 'huobi', name: 'Huobi', image: 'https://assets.coingecko.com/marketples/images/378/small/huobi.png', trust_score: 9.0, trade_volume_24h_btc: 28000000000, trade_volume_change_24h: 1.8, number_of_markets: 687, trust_score_rank: 4, country: '塞舌尔', totalAssets: 6500000000 },
  { id: 'gate', name: 'Gate.io', image: 'https://assets.coingecko.com/marketples/images/378/small/gate.png', trust_score: 8.8, trade_volume_24h_btc: 18000000000, trade_volume_change_24h: -1.2, number_of_markets: 2845, trust_score_rank: 5, country: '开曼群岛', totalAssets: 4500000000 },
  { id: 'kucoin', name: 'KuCoin', image: 'https://assets.coingecko.com/marketples/images/378/small/5.png', trust_score: 8.5, trade_volume_24h_btc: 12000000000, trade_volume_change_24h: 4.5, number_of_markets: 934, trust_score_rank: 6, country: '塞舌尔', totalAssets: 3200000000 },
  { id: 'bitget', name: 'Bitget', image: 'https://assets.coingecko.com/marketples/images/378/small/Bitget-Logo_-_new.png', trust_score: 8.3, trade_volume_24h_btc: 9500000000, trade_volume_change_24h: 6.7, number_of_markets: 567, trust_score_rank: 7, country: '新加坡', totalAssets: 2800000000 },
  { id: 'binance_us', name: 'Binance US', image: 'https://assets.coingecko.com/marketples/images/378/small/ez_4f7d.png', trust_score: 8.0, trade_volume_24h_btc: 7200000000, trade_volume_change_24h: 2.1, number_of_markets: 312, trust_score_rank: 8, country: '美国', totalAssets: 1800000000 },
  { id: 'mexc', name: 'MEXC', image: 'https://assets.coingecko.com/marketples/images/378/small/MEXC.png', trust_score: 7.8, trade_volume_24h_btc: 5800000000, trade_volume_change_24h: -3.5, number_of_markets: 1245, trust_score_rank: 9, country: '塞舌尔', totalAssets: 1500000000 },
  { id: 'crypto_com', name: 'Crypto.com', image: 'https://assets.coingecko.com/marketples/images/378/small/crypto-com.png', trust_score: 7.5, trade_volume_24h_btc: 4200000000, trade_volume_change_24h: 1.2, number_of_markets: 456, trust_score_rank: 10, country: '香港', totalAssets: 1200000000 },
])

// 模拟公告数据
const notices = ref([
  { id: 1, title: '【全网独家首发】Optimistic Minion (OPTIMISTIC) 现已上线WEEX！', exchange: 'WEEX', image: 'https://assets.coingecko.com/marketples/images/378/small/weex.png' },
  { id: 2, title: 'XT关于OVPP合约更换完成的公告', exchange: 'XT', image: 'https://assets.coingecko.com/marketples/images/378/small/XT.png' },
  { id: 3, title: '2026香港Web3嘉年华倒计时：CoinP确认参展', exchange: 'CoinP', image: 'https://assets.coingecko.com/marketples/images/378/small/coinp.png' },
  { id: 4, title: '欧易关于上线 MON (Monad) 现货交易的公告', exchange: 'OKX', image: 'https://assets.coingecko.com/marketples/images/96/small/okx.png' },
  { id: 5, title: '币王移除 DCB 现货交易对公告', exchange: '币王', image: 'https://assets.coingecko.com/marketples/images/378/small/coinw.png' },
  { id: 6, title: 'REUR (Royal Euro) 首发上线', exchange: 'Bitget', image: 'https://assets.coingecko.com/marketples/images/378/small/Bitget-Logo_-_new.png' },
])

// 格式化交易量
const formatVolume = (vol) => {
  if (!vol) return '-'
  if (vol >= 1e9) return (vol / 1e9).toFixed(2) + 'B'
  if (vol >= 1e6) return (vol / 1e6).toFixed(2) + 'M'
  if (vol >= 1e3) return (vol / 1e3).toFixed(2) + 'K'
  return vol.toFixed(2)
}

// 评分颜色
const getScoreClass = (score) => {
  if (!score) return 'bg-gray-100 text-gray-400'
  if (score >= 8) return 'bg-green-500 text-white'
  if (score >= 6) return 'bg-yellow-500 text-white'
  return 'bg-red-500 text-white'
}

// 过滤后数据
const filteredExchanges = computed(() => {
  let result = exchanges.value
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(e => e.name.toLowerCase().includes(keyword))
  }
  
  return result
})

// 分页数据
const paginatedExchanges = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredExchanges.value.slice(start, start + pageSize)
})

// 总页数
const totalPages = computed(() => Math.ceil(filteredExchanges.value.length / pageSize))
</script>
