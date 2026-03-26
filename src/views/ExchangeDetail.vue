<template>
  <div class="exchange-detail">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>正在加载交易所数据...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state">
      <p>加载失败: {{ error }}</p>
      <button @click="$router.back()" class="retry-btn">返回</button>
    </div>

    <!-- 交易所详情 -->
    <template v-else>
    <!-- 顶部概览 -->
    <div class="detail-header">
      <div class="header-left">
        <img :src="exchangeInfo.logo" :alt="exchangeInfo.name" class="exchange-logo" />
        <div class="header-info">
          <h1>{{ exchangeInfo.name }}</h1>
          <div class="header-stats">
            <div class="stat-item">
              <span class="stat-label">24h成交额</span>
              <span class="stat-value">{{ exchangeInfo.volume24h }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">非小号全球排名</span>
              <span class="stat-value rank">No.{{ exchangeInfo.rank }}</span>
            </div>
            <div class="stat-item">
              <span class="follow-count">{{ exchangeInfo.followers || 0 }} 已关注</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 简介 -->
    <div class="detail-section">
      <p class="exchange-desc">
        {{ exchangeInfo.description || '暂无描述' }}
      </p>
      <div class="exchange-links">
        <a :href="exchangeInfo.officialUrl" target="_blank" class="link-btn">查看官网</a>
      </div>
      <div class="social-links">
        <a v-if="exchangeInfo.twitter" :href="exchangeInfo.twitter" target="_blank" class="social-link" title="Twitter">
          <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        </a>
        <a v-if="exchangeInfo.telegram" :href="exchangeInfo.telegram" target="_blank" class="social-link" title="Telegram">
          <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
          </svg>
        </a>
      </div>
    </div>

    <!-- 基本信息 -->
    <div class="detail-section info-grid">
      <div class="info-item">
        <span class="info-label">KYC认证</span>
        <span class="info-value">{{ exchangeInfo.kyc ? '是' : '否' }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">注册地区</span>
        <span class="info-value">{{ exchangeInfo.region }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">交易对数量</span>
        <span class="info-value">{{ exchangeInfo.tradingPairs }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">量化接口</span>
        <span class="info-value">{{ exchangeInfo.apiEnabled ? '是' : '否' }}</span>
      </div>
    </div>

    <!-- 交易对列表 -->
    <div class="detail-section">
      <h2 class="section-title">{{ exchangeInfo.name }}交易对</h2>
      <div class="filter-bar">
        <div class="filter-item">
          <span class="filter-label">类型:</span>
          <select v-model="filters.type" class="filter-select">
            <option value="usd">美元</option>
            <option value="cny">人民币</option>
          </select>
        </div>
      </div>
      
      <!-- 加载交易对 -->
      <div v-if="pairsLoading" class="loading-pairs">
        <div class="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
      
      <div v-else class="trading-table-wrapper">
        <table class="trading-table">
          <thead>
            <tr>
              <th>#</th>
              <th>交易对</th>
              <th>最新价</th>
              <th>24H成交量</th>
              <th>24H成交额</th>
              <th>24H涨跌</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="tradingPairs.length === 0">
              <td colspan="6" class="no-data">暂无数据</td>
            </tr>
            <tr v-for="(pair, index) in tradingPairs" :key="pair.symbol">
              <td>{{ index + 1 }}</td>
              <td class="pair-name">
                <img :src="pair.coinIcon" :alt="pair.coin" class="coin-icon" />
                <span>{{ pair.symbol }}</span>
              </td>
              <td>{{ pair.price }}</td>
              <td>{{ pair.volume24h }}</td>
              <td>{{ filters.type === 'cny' ? pair.volume24hCny : '$' + pair.volume24h }}</td>
              <td :class="Number(pair.percent) >= 0 ? 'price-up' : 'price-down'">{{ pair.percent }}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { fetchExchangeDetail, fetchTradingPairs, translateToZh, getNavigationExchange } from '../store/exchange'

const router = useRouter()
const route = useRoute()

const loading = ref(true)
const error = ref(null)
const pairsLoading = ref(true)

const exchangeInfo = reactive({
  name: '',
  logo: '',
  rank: '-',
  followers: 0,
  description: '',
  officialUrl: '#',
  twitter: '',
  telegram: '',
  region: '-',
  tradingPairs: '-',
  apiEnabled: false,
  kyc: false,
  volume24h: '-'
})

const filters = reactive({
  type: 'usd'
})

const tradingPairs = ref([])

// 加载数据（确保至少能显示部分内容）
const loadExchangeData = async (exchangeId) => {
  loading.value = true
  error.value = null
  pairsLoading.value = true

  // 1. 先尝试从导航状态快速显示（列表页传递的数据）
  const navExchange = getNavigationExchange()
  if (navExchange) {
    exchangeInfo.name = navExchange.name || '加载中...'
    exchangeInfo.logo = navExchange.image || ''
    exchangeInfo.rank = navExchange.trust_score_rank || '-'
    exchangeInfo.tradingPairs = navExchange.number_of_markets || '-'
    exchangeInfo.volume24h = '$' + formatVolume(navExchange.trade_volume_24h_btc)
  }

  try {
    // 2. 并行加载详情和交易对（使用Settled确保一个失败不影响另一个）
    const results = await Promise.allSettled([
      fetchExchangeDetail(exchangeId),
      fetchTradingPairs(exchangeId)
    ])

    // 处理详情结果
    if (results[0].status === 'fulfilled') {
      const detail = results[0].value
      Object.assign(exchangeInfo, detail)
      
      // 翻译描述（非阻塞）
      if (detail.description) {
        translateToZh(detail.description).then(zh => {
          exchangeInfo.description = zh
        }).catch(() => {
          // 翻译失败用原文
        })
      }
    } else {
      console.warn('详情加载失败:', results[0].reason)
      if (!exchangeInfo.name) {
        error.value = '无法加载交易所详情'
      }
    }

    // 处理交易对结果
    if (results[1].status === 'fulfilled') {
      tradingPairs.value = results[1].value
    } else {
      console.warn('交易对加载失败:', results[1].reason)
    }

  } catch (err) {
    console.error('加载交易所数据失败:', err)
    error.value = '数据加载失败，请检查网络'
  } finally {
    loading.value = false
    pairsLoading.value = false
  }
}

onMounted(() => {
  const exchangeId = route.params.id
  if (exchangeId) {
    loadExchangeData(exchangeId)
  } else {
    error.value = '缺少交易所ID'
    loading.value = false
  }
})

watch(() => route.params.id, (newId) => {
  if (newId) {
    loadExchangeData(newId)
  }
})

// 格式化交易量
const formatVolume = (vol) => {
  if (!vol) return '-'
  if (vol >= 1e9) return (vol / 1e9).toFixed(2) + 'B'
  if (vol >= 1e6) return (vol / 1e6).toFixed(2) + 'M'
  if (vol >= 1e3) return (vol / 1e3).toFixed(2) + 'K'
  return vol.toFixed(2)
}
</script>

<style scoped>
.exchange-detail {
  padding: 20px;
  background: #0a0e17;
  min-height: 100vh;
  color: #fff;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 16px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #2a2e39;
  border-top-color: #f0b90b;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state {
  color: #f6465d;
}

.retry-btn {
  padding: 8px 20px;
  border-radius: 6px;
  background: #f0b90b;
  color: #000;
  border: none;
  cursor: pointer;
}

.detail-header {
  background: linear-gradient(135deg, #1a1f35 0%, #0d1117 100%);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 16px;
}

.header-left {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.exchange-logo {
  width: 80px;
  height: 80px;
  border-radius: 16px;
  background: #fff;
}

.header-info h1 {
  margin: 0 0 16px 0;
  font-size: 24px;
  font-weight: 600;
}

.header-stats {
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: #8a919e;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
}

.stat-value.rank {
  color: #f0b90b;
}

.follow-count {
  font-size: 14px;
  color: #8a919e;
}

.detail-section {
  background: #131722;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: #fff;
}

.exchange-desc {
  font-size: 14px;
  color: #8a919e;
  line-height: 1.8;
  margin-bottom: 16px;
}

.exchange-links {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.link-btn {
  padding: 8px 20px;
  border-radius: 6px;
  background: #f0b90b;
  color: #000;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: opacity 0.2s;
}

.link-btn:hover {
  opacity: 0.8;
}

.social-links {
  display: flex;
  gap: 12px;
}

.social-link svg {
  width: 28px;
  height: 28px;
  color: #8a919e;
  transition: color 0.2s;
}

.social-link:hover svg {
  color: #f0b90b;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-label {
  font-size: 12px;
  color: #8a919e;
}

.info-value {
  font-size: 16px;
  font-weight: 500;
  color: #fff;
}

.loading-pairs {
  display: flex;
  justify-content: center;
  padding: 40px;
}

.filter-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  font-size: 14px;
  color: #8a919e;
}

.filter-select {
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #2a2e39;
  background: #1e222d;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
}

.trading-table-wrapper {
  overflow-x: auto;
}

.trading-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.trading-table th {
  text-align: left;
  padding: 12px 8px;
  color: #8a919e;
  font-weight: 500;
  border-bottom: 1px solid #2a2e39;
}

.trading-table td {
  padding: 12px 8px;
  border-bottom: 1px solid #1e222d;
}

.trading-table tbody tr:hover {
  background: #1e222d;
}

.no-data {
  text-align: center;
  color: #8a919e;
  padding: 40px 0 !important;
}

.pair-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.coin-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
}

.price-up {
  color: #0ecb81;
}

.price-down {
  color: #f6465d;
}
</style>
