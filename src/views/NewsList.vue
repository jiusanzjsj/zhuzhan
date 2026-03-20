<template>
  <div class="max-w-7xl mx-auto px-4 py-6">
    <div class="flex gap-6">
      <!-- Main News -->
      <div class="flex-1">
        <div class="flex items-center gap-3 mb-5">
          <div class="w-1 h-6 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full"></div>
          <h2 class="text-xl font-bold text-gray-800">📰 最新快讯</h2>
        </div>
        
        <div class="flex flex-col gap-4">
          <router-link v-for="item in newsList" :key="item.id" :to="'/news/' + item.id" class="bg-white rounded-2xl border border-gray-100 p-5 hover:border-orange-300 hover:shadow-lg hover:shadow-orange-500/10 transition-all group">
            <div class="flex items-start gap-3 mb-3">
              <span class="px-2.5 py-1 text-xs font-medium rounded-lg" :class="item.tagClass">{{ item.tag }}</span>
              <span class="text-xs text-gray-400 flex items-center gap-1">🕐 {{ item.time }}</span>
            </div>
            <h3 class="font-semibold text-gray-800 mb-2 group-hover:text-orange-600 transition">{{ item.title }}</h3>
            <div class="flex items-center gap-4 text-xs text-gray-400">
              <span class="flex items-center gap-1">👁 {{ item.views }}</span>
              <span class="flex items-center gap-1">💬 {{ item.comments }}</span>
            </div>
          </router-link>
        </div>
      </div>
      
      <!-- Sidebar -->
      <aside class="w-80 flex-shrink-0">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-1 h-5 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full"></div>
          <h3 class="font-bold text-gray-800">🔥 热门快讯</h3>
        </div>
        <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <router-link v-for="(item, i) in hotNews" :key="item.id" :to="'/news/' + item.id" class="flex items-center gap-3 px-5 py-4 border-b border-gray-50 hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 transition group">
            <span class="w-6 h-6 bg-gradient-to-br from-orange-400 to-amber-400 text-white rounded-full text-xs flex items-center justify-center font-bold flex-shrink-0">{{ i+1 }}</span>
            <span class="text-sm text-gray-600 group-hover:text-orange-600 transition">{{ item.title }}</span>
          </router-link>
        </div>
        
        <!-- 关注我们 -->
        <div class="mt-5 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl p-5 text-white text-center">
          <h4 class="font-bold mb-2">关注我们</h4>
          <p class="text-xs text-white/80 mb-3">获取最新加密货币资讯</p>
          <div class="flex justify-center gap-3">
            <span class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 cursor-pointer transition">𝕏</span>
            <span class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 cursor-pointer transition">✈</span>
            <span class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 cursor-pointer transition">📺</span>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const newsList = ref([
  { id: 1, title: '比特币BTC价格突破70000美元，24小时涨跌幅达3.5%', tag: '行情', tagClass: 'bg-red-50 text-red-600 border border-red-100', time: '10分钟前', views: '999+', comments: '88' },
  { id: 2, title: '以太坊ETH市值突破3000亿美元，创历史新高', tag: '行情', tagClass: 'bg-red-50 text-red-600 border border-red-100', time: '30分钟前', views: '888', comments: '66' },
  { id: 3, title: '币安宣布上架新代币引发市场热议', tag: '交易所', tagClass: 'bg-blue-50 text-blue-600 border border-blue-100', time: '1小时前', views: '777', comments: '55' },
  { id: 4, title: 'DeFi锁仓量突破2000亿美元', tag: 'DeFi', tagClass: 'bg-green-50 text-green-600 border border-green-100', time: '2小时前', views: '666', comments: '44' },
  { id: 5, title: '美国SEC再次推迟比特币ETF审批决定', tag: '政策', tagClass: 'bg-yellow-50 text-yellow-600 border border-yellow-100', time: '3小时前', views: '555', comments: '33' },
  { id: 6, title: 'Solana网络升级完成，性能大幅提升', tag: '技术', tagClass: 'bg-purple-50 text-purple-600 border border-purple-100', time: '4小时前', views: '444', comments: '22' },
])

const hotNews = ref([
  { id: 1, title: '比特币突破历史新高' },
  { id: 2, title: '以太坊升级影响分析' },
  { id: 3, title: 'NFT市场最新动态' },
  { id: 4, title: 'DeFi安全事件汇总' },
  { id: 5, title: '新手入门指南' },
])
</script>
