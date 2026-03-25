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
              <span class="stat-change" :class="exchangeInfo.volumeChange >= 0 ? 'up' : 'down'">
                {{ exchangeInfo.volumeChange >= 0 ? '+' : '' }}{{ exchangeInfo.volumeChange }}%
              </span>
            </div>
            <div class="stat-item">
              <span class="stat-label">非小号全球排名</span>
              <span class="stat-value rank">No.{{ exchangeInfo.rank }}</span>
            </div>
            <div class="stat-item">
              <span class="follow-count">{{ exchangeInfo.followCount }} 已关注</span>
              <button class="follow-btn">{{ exchangeInfo.isFollowed ? '已关注' : '关注' }}</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 简介 -->
    <div class="detail-section">
      <p class="exchange-desc">
        {{ exchangeInfo.description }}
        <a href="#" @click.prevent="showFullDesc = !showFullDesc" class="expand-btn">
          {{ showFullDesc ? '收起' : '展开' }}
        </a>
      </p>
      <div class="exchange-links">
        <a :href="exchangeInfo.officialUrl" target="_blank" class="link-btn">查看官网</a>
        <a :href="exchangeInfo.downloadUrl" target="_blank" class="link-btn">下载地址</a>
        <a :href="exchangeInfo.backupUrl" target="_blank" class="link-btn">备用地址</a>
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
      <div class="info-item">
        <span class="info-label">风险准备金</span>
        <span class="info-value">{{ exchangeInfo.reserveFund }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">资产实力</span>
        <span class="info-value">{{ exchangeInfo.assetStrength }}</span>
      </div>
      <div class="info-item full-width">
        <span class="info-label">手续费用</span>
        <a :href="exchangeInfo.feeUrl" target="_blank" class="info-link">去查看</a>
      </div>
    </div>

    <!-- 行情 -->
    <div class="detail-section">
      <h2 class="section-title">{{ exchangeInfo.name }}行情</h2>
      <div class="volume-tabs">
        <button class="tab-btn active">成交额</button>
        <button class="tab-btn">资产披露</button>
      </div>
      <div class="volume-info">
        <span class="volume-label">24H成交额:</span>
        <span class="volume-value">{{ volumeData.volume24h }}</span>
      </div>
      <div class="volume-chart" ref="volumeChartRef"></div>
      <div class="time-range-btns">
        <button class="time-btn active">7天</button>
        <button class="time-btn">30天</button>
        <button class="time-btn">1年</button>
        <button class="time-btn">所有</button>
      </div>
    </div>

    <!-- 交易对列表 -->
    <div class="detail-section">
      <h2 class="section-title">{{ exchangeInfo.name }}交易对</h2>
      <div class="market-type-tabs">
        <button class="tab-btn active">现货</button>
        <button class="tab-btn">期货</button>
      </div>
      <div class="filter-bar">
        <div class="filter-item">
          <span class="filter-label">币种:</span>
          <select v-model="filters.coin" class="filter-select">
            <option value="">全部</option>
          </select>
        </div>
        <div class="filter-item">
          <span class="filter-label">类型:</span>
          <select v-model="filters.type" class="filter-select">
            <option value="cny">人民币</option>
            <option value="usd">美元</option>
          </select>
        </div>
      </div>
      <div class="trading-table-wrapper">
        <table class="trading-table">
          <thead>
            <tr>
              <th>#</th>
              <th>交易对</th>
              <th>最新价(¥)</th>
              <th>平台价</th>
              <th>24H成交量</th>
              <th>24H成交额(¥)</th>
              <th>占比</th>
              <th>更新时间</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="tradingPairs.length === 0">
              <td colspan="8" class="no-data">暂无数据</td>
            </tr>
            <tr v-for="(pair, index) in tradingPairs" :key="pair.symbol">
              <td>{{ index + 1 }}</td>
              <td class="pair-name">
                <img :src="pair.coinIcon" :alt="pair.coin" class="coin-icon" />
                <span>{{ pair.symbol }}</span>
              </td>
              <td>{{ pair.price }}</td>
              <td>{{ pair.platformPrice }}</td>
              <td>{{ pair.volume24h }}</td>
              <td>{{ pair.volume24hCny }}</td>
              <td :class="Number(pair.percent) >= 0 ? 'price-up' : 'price-down'">{{ pair.percent }}%</td>
              <td>{{ pair.updateTime }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <a href="#" @click.prevent="goToFullMarket" class="view-more">查看全部</a>
    </div>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

// 翻译函数（使用 MyMemory API）
const translateToZh = async (text) => {
  if (!text || text.length === 0) return '暂无描述'
  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|zh`
    )
    const data = await res.json()
    return data.responseData?.translatedText || text
  } catch (err) {
    console.error('翻译失败:', err)
    return text
  }
}

const API_KEY = 'CG-42Ty4UXdyANMSugcsqZSEU7Y'

const router = useRouter()
const route = useRoute()

const loading = ref(true)
const error = ref(null)
const showFullDesc = ref(false)
const volumeChartRef = ref(null)

// 交易所信息
const exchangeInfo = reactive({
  name: '',
  logo: '',
  volume24h: '-',
  volumeChange: 0,
  rank: '-',
  followCount: 0,
  isFollowed: false,
  description: '暂无描述',
  officialUrl: '#',
  downloadUrl: '#',
  backupUrl: '#',
  twitter: '',
  facebook: '',
  telegram: '',
  kyc: false,
  region: '-',
  tradingPairs: '-',
  apiEnabled: false,
  reserveFund: '-',
  assetStrength: '-',
  feeUrl: '#'
})

// 成交额数据
const volumeData = reactive({
  volume24h: '-'
})

// 筛选条件
const filters = reactive({
  coin: '',
  type: 'usd'
})

// 交易对列表
const tradingPairs = ref([])

// 加载交易所详情
const fetchExchangeDetail = async (exchangeId) => {
  try {
    loading.value = true
    error.value = null

    // 获取交易所详情
    const detailRes = await fetch(
      `https://api.coingecko.com/api/v3/exchanges/${exchangeId}`,
      {
        headers: {
          'Accept': 'application/json',
          'x-cg-demo-api-key': API_KEY
        }
      }
    )

    if (!detailRes.ok) {
      throw new Error(`获取交易所详情失败: ${detailRes.status}`)
    }

    const detail = await detailRes.json()

    // 填充交易所信息
    exchangeInfo.name = detail.name || '未知交易所'
    exchangeInfo.logo = detail.image || ''
    exchangeInfo.rank = detail.trust_score_rank || '-'
    exchangeInfo.followCount = detail.followers || 0
    
    // 翻译描述为中文
    if (detail.description && detail.description.length > 0) {
      exchangeInfo.description = await translateToZh(detail.description)
    } else {
      exchangeInfo.description = '暂无描述'
    }
    
    exchangeInfo.officialUrl = detail.url || '#'
    exchangeInfo.twitter = detail.twitter_screen_name 
      ? `https://twitter.com/${detail.twitter_screen_name}` 
      : ''
    exchangeInfo.telegram = detail.telegram_screen_name 
      ? `https://t.me/${detail.telegram_screen_name}` 
      : ''
    exchangeInfo.region = detail.country || '-'
    exchangeInfo.tradingPairs = detail.number_of_markets || '-'
    exchangeInfo.apiEnabled = detail.has_trading_incentive || false
    exchangeInfo.kyc = detail.kyc_level ? true : false

    // 格式化24h成交额
    if (detail.trade_volume_24h_btc) {
      const btcPriceRes = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd`,
        { headers: { 'x-cg-demo-api-key': API_KEY } }
      )
      const btcPriceData = await btcPriceRes.json()
      const btcPrice = btcPriceData.bitcoin?.usd || 50000
      const volumeUsd = detail.trade_volume_24h_btc * btcPrice
      exchangeInfo.volume24h = '$' + formatLargeNumber(volumeUsd)
      volumeData.volume24h = '$' + formatLargeNumber(volumeUsd)
    }

  } catch (err) {
    console.error('获取交易所详情失败:', err)
    error.value = err.message
  }
}

// 加载交易对列表
const fetchTradingPairs = async (exchangeId) => {
  try {
    // 获取交易对（使用markets接口）
    const marketsRes = await fetch(
      `https://api.coingecko.com/api/v3/exchanges/${exchangeId}/markets?per_page=50&page=1&sparkline=false`,
      {
        headers: {
          'Accept': 'application/json',
          'x-cg-demo-api-key': API_KEY
        }
      }
    )

    if (!marketsRes.ok) {
      throw new Error(`获取交易对失败: ${marketsRes.status}`)
    }

    const markets = await marketsRes.json()

    tradingPairs.value = markets.slice(0, 20).map((m, idx) => ({
      symbol: m.symbol?.toUpperCase() || '-',
      coinIcon: m.image || '',
      price: m.current_price ? `$${m.current_price.toLocaleString()}` : '-',
      platformPrice: m.current_price ? `$${m.current_price.toLocaleString()}` : '-',
      volume24h: m.total_volume ? formatLargeNumber(m.total_volume) : '-',
      volume24hCny: m.total_volume ? `¥${formatLargeNumber(m.total_volume * 7.2)}` : '-',
      percent: m.price_change_percentage_24h 
        ? m.price_change_percentage_24h.toFixed(2) 
        : '0.00',
      updateTime: new Date().toLocaleTimeString()
    }))

  } catch (err) {
    console.error('获取交易对失败:', err)
  }
}

// 格式化大数字
const formatLargeNumber = (num) => {
  if (!num) return '-'
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B'
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M'
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K'
  return num.toFixed(2)
}

// 页面加载时获取数据
onMounted(async () => {
  const exchangeId = route.params.id
  if (exchangeId) {
    await Promise.all([
      fetchExchangeDetail(exchangeId),
      fetchTradingPairs(exchangeId)
    ])
    loading.value = false
  }
})

// 监听路由变化
watch(() => route.params.id, async (newId) => {
  if (newId) {
    loading.value = true
    await Promise.all([
      fetchExchangeDetail(newId),
      fetchTradingPairs(newId)
    ])
    loading.value = false
  }
})

// 跳转完整行情页
const goToFullMarket = () => {
  router.push(`/exchange/${route.params.id}/market.html?marketType=0`)
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

.stat-change {
  font-size: 14px;
  font-weight: 500;
}

.stat-change.up {
  color: #0ecb81;
}

.stat-change.down {
  color: #f6465d;
}

.follow-count {
  font-size: 14px;
  color: #8a919e;
}

.follow-btn {
  margin-top: 4px;
  padding: 6px 16px;
  border-radius: 6px;
  border: 1px solid #f0b90b;
  background: transparent;
  color: #f0b90b;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.follow-btn:hover {
  background: #f0b90b;
  color: #000;
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

.expand-btn {
  color: #3b82f6;
  text-decoration: none;
  margin-left: 8px;
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

.info-item.full-width {
  grid-column: span 2;
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

.info-link {
  font-size: 14px;
  color: #3b82f6;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.volume-tabs,
.market-type-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.tab-btn {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  background: #1e222d;
  color: #8a919e;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.tab-btn.active {
  background: #f0b90b;
  color: #000;
}

.volume-info {
  margin-bottom: 16px;
}

.volume-label {
  font-size: 14px;
  color: #8a919e;
  margin-right: 8px;
}

.volume-value {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
}

.volume-chart {
  height: 200px;
  background: #1e222d;
  border-radius: 8px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8a919e;
  font-size: 14px;
}

.time-range-btns {
  display: flex;
  gap: 8px;
}

.time-btn {
  padding: 6px 12px;
  border-radius: 4px;
  border: 1px solid #2a2e39;
  background: transparent;
  color: #8a919e;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.time-btn.active {
  border-color: #f0b90b;
  color: #f0b90b;
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

.view-more {
  display: block;
  text-align: center;
  margin-top: 16px;
  padding: 10px;
  border-radius: 6px;
  background: #1e222d;
  color: #3b82f6;
  text-decoration: none;
  font-size: 14px;
  transition: background 0.2s;
}

.view-more:hover {
  background: #2a2e39;
}

.price-up {
  color: #0ecb81;
}

.price-down {
  color: #f6465d;
}
</style>
