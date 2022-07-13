#  ![icon](https://raw.githubusercontent.com/mathio/chrome-new-tab-page-bookmarks/main/src/icon32.png) New Tab Page Bookmarks

Displays your bookmarks in multiple columns for quick access from the new tab page.

## Installation

From Chrome Web Store:
1. go to [Chrome Web Store](https://chrome.google.com/webstore/detail/new-tab-page-bookmarks/nenadkoihofnhlaokenacmknknmlgdcm)
2. Click `Add to Chrome` button

Manually: 
1. [Download latest release from Github](https://github.com/mathio/chrome-new-tab-page-bookmarks/releases/download/latest/chrome-extension.zip)
2. Unpack contents of the zip file to a directory (eg. `chrome-extension/`)
3. Go to Chrome menu `⋮` -> `More Tools` -> `Extensions` and enable `Developer mode` in the top right corner.
4. Click on `Load unpacked` button and point to `chrome-extension/` directory.
5. Open new browser tab to see the extension!


## Preview

![screenshot](https://raw.githubusercontent.com/mathio/chrome-new-tab-page-bookmarks/main/store/screenshot_1280x800.png "Extension Screenshot")

## Description

- does NOT manage your bookmarks, the built-in bookmarks manager for that (`CMD+ALT+B` / `CTRL+SHIFT+O`)
- does NOT sync your bookmarks, Chrome already does that
- there are NO settings, deal with it
- just displays your bookmarks in multiple columns for quick access from the new tab page
- displays favicons for your bookmarks (via Google API)


## Permission justification

Extension requires [permissions to access your bookmarks](https://developer.chrome.com/docs/extensions/reference/bookmarks/) to display them on the new tab page. Your bookmarks do not leave your device. It loads favicons via Google API ([using t2.gstatic.com/faviconV2 like this](https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://github.com&size=16)) and might disclose domains & subdomains (not full URLs) from your bookmarks to Google.


## Development

Run `yarn build` to zip the extension for the purpose of uploading to Chrome Web Store.
