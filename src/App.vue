<template>
  <div class="min-h-screen flex flex-col bg-[#0f0f1a]">
    <header class="bg-[#16162a]/95 backdrop-blur-md border-b border-yellow-500/20 sticky top-0 z-50 shadow-lg shadow-yellow-500/5">
      <div class="max-w-[1400px] mx-auto px-3 md:px-4">
        <div class="h-14 flex items-center gap-4">
          <router-link to="/" class="flex items-center gap-3 group flex-shrink-0">
            <img src="/src/assets/bsj.png" class="w-8 h-8 rounded-full ring-2 ring-yellow-500/40 group-hover:ring-yellow-500/80 transition shadow-lg shadow-yellow-500/20" />
            <div class="text-[17px] font-bold text-yellow-400">比特视界</div>
          </router-link>

          <div class="flex-1"></div>

          <a
            href="https://studybtcion.com/"
            target="_blank"
            rel="noopener noreferrer"
            class="hidden md:inline-flex items-center gap-2 px-3 py-1.5 bg-[#0f0f1a]/60 border border-yellow-500/20 rounded-xl hover:border-yellow-500/60 hover:bg-yellow-500/10 transition text-sm font-medium text-yellow-400"
          >
            加密学习
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
            </svg>
          </a>

          <router-link
            to="/about"
            class="hidden md:inline-flex items-center gap-2 px-3 py-1.5 bg-[#0f0f1a]/60 border border-yellow-500/20 rounded-xl hover:border-yellow-500/60 hover:bg-yellow-500/10 transition text-sm font-medium text-yellow-400"
          >
            关于我们
          </router-link>

          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="md:hidden p-2 text-slate-400 hover:text-yellow-400 transition"
          >
            <svg v-if="!mobileMenuOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
            <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div v-show="mobileMenuOpen" class="md:hidden pb-3 border-t border-yellow-500/10">
          <nav class="flex flex-col gap-2 pt-3">
            <router-link
              to="/"
              @click="mobileMenuOpen = false"
              class="px-4 py-3 rounded-xl text-sm transition flex items-center gap-3"
              :class="$route.path === '/' ? 'text-yellow-400 bg-yellow-500/10' : 'text-slate-400 hover:text-yellow-400 hover:bg-yellow-500/5'"
            >
              <span>🏠</span> 首页
            </router-link>
          </nav>
        </div>
      </div>
    </header>

    <main class="flex-1">
      <router-view v-slot="{ Component, route }">
        <keep-alive :include="['Exchange', 'NewsList']">
          <component :is="Component" :key="route.fullPath" />
        </keep-alive>
      </router-view>
    </main>

    <footer class="bg-[#16162a] border-t border-yellow-500/20 mt-auto">
      <div class="max-w-[1400px] mx-auto px-3 md:px-4 py-6">
        <!-- 链接区 -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <div>
            <h3 class="text-xs font-semibold text-slate-300 mb-3">快捷导航</h3>
            <ul class="space-y-2">
              <li><router-link to="/" class="text-xs text-slate-500 hover:text-yellow-400 transition">🏠 首页</router-link></li>
              <li><router-link to="/news" class="text-xs text-slate-500 hover:text-yellow-400 transition">📰 资讯</router-link></li>
              <li><router-link to="/exchange" class="text-xs text-slate-500 hover:text-yellow-400 transition">🏦 交易所</router-link></li>
              <li><router-link to="/about" class="text-xs text-slate-500 hover:text-yellow-400 transition">ℹ️ 关于我们</router-link></li>
            </ul>
          </div>
          <div>
            <h3 class="text-xs font-semibold text-slate-300 mb-3">行情数据</h3>
            <ul class="space-y-2">
              <li><router-link to="/chart/BTC" class="text-xs text-slate-500 hover:text-yellow-400 transition">₿ Bitcoin</router-link></li>
              <li><router-link to="/chart/ETH" class="text-xs text-slate-500 hover:text-yellow-400 transition">Ξ Ethereum</router-link></li>
              <li><router-link to="/chart/SOL" class="text-xs text-slate-500 hover:text-yellow-400 transition">◎ Solana</router-link></li>
              <li><router-link to="/chart/DOGE" class="text-xs text-slate-500 hover:text-yellow-400 transition">Ð Dogecoin</router-link></li>
            </ul>
          </div>
          <div>
            <h3 class="text-xs font-semibold text-slate-300 mb-3">合作平台</h3>
            <ul class="space-y-2">
              <li><a href="https://www.bsmkweb.cc/join?ref=T13Y3O9Y" target="_blank" rel="noopener" class="text-xs text-slate-500 hover:text-yellow-400 transition">📈 币安</a></li>
              <li><a href="https://www.growthhubzz.com/join/1875117" target="_blank" rel="noopener" class="text-xs text-slate-500 hover:text-yellow-400 transition">📊 OKX</a></li>
              <li><a href="https://partner.hdmune.cn/bg/J42ZQX" target="_blank" rel="noopener" class="text-xs text-slate-500 hover:text-yellow-400 transition">📉 Bitget</a></li>
              <li><a href="https://studybtcion.com" target="_blank" rel="noopener" class="text-xs text-slate-500 hover:text-yellow-400 transition">📚 加密学习</a></li>
            </ul>
          </div>
          <div>
            <h3 class="text-xs font-semibold text-slate-300 mb-3">关于我们</h3>
            <ul class="space-y-2">
              <li><router-link to="/about" class="text-xs text-slate-500 hover:text-yellow-400 transition">💬 联系我们</router-link></li>
            </ul>
          </div>
        </div>

        <!-- 分隔线 -->
        <div class="border-t border-yellow-500/10 pt-5">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div class="flex items-center gap-2">
              <img src="/src/assets/bsj.png" class="w-5 h-5 rounded-full" />
              <span class="text-xs text-yellow-500/60">© 2026 比特视界</span>
              <span class="text-xs text-slate-600">|</span>
              <span class="text-xs text-slate-600">加密货币行情、资讯与交易所信息平台</span>
            </div>
            <div class="text-xs text-slate-600">
              数据仅供参考，不构成投资建议
            </div>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const mobileMenuOpen = ref(false)
</script>