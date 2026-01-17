import { decodeBlurHash } from './fast-blurhash.js'

const isFirefox = typeof browser !== 'undefined'

export const DEFAULT_ICON_SVG = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="gray" viewBox="0 0 16 16"><path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m7.5-6.923c-.67.204-1.335.82-1.887 1.855A8 8 0 0 0 5.145 4H7.5zM4.09 4a9.3 9.3 0 0 1 .64-1.539 7 7 0 0 1 .597-.933A7.03 7.03 0 0 0 2.255 4zm-.582 3.5c.03-.877.138-1.718.312-2.5H1.674a7 7 0 0 0-.656 2.5zM4.847 5a12.5 12.5 0 0 0-.338 2.5H7.5V5zM8.5 5v2.5h2.99a12.5 12.5 0 0 0-.337-2.5zM4.51 8.5a12.5 12.5 0 0 0 .337 2.5H7.5V8.5zm3.99 0V11h2.653c.187-.765.306-1.608.338-2.5zM5.145 12q.208.58.468 1.068c.552 1.035 1.218 1.65 1.887 1.855V12zm.182 2.472a7 7 0 0 1-.597-.933A9.3 9.3 0 0 1 4.09 12H2.255a7 7 0 0 0 3.072 2.472M3.82 11a13.7 13.7 0 0 1-.312-2.5h-2.49c.062.89.291 1.733.656 2.5zm6.853 3.472A7 7 0 0 0 13.745 12H11.91a9.3 9.3 0 0 1-.64 1.539 7 7 0 0 1-.597.933M8.5 12v2.923c.67-.204 1.335-.82 1.887-1.855q.26-.487.468-1.068zm3.68-1h2.146c.365-.767.594-1.61.656-2.5h-2.49a13.7 13.7 0 0 1-.312 2.5m2.802-3.5a7 7 0 0 0-.656-2.5H12.18c.174.782.282 1.623.312 2.5zM11.27 2.461c.247.464.462.98.64 1.539h1.835a7 7 0 0 0-3.072-2.472c.218.284.418.598.597.933M10.855 4a8 8 0 0 0-.468-1.068C9.835 1.897 9.17 1.282 8.5 1.077V4z"/></svg>'
)}`

const getFavicon = (pageUrl) => {
  if (isFirefox) {
    const { hostname } = new URL(pageUrl)
    return `https://icons.duckduckgo.com/ip3/${hostname}.ico`
  }
  const url = new URL(chrome.runtime.getURL('/_favicon/'))
  url.searchParams.set('pageUrl', pageUrl)
  url.searchParams.set('size', '32')
  return url.toString()
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

      icon.src = getFavicon(href)
      icon.onerror = () => {
        icon.src = DEFAULT_ICON_SVG
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
