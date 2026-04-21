<template>
  <div class="max-w-7xl mx-auto px-4 py-6 bg-[#0f0f1a] min-h-screen">
    <div class="flex items-center gap-3 mb-6">
      <div class="w-1 h-7 bg-gradient-to-b from-yellow-500 to-amber-500 rounded-full"></div>
      <h2 class="text-xl font-bold text-slate-200">🛠 常用工具</h2>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div v-for="(tool, i) in tools" :key="tool.name" class="bg-[#16162a] rounded-2xl border border-yellow-500/15 p-6 text-center cursor-pointer hover:border-yellow-500/40 hover:shadow-xl hover:shadow-yellow-500/5 hover:-translate-y-1 transition-all group">
        <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition border border-yellow-500/10">{{ tool.icon }}</div>
        <h3 class="font-bold text-slate-200 mb-1 group-hover:text-yellow-400 transition">{{ tool.name }}</h3>
        <p class="text-xs text-slate-500">{{ tool.desc }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const tools = [
  { name: '区块浏览器', desc: '查询区块链交易记录', icon: '🔗' },
  { name: '汇率转换', desc: '多币种汇率实时换算', icon: '💱' },
  { name: 'Gas费查询', desc: '实时查询网络Gas费用', icon: '⛽' },
  { name: '矿池收益', desc: '计算挖矿收益', icon: '⛏' },
  { name: 'ICO日历', desc: '即将开始的代币销售', icon: '📅' },
  { name: '日历倒计时', desc: '重大事件时间表', icon: '⏰' },
  { name: 'K线工具', desc: '技术分析工具', icon: '📊' },
  { name: '钱包工具', desc: '地址查询与管理', icon: '💳' },
]
</script>