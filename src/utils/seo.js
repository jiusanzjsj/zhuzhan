export const updatePageSeo = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  siteName = '比特视界'
}) => {
  if (typeof document === 'undefined') return

  if (title) {
    document.title = title
  }

  const updateMetaTag = (name, content, property = false) => {
    if (!content) return
    const attr = property ? 'property' : 'name'
    let el = document.querySelector(`meta[${attr}="${name}"]`)
    if (!el) {
      el = document.createElement('meta')
      el.setAttribute(attr, name)
      document.head.appendChild(el)
    }
    el.setAttribute('content', content)
  }

  const updateCanonical = (href) => {
    if (!href) return
    let el = document.querySelector('link[rel="canonical"]')
    if (!el) {
      el = document.createElement('link')
      el.setAttribute('rel', 'canonical')
      document.head.appendChild(el)
    }
    el.setAttribute('href', href)
  }

  updateMetaTag('description', description)
  updateMetaTag('keywords', keywords)
  updateMetaTag('og:title', title, true)
  updateMetaTag('og:description', description, true)
  updateMetaTag('og:image', image, true)
  updateMetaTag('og:url', url, true)
  updateMetaTag('og:type', type, true)
  updateMetaTag('og:site_name', siteName, true)
  updateMetaTag('twitter:card', 'summary')
  updateMetaTag('twitter:title', title)
  updateMetaTag('twitter:description', description)
  updateMetaTag('twitter:image', image)
  updateCanonical(url)
}
