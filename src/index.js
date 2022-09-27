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

const bookmarksBarId = !!chrome ? '1' : 'toolbar_____'
renderBookmarksBar(bookmarksBarId)
