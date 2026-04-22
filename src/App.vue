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
          <component :is="Component" :key="route.name" />
        </keep-alive>
      </router-view>
    </main>

    <footer class="bg-[#16162a] border-t border-yellow-500/20 py-5 mt-auto">
      <div class="max-w-[1400px] mx-auto px-3 md:px-4">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs text-slate-500">
          <div class="flex items-center gap-2">
            <img src="/src/assets/bsj.png" class="w-5 h-5 rounded-full" />
            <span class="text-yellow-500/60">© 2026 比特视界</span>
          </div>
          <div class="text-slate-500">加密货币行情、快讯与交易所信息平台</div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const mobileMenuOpen = ref(false)
</script>