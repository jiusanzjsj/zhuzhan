<template>
  <div class="max-w-7xl mx-auto px-4 py-6">
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center gap-3">
        <div class="w-1 h-7 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full"></div>
        <h2 class="text-xl font-bold text-gray-800">📊 K线行情</h2>
      </div>
      <div class="flex gap-2">
        <span v-for="tab in timeframes" :key="tab" @click="activeTF = tab" class="px-4 py-2 text-sm font-medium rounded-xl border cursor-pointer transition-all" :class="activeTF === tab ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-transparent shadow-lg shadow-orange-500/25' : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-500'">{{ tab }}</span>
      </div>
    </div>
    
    <div class="flex gap-5">
      <div class="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm h-[550px] flex items-center justify-center">
        <div class="text-center">
          <div class="text-6xl mb-4">📊</div>
          <p class="text-lg text-gray-600 font-medium">K线图表区域</p>
          <p class="text-sm text-gray-400 mt-2">选择币种和时间框架查看K线图</p>
        </div>
      </div>
      
      <aside class="w-64">
        <div class="flex items-center gap-2 mb-4">
          <div class="w-1 h-5 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full"></div>
          <h3 class="font-bold text-gray-800">🔥 热门币种</h3>
        </div>
        <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div v-for="coin in hotCoins" :key="coin.symbol" @click="selectCoin(coin.symbol)" class="flex justify-between items-center px-4 py-3.5 border-b border-gray-50 cursor-pointer hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 transition">
            <span class="font-bold text-gray-800">{{ coin.symbol }}</span>
            <span class="font-mono font-semibold" :class="coin.change >= 0 ? 'text-green-500' : 'text-red-500'">${{ coin.price }}</span>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const activeTF = ref('1H')
const timeframes = ['1分', '5分', '15分', '1小时', '4小时', '1天', '1周', '1月']

const hotCoins = ref([
  { symbol: 'BTC/USDT', price: '70,535', change: 1.39 },
  { symbol: 'ETH/USDT', price: '3,149', change: 3.64 },
  { symbol: 'BNB/USDT', price: '643', change: 1.85 },
  { symbol: 'SOL/USDT', price: '89', change: 1.73 },
  { symbol: 'XRP/USDT', price: '1.45', change: 1.25 },
])

const selectCoin = (symbol) => {
  console.log('Selected:', symbol)
}
</script>
