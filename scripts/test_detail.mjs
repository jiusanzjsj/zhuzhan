// Save raw HTML to file

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
import { writeFile } from 'node:fs/promises'

async function testDetail(id) {
  const url = `https://chainthink.cn/zh-CN/article/${id}`
  console.log('Fetching:', url)
  
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT }
  })
  const html = await res.text()
  
  await writeFile('E:/zhuzhan/debug_detail.html', html, 'utf8')
  console.log('Saved to debug_detail.html, length:', html.length)
  
  // Look for key patterns
  const patterns = [
    'coverImage',
    '"text"',
    '__NEXT_DATA__',
    'articleData',
    'pageProps',
    'initial'
  ]
  
  for (const p of patterns) {
    const idx = html.indexOf(p)
    console.log(`Pattern "${p}": ${idx >= 0 ? 'FOUND at ' + idx : 'NOT FOUND'}`)
  }
}

testDetail('125306399776149504')