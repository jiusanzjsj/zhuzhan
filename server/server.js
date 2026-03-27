import express from 'express'
import cors from 'cors'

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

// ========== 恐慌指数 API (使用 alternative.me) ==========
app.get('/api/fear-index', async (req, res) => {
  try {
    // 由于 CoinMarketCap 和币安都没有官方恐慌指数API
    // 使用 alternative.me (最稳定的免费API)
    const response = await fetch('https://api.alternative.me/fng/')
    const data = await response.json()
    
    if (data.data && data.data[0]) {
      res.json({
        source: 'alternative.me',
        value: parseInt(data.data[0].value),
        sentiment: data.data[0].value_classification,
        timestamp: Date.now()
      })
    } else {
      res.json({ source: 'alternative.me', value: null, sentiment: 'Unavailable' })
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ========== 启动服务 ==========
app.listen(PORT, () => {
  console.log(`API服务已启动: http://localhost:${PORT}`)
  console.log(`恐慌指数: http://localhost:${PORT}/api/fear-index`)
})