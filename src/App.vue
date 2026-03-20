<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
    <!-- 导航栏 -->
    <header class="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 h-14 flex items-center">
        <router-link to="/" class="flex items-center gap-2 group">
          <img src="/src/assets/logo.jpg" class="w-8 h-8 rounded-full ring-2 ring-orange-500/30 group-hover:ring-orange-500/60 transition" />
          <span class="text-xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">三叔.BTC</span>
        </router-link>
        
        <nav class="flex ml-12 gap-1">
          <router-link to="/" class="px-4 py-3 text-gray-600 hover:text-orange-500 transition relative" :class="{ 'text-orange-500': $route.path === '/' }">
            <span class="relative z-10">行情</span>
            <div v-if="$route.path === '/'" class="absolute bottom-0 left-2 right-2 h-0.5 bg-orange-500 rounded-full"></div>
          </router-link>
          <router-link to="/kline" class="px-4 py-3 text-gray-600 hover:text-orange-500 transition relative" :class="{ 'text-orange-500': $route.path === '/kline' }">
            <span class="relative z-10">K线</span>
            <div v-if="$route.path === '/kline'" class="absolute bottom-0 left-2 right-2 h-0.5 bg-orange-500 rounded-full"></div>
          </router-link>
          <router-link to="/news" class="px-4 py-3 text-gray-600 hover:text-orange-500 transition relative" :class="{ 'text-orange-500': $route.path === '/news' }">
            <span class="relative z-10">快讯</span>
            <div v-if="$route.path === '/news'" class="absolute bottom-0 left-2 right-2 h-0.5 bg-orange-500 rounded-full"></div>
          </router-link>
          <router-link to="/tools" class="px-4 py-3 text-gray-600 hover:text-orange-500 transition relative" :class="{ 'text-orange-500': $route.path === '/tools' }">
            <span class="relative z-10">工具</span>
            <div v-if="$route.path === '/tools'" class="absolute bottom-0 left-2 right-2 h-0.5 bg-orange-500 rounded-full"></div>
          </router-link>
          <router-link to="/topics" class="px-4 py-3 text-gray-600 hover:text-orange-500 transition relative" :class="{ 'text-orange-500': $route.path === '/topics' }">
            <span class="relative z-10">专题</span>
            <div v-if="$route.path === '/topics'" class="absolute bottom-0 left-2 right-2 h-0.5 bg-orange-500 rounded-full"></div>
          </router-link>
        </nav>
        
        <div class="ml-auto flex items-center gap-4">
          <div class="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-50 to-amber-50 rounded-full border border-orange-100">
            <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span class="text-xs text-gray-500">实时同步中</span>
          </div>
          <span class="text-gray-400 text-sm font-mono">{{ currentTime }}</span>
        </div>
      </div>
    </header>

    <!-- 主内容 -->
    <router-view />
    
    <!-- 底部信息 -->
    <footer class="bg-white border-t border-gray-200/50 py-8 mt-auto">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex flex-col items-center">
          <div class="flex items-center gap-2 mb-4">
            <img src="/src/assets/logo.jpg" class="w-6 h-6 rounded-full" />
            <span class="text-sm font-medium text-gray-600">三叔.BTC</span>
          </div>
          
          <div class="flex flex-wrap justify-center gap-x-6 gap-y-2 text-gray-500 text-sm mb-4">
            <a href="#" class="hover:text-orange-500 transition">关于我们</a>
            <a href="#" class="hover:text-orange-500 transition">联系我们</a>
            <a href="#" class="hover:text-orange-500 transition">加入我们</a>
            <a href="#" class="hover:text-orange-500 transition">免责声明</a>
            <a href="#" class="hover:text-orange-500 transition">网站地图</a>
          </div>
          
          <div class="flex gap-4 mb-4">
            <a href="#" class="w-8 h-8 bg-gray-100 hover:bg-orange-100 rounded-full flex items-center justify-center text-gray-400 hover:text-orange-500 transition">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="#" class="w-8 h-8 bg-gray-100 hover:bg-orange-100 rounded-full flex items-center justify-center text-gray-400 hover:text-orange-500 transition">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z"/></svg>
            </a>
            <a href="#" class="w-8 h-8 bg-gray-100 hover:bg-orange-100 rounded-full flex items-center justify-center text-gray-400 hover:text-orange-500 transition">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
          </div>
          
          <div class="text-gray-400 text-xs text-center">
            © 2026 三叔.BTC 专注加密货币行情数据
          </div>
          <div class="text-gray-300 text-xs text-center max-w-2xl mt-2">
            免责声明：本网站所有区块链相关数据与资料仅供用户学习及研究之用，不构成任何投资建议。投资有风险，入市需谨慎。
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const currentTime = ref('')
let timeTimer = null

onMounted(() => {
  currentTime.value = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
  timeTimer = setInterval(() => {
    currentTime.value = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
  }, 1000)
})

onUnmounted(() => { clearInterval(timeTimer) })
</script>
