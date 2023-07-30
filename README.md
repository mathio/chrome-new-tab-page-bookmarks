#  ![icon](https://raw.githubusercontent.com/mathio/chrome-new-tab-page-bookmarks/main/src/icon32.png) New Tab Page Bookmarks

Displays your bookmarks in multiple columns for quick access from the new tab page.

Works in both Chrome and Firefox browsers.

## Installation

### Chrome

From Chrome Web Store:
1. go to [Chrome Web Store](https://chrome.google.com/webstore/detail/new-tab-page-bookmarks/nenadkoihofnhlaokenacmknknmlgdcm)
2. Click `Add to Chrome` button

Manually:
1. [Download latest Chrome release from Github](https://github.com/mathio/chrome-new-tab-page-bookmarks/releases/download/latest/chrome-extension.zip)
2. Unpack contents of the zip file to a directory (eg. `chrome-extension/`)
3. Go to Chrome menu `⋮` -> `More Tools` -> `Extensions` and enable `Developer mode` in the top right corner.
4. Click on `Load unpacked` button and point to `chrome-extension/` directory.
5. Open new browser tab to see the extension!

### Firefox

From Firefox Add-ons:
1. go to [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/new-tab-page-bookmarks/)
2. click `Add to Firefox` button

Manually:
1. [Download latest Firefox release from Github](https://github.com/mathio/chrome-new-tab-page-bookmarks/releases/download/latest/firefox-extension.zip)
2. Go to Firefox menu `☰` -> `Add-ons and themes`
3. Click gear icon `⚙` -> `Debug add-ons`
4. Click `Load temporary add-on` button
5. Select `firefox-extension.zip`
6. Open new browser tab to see the extension!

## Preview

![Chrome Screenshot](https://raw.githubusercontent.com/mathio/chrome-new-tab-page-bookmarks/main/store/chrome_screenshot_1280x800.png "Chrome Screenshot")

## Description

- does NOT manage your bookmarks, use the built-in bookmarks manager for that:
    - Chrome: `CMD+ALT+B` / `CTRL+SHIFT+O`
    - Firefox: `CMD+SHIFT+O` / `CTRL+SHIFT+O`
- does NOT sync your bookmarks, your browser already does that
    - [Sync in Chrome](https://support.google.com/chrome/answer/185277)
    - [Firefox Sync](https://www.mozilla.org/en-US/firefox/sync/)
- there are NO settings, deal with it
- just displays your bookmarks in multiple columns for quick access from the new tab page
- displays favicons for your bookmarks (via Google API)
- displays small "show" / "hide" toggle in bottom right corner to hide all your bookmarks (for when you are sharing your screen or someone is looking over your shoulder)
- when you hide bookmarks [a random photo](https://unsplash.com/documentation#get-a-random-photo) from [wallpaper topic on Unsplash](https://unsplash.com/t/wallpapers?utm_source=chrome-new-tab-page-bookmarks&utm_medium=referral) is displayed once every 15 minutes


## Privacy and permission justification

Extension requires [permissions to access your bookmarks](https://developer.chrome.com/docs/extensions/reference/bookmarks/) to display them on the new tab page. Your bookmarks do not leave your device. It loads favicons via Google API ([using t2.gstatic.com/faviconV2 like this](https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://github.com&size=16)) and might disclose domains & subdomains (not full URLs) from your bookmarks to Google.

Wallpaper images from Unsplash API are loaded via proxy. All requests are anonymous and rate-limited via IP address hash. Image is loaded directly from Unsplash CDN and is [tracked by Unsplash](https://unsplash.com/documentation#hotlinking). 


## Development

Run `yarn dev` to watch for changes and build the extension for Chrome. Load the extension manually from `dist/chrome-extension` in Chrome (see steps above) to preview changes in your browser.

Run `yarn build` to zip the extension for distribution for both Chrome and Firefox.

It can be distributed manually (as zip file) or manually uploaded to Chrome Web Store and Firefox Add-on Developer Hub.
