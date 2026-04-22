<template>
  <div class="min-h-screen bg-[#0f0f1a]">
    <div class="max-w-[900px] mx-auto px-4 py-8">

      <!-- 返回按钮 -->
      <router-link
        to="/"
        class="inline-flex items-center gap-2 mb-8 px-4 py-2 bg-[#16162a] border border-yellow-500/20 rounded-xl hover:border-yellow-500/60 hover:bg-yellow-500/10 transition text-sm text-slate-400 hover:text-yellow-400"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        返回首页
      </router-link>

      <!-- 标题卡片 -->
      <div class="bg-[#16162a] border border-yellow-500/20 rounded-2xl p-8 text-center mb-6">
        <div class="w-16 h-16 mx-auto mb-4 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl flex items-center justify-center">
          <span class="text-3xl">🏠</span>
        </div>
        <h1 class="text-2xl font-bold text-yellow-400 mb-2">比特视界</h1>
        <p class="text-sm text-slate-500">专业加密货币行情与资讯平台</p>
      </div>

      <!-- 联系方式 -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- 微信 -->
        <div class="bg-[#16162a] border border-yellow-500/20 rounded-2xl overflow-hidden">
          <div class="px-5 py-4 border-b border-yellow-500/10 flex items-center gap-3">
            <div class="w-8 h-8 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center justify-center">
              <span class="text-base">💚</span>
            </div>
            <div>
              <div class="text-sm font-semibold text-slate-200">联系我们</div>
              <div class="text-xs text-slate-500">扫码添加微信</div>
            </div>
          </div>
          <div class="p-5 flex items-start gap-4">
            <img
              src="/images/lianxi.png"
              alt="微信二维码"
              class="w-24 rounded-xl flex-shrink-0"
            />
            <div class="text-xs text-slate-500 leading-relaxed pt-1">
              <p class="text-slate-400 font-medium mb-2">WeChat</p>
              <p>扫描二维码添加好友，咨询合作事宜</p>
            </div>
          </div>
        </div>

        <!-- QQ -->
        <div class="bg-[#16162a] border border-yellow-500/20 rounded-2xl overflow-hidden">
          <div class="px-5 py-4 border-b border-yellow-500/10 flex items-center gap-3">
            <div class="w-8 h-8 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-center justify-center">
              <span class="text-base">💬</span>
            </div>
            <div>
              <div class="text-sm font-semibold text-slate-200">加群交流</div>
              <div class="text-xs text-slate-500">扫码加入QQ群</div>
            </div>
          </div>
          <div class="p-5 flex items-start gap-4">
            <img
              src="/images/lianxi2.png"
              alt="QQ二维码"
              class="w-24 rounded-xl flex-shrink-0"
            />
            <div class="text-xs text-slate-500 leading-relaxed pt-1">
              <p class="text-slate-400 font-medium mb-2">QQ Group</p>
              <p>扫描二维码加入群聊，与更多用户交流</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
