import { decodeBlurHash } from './fast-blurhash.js'

const getChromeIconUrl = (pageUrl) => {
  try {
    const url = new URL(chrome.runtime.getURL('/_favicon/'))
    url.searchParams.set('pageUrl', pageUrl)
    url.searchParams.set('size', '32')
    return url.toString()
  } catch {
    return null
  }
}

const getFallbackIconUrl = (pageUrl) => {
  const { hostname } = new URL(pageUrl)
  return `https://icons.duckduckgo.com/ip3/${hostname}.ico`
}

const getFaviconUrl = (pageUrl) => {
  return getChromeIconUrl(pageUrl) || getFallbackIconUrl(pageUrl)
}

const addElm = (parent, tag, text, attributes) => {
  const elm = document.createElement(tag)
  if (text) {
    elm.textContent = text
  }
  if (attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      elm[key] = value
    })
  }
  parent.append(elm)
  return elm
}

const renderNode =
  (root) =>
  async ({ title, children, url: href }) => {
    const li = addElm(root, 'li')

    if (children) {
      addElm(li, 'h3', title)
      const ul = addElm(li, 'ul')
      await Promise.all(children.map(renderNode(ul)))
    } else if (href) {
      const parentUl = li.closest('ul')
      if (parentUl?.id === 'root') {
        parentUl.className = 'flat-bookmark-structure'
      }

      const link = document.createElement('a')
      link.href = href

      const icon = document.createElement('img')
      icon.alt = title.substring(0, 1)
      link.append(icon)

      const text = document.createTextNode(` ${title}`)
      link.append(text)

      li.append(link)

      icon.src = getFaviconUrl(href)
      icon.onerror = () => {
        const fallbackUrl = getFallbackIconUrl(href)
        if (icon.src !== fallbackUrl) {
          icon.src = fallbackUrl
        }
      }
    }
  }

const renderBookmarksBar = async () => {
  const currentBrowser = typeof browser !== 'undefined' ? browser : chrome
  const domRoot = document.querySelector('#root')

  const [rootNode] = await currentBrowser.bookmarks.getTree()

  if (!rootNode?.children) {
    throw new Error('Unable to retrieve bookmarks')
  }

  //
  const bars = rootNode.children.filter(
    (item) =>
      item.folderType === 'bookmarks-bar' || // chrome: find using folderType, there can be more than one (https://developer.chrome.com/blog/bookmarks-sync-changes)
      item.id === 'toolbar_____' // firefox: find using ID
  )

  for (const bar of bars) {
    await Promise.all(bar.children.map(renderNode(domRoot)))
  }
}

const TOGGLE_KEY_NAME = 'hideBookmarksBar'
const isBookmarksBarHidden = () =>
  window.localStorage.getItem(TOGGLE_KEY_NAME) === 'yes'

const renderToggleLink = () => {
  const root = document.querySelector('#root')
  const linkElm = document.querySelector('a#toggle')

  const isHidden = isBookmarksBarHidden()
  linkElm.innerText = isHidden ? 'show' : 'hide'
  root.style.display = isHidden ? 'none' : 'flex'

  linkElm.onclick = () => {
    const wasHidden = isBookmarksBarHidden()
    window.localStorage.setItem(TOGGLE_KEY_NAME, wasHidden ? 'no' : 'yes')
    linkElm.innerText = wasHidden ? 'hide' : 'show'
    root.style.display = wasHidden ? 'flex' : 'none'
    initImage()
  }
}

const IMAGE_KEY_NAME = 'bookmarksBarImage'
const IMAGE_VALID_MS = 15 * 60 * 1000 // 15 minutes

const initImage = async () => {
  if (!isBookmarksBarHidden()) {
    hideImage()
  } else {
    let image = JSON.parse(window.localStorage.getItem(IMAGE_KEY_NAME) || '{}')
    const hasImage =
      image && image.attribution && typeof image.attribution !== 'string'
    if (hasImage && image.created > Date.now() - IMAGE_VALID_MS) {
      showImage(image)
    } else {
      const utmParams =
        '?utm_source=chrome-new-tab-page-bookmarks&utm_medium=referral'

      const response = await fetch(
        `https://unsplash.w2.sk/random-wallpaper.php`
      )
      const data = await response.json()

      const { urls, user, links, blur_hash: blurhash } = data || {}

      const imageUrl = urls?.raw
      const imageLink = `${links?.html}${utmParams}`

      const userFullName = [user?.first_name, user?.last_name]
        .filter(Boolean)
        .join(' ')
      const userLink = `${user?.links?.html}${utmParams}`

      const imageData = {
        url: imageUrl,
        attribution: {
          userLink,
          userFullName,
          imageLink,
        },
        blurhash,
        created: Date.now(),
      }
      window.localStorage.setItem(IMAGE_KEY_NAME, JSON.stringify(imageData))
      showImage(imageData)
    }
  }
}

const hideImage = () => {
  document.querySelector('#bg-image')?.remove()
  document.querySelector('#image-attribution')?.remove()
  document.querySelector('#canvas')?.remove()
}

const showImage = ({ url, attribution, blurhash }) => {
  let canvas = document.querySelector('#canvas')
  if (!canvas) {
    canvas = document.createElement('canvas')
    canvas.id = 'canvas'
    canvas.width = 32
    canvas.height = 32
    document.body.append(canvas)
  }
  const ctx = canvas.getContext('2d')
  const pixels = decodeBlurHash(blurhash, 32, 32)
  const imageData = new ImageData(pixels, 32, 32)
  ctx.putImageData(imageData, 0, 0)

  const imageWidth = window.innerWidth ?? 1920
  const imageHeight = window.innerHeight ?? 1080
  const pixelRatio = window.devicePixelRatio ?? 1
  const resizedImageUrl = `${url}&w=${imageWidth}&h=${imageHeight}&fit=crop&dpr=${pixelRatio}`

  let imageElm = document.querySelector('#bg-image')
  if (!imageElm) {
    imageElm = document.createElement('img')
    imageElm.id = 'bg-image'
    document.body.append(imageElm)
  }
  imageElm.style.backgroundImage = `url('${resizedImageUrl}')`

  const attributionElm = document.createElement('p')
  attributionElm.id = 'image-attribution'
  const userLink = document.createElement('a')
  userLink.href = attribution.userLink
  userLink.textContent = attribution.userFullName
  const imageLink = document.createElement('a')
  imageLink.href = attribution.imageLink
  imageLink.textContent = 'Unsplash'
  attributionElm.append(
    document.createTextNode('Photo by '),
    userLink,
    document.createTextNode(' on '),
    imageLink
  )
  document.body.appendChild(attributionElm)
}

window.addEventListener('load', () => {
  renderBookmarksBar()
  renderToggleLink()
  initImage()
})
