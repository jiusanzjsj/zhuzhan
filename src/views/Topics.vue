<template>
  <div class="max-w-7xl mx-auto px-4 py-6 bg-[#0f0f1a] min-h-screen">
    <div class="flex items-center gap-3 mb-6">
      <div class="w-1 h-7 bg-gradient-to-b from-yellow-500 to-amber-500 rounded-full"></div>
      <h2 class="text-xl font-bold text-slate-200">📚 热门专题</h2>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div v-for="topic in topics" :key="topic.name" class="bg-[#16162a] rounded-2xl border border-yellow-500/15 overflow-hidden cursor-pointer hover:border-yellow-500/40 hover:shadow-xl hover:shadow-yellow-500/5 hover:-translate-y-1 transition-all group">
        <div class="h-24 flex items-center justify-center" :style="{ background: topic.color }">
          <span class="text-5xl filter drop-shadow-lg">{{ topic.icon }}</span>
        </div>
        <div class="p-5">
          <h3 class="font-bold text-lg text-slate-200 mb-1 group-hover:text-yellow-400 transition">{{ topic.name }}</h3>
          <p class="text-sm text-slate-500 mb-3">{{ topic.desc }}</p>
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-600">{{ topic.count }} 篇文章</span>
            <span class="text-xs text-yellow-500 font-medium">查看全部 →</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const topics = [
  { name: '比特币入门', desc: '从零开始了解BTC', icon: '₿', color: 'linear-gradient(135deg, #F7931A, #ffb84d)', count: 50 },
  { name: '以太坊生态', desc: 'ETH及Layer2生态', icon: 'Ξ', color: 'linear-gradient(135deg, #627EEA, #8c9eff)', count: 120 },
  { name: 'DeFi教程', desc: '去中心化金融入门', icon: '📈', color: 'linear-gradient(135deg, #22c55e, #4ade80)', count: 80 },
  { name: 'NFT完全指南', desc: '数字收藏品全解', icon: '🖼', color: 'linear-gradient(135deg, #9333ea, #c084fc)', count: 60 },
  { name: '合约交易', desc: '期货合约教学', icon: '📊', color: 'linear-gradient(135deg, #ef4444, #f87171)', count: 40 },
  { name: '项目测评', desc: '热门项目深度分析', icon: '🔍', color: 'linear-gradient(135deg, #3b82f6, #60a5fa)', count: 90 },
]
</script>