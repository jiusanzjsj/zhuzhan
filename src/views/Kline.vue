<template>
  <div class="max-w-7xl mx-auto px-4 py-6 bg-[#0f0f1a] min-h-screen">
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center gap-3">
        <div class="w-1 h-7 bg-gradient-to-b from-yellow-500 to-amber-500 rounded-full"></div>
        <h2 class="text-xl font-bold text-slate-200">📊 K线行情</h2>
      </div>
    </div>

    <div class="flex gap-5">
      <aside class="w-full">
        <div class="flex items-center gap-2 mb-4">
          <div class="w-1 h-5 bg-gradient-to-b from-yellow-500 to-amber-500 rounded-full"></div>
          <h3 class="font-bold text-slate-300">🔥 热门币种</h3>
        </div>
        <div class="bg-[#16162a] rounded-2xl border border-yellow-500/15 overflow-hidden">
          <div v-for="coin in hotCoins" :key="coin.symbol" @click="selectCoin(coin.symbol)" class="flex justify-between items-center px-4 py-3.5 border-b border-yellow-500/10 cursor-pointer hover:bg-yellow-500/5 transition">
            <span class="font-bold text-slate-200">{{ coin.symbol }}</span>
            <span class="font-mono font-semibold" :class="coin.change >= 0 ? 'text-green-400' : 'text-red-400'">${{ coin.price }}</span>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const hotCoins = ref([
  { symbol: 'BTC/USDT', price: '70,535', change: 1.39 },
  { symbol: 'ETH/USDT', price: '3,149', change: 3.64 },
  { symbol: 'BNB/USDT', price: '643', change: 1.85 },
  { symbol: 'SOL/USDT', price: '89', change: 1.73 },
  { symbol: 'XRP/USDT', price: '1.45', change: 1.25 },
])

const selectCoin = (symbol) => {
  const base = symbol.split('/')[0] // 'BTC/USDT' → 'BTC'
  router.push(`/chart/${base}`)
}
</script>