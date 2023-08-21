import { decodeBlurHash } from './fast-blurhash.js'

const iconUrl = (href) => {
  const { origin } = new URL(href)
  return `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${origin}&size=32`
}

const addElm = (parent, tag, content, attributes) => {
  const elm = document.createElement(tag)
  if (content) {
    elm.innerHTML = content
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
  ({ title, children, url: href }) => {
    const li = addElm(root, 'li')

    if (children) {
      addElm(li, 'h3', title)
      const ul = addElm(li, 'ul')
      children.forEach(renderNode(ul))
    } else if (href) {
      const icon = `<img src="${iconUrl(href)}" alt="${title.substring(
        0,
        1
      )}" />`

      addElm(li, 'a', `${icon} ${title}`, { href })
    }
  }

const renderBookmarksBar = (bookmarksBarId) => {
  chrome.bookmarks.getSubTree(bookmarksBarId, function ([rootNode]) {
    const root = document.querySelector('#root')
    rootNode.children.forEach(renderNode(root))
  })
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
    const image = JSON.parse(
      window.localStorage.getItem(IMAGE_KEY_NAME) || '{}'
    )
    if (image && image.created > Date.now() - IMAGE_VALID_MS) {
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

      const attribution = `Photo by <a href="${userLink}">${userFullName}</a> on <a href="${imageLink}">Unsplash</a>`
      const imageData = {
        url: imageUrl,
        attribution,
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
  attributionElm.innerHTML = attribution
  document.body.appendChild(attributionElm)
}

window.addEventListener('load', () => {
  const bookmarksBarId = !!chrome ? '1' : 'toolbar_____'
  renderBookmarksBar(bookmarksBarId)
  renderToggleLink()
  initImage()
})
