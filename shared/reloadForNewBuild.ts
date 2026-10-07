// Recovery for a tab that outlived a deploy, shared by both apps in this repo:
// the Vue portfolio (src/) and the React blog (blogs/). Every deploy replaces
// the hashed files under /assets/, so a page opened before it asks for chunks
// that no longer exist the next time it lazy-loads one. Loading the page from
// the network again fetches the new index.html, and with it the new hashes.
//
// A chunk can also be missing for reasons a reload does not fix (a bad deploy,
// a dropped connection). The timestamp in sessionStorage keeps that from
// turning into a reload loop: a second failure inside the window is left to
// the app's error screen instead.

const STORAGE_KEY = 'reloadedForNewBuildAt'
const RELOAD_WINDOW_MS = 10_000

let reloading = false

/**
 * Loads `url` (by default the current page) from the network and returns
 * true. Returns false without navigating when it already did so within the
 * last few seconds, or when sessionStorage is unavailable and the loop guard
 * cannot be kept.
 */
export function reloadForNewBuild(url: string = location.href): boolean {
  try {
    const lastReload = Number(sessionStorage.getItem(STORAGE_KEY))
    if (Date.now() - lastReload < RELOAD_WINDOW_MS) return false
    sessionStorage.setItem(STORAGE_KEY, String(Date.now()))
  } catch {
    return false
  }

  reloading = true
  // assign() to the URL already showing would only scroll to its #hash.
  if (new URL(url, location.href).href === location.href) location.reload()
  else location.assign(url)
  return true
}

/**
 * True once reloadForNewBuild() has started a reload, so an error screen can
 * stay blank rather than flash up in the moment before the page goes.
 */
export function isReloadingForNewBuild(): boolean {
  return reloading
}
