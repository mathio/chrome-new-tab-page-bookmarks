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

const renderToggleLink = () => {
  const linkElm = document.querySelector('a#toggle')
  const TOGGLE_KEY_NAME = 'hideBookmarksBar'
  const isHidden = window.localStorage.getItem(TOGGLE_KEY_NAME) === 'yes'
  linkElm.innerText = isHidden ? 'show' : 'hide'
  document.querySelector('#root').style.display = isHidden ? 'none' : 'flex'

  linkElm.onclick = () => {
    const wasHidden = window.localStorage.getItem(TOGGLE_KEY_NAME) === 'yes'
    window.localStorage.setItem(TOGGLE_KEY_NAME, wasHidden ? 'no' : 'yes')
    linkElm.innerText = wasHidden ? 'hide' : 'show'
    document.querySelector('#root').style.display = wasHidden ? 'flex' : 'none'
  }
}
window.addEventListener('load', () => {
  const bookmarksBarId = !!chrome ? '1' : 'toolbar_____'
  renderBookmarksBar(bookmarksBarId)
  renderToggleLink()
})
