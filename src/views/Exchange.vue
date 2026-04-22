<template>
  <div class="min-h-screen bg-[#0f0f1a]">
    <!-- 海报图 -->
    <div class="max-w-6xl mx-auto px-4 py-4">
      <img src="@/assets/banner.png" alt="交易所榜单" class="w-full h-auto object-cover rounded-xl shadow-lg" />
    </div>

    <!-- 内容区域 -->
    <div class="max-w-6xl mx-auto px-4 py-6">
      <!-- 交易所列表 -->
      <div class="bg-[#16162a] rounded-xl border border-yellow-500/20 divide-y divide-yellow-500/10">
        <div
          v-for="(exchange, index) in exchanges"
          :key="exchange.id"
          class="px-4 py-4 hover:bg-yellow-500/5 transition cursor-pointer group"
          @click="navigateToDetail(exchange)"
        >
          <!-- 移动端 -->
          <div class="sm:hidden flex items-center gap-3">
            <img :src="exchange.image" :alt="exchange.name" class="w-8 h-8 rounded-full object-cover flex-shrink-0" @error="$event.target.style.display='none'" />
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-slate-200 group-hover:text-yellow-400 transition">
                {{ exchange.name }}
              </div>
              <div class="text-xs text-slate-500 mt-0.5">{{ exchange.desc }}</div>
            </div>
            <svg class="w-4 h-4 text-slate-500 group-hover:text-yellow-400 transition flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </div>

          <!-- 桌面端 -->
          <div class="hidden sm:flex items-center mt-3">
            <div class="w-12 flex items-center justify-center">
              <img :src="exchange.image" :alt="exchange.name" class="w-8 h-8 rounded-full object-cover" @error="$event.target.style.display='none'" />
            </div>
            <div class="flex-1">
              <div class="font-semibold text-slate-200 group-hover:text-yellow-400 transition text-base">{{ exchange.name }}</div>
              <div class="text-sm text-slate-500 mt-0.5">{{ exchange.desc }}</div>
            </div>
            <svg class="w-5 h-5 text-slate-500 group-hover:text-yellow-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const exchanges = ref([
  { id: 'binance', name: '币安', desc: '全球最大加密货币交易所', image: '/images/exchanges/binance.jpg' },
  { id: 'okx', name: 'OKX', desc: '全球领先的数字资产交易所', image: '/images/exchanges/okx.png', apiId: 'okex' },
  { id: 'bybit', name: 'Bybit', desc: '专业加密合约及现货交易所', image: '/images/exchanges/bybit.jpg', apiId: 'bybit-spot' },
  { id: 'gate', name: 'Gate.io', desc: '老牌加密货币交易所', image: '/images/exchanges/gate.png' },
  { id: 'bitget', name: 'Bitget', desc: '合约跟单领先的交易所', image: '/images/exchanges/bitget.png' },
  { id: 'htx', name: 'HTX', desc: '全球知名的数字资产交易平台', image: '/images/exchanges/htx.png', apiId: 'huobi' }
])

const navigateToDetail = (exchange) => {
  const preview = btoa(encodeURIComponent(JSON.stringify({
    name: exchange.name || '',
    image: '',
    trust_score_rank: '-',
    number_of_markets: '-',
    trade_volume_24h_btc: 0
  })))
  router.push({
    name: 'ExchangeDetail',
    params: { id: exchange.apiId || exchange.id },
    query: { p: preview }
  })
}
</script>