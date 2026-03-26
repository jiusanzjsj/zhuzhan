import { ref } from 'vue'

// 共享的新闻数据存储
const articles = ref([])

export function useNewsStore() {
  return {
    articles,
    setArticles: (data) => {
      articles.value = data
    },
    getArticleById: (id) => {
      return articles.value.find(item => item.id === Number(id))
    }
  }
}
