import { useEffect } from 'react'
import { SITE_PROFILE } from '../content/site'

// Each route is prerendered with its own title and canonical (vite.config.ts),
// so this is not what crawlers read — it keeps both correct as the visitor
// navigates client-side, after the served HTML has been replaced by the app.
const BASE_TITLE = `${SITE_PROFILE.name} · Blog`

// Sets the document title for the current page.
// - string: "<title> · Samyabrata Roy · Blog"
// - null: the base title alone (blog home)
// - undefined: leaves the title untouched — pass this while a page's data is
//   missing so the NotFoundPage it renders keeps ownership of the title.
export function usePageTitle(title: string | null | undefined): void {
  useEffect(() => {
    if (title === undefined) return
    document.title = title === null ? BASE_TITLE : `${title} · ${BASE_TITLE}`

    // The canonical still points at whichever page was served; repoint it at
    // the URL actually being viewed so a copied link is never attributed to
    // the entry page.
    const canonical = document.querySelector('link[rel="canonical"]')
    canonical?.setAttribute(
      'href',
      new URL(location.pathname, location.origin).href,
    )
  }, [title])
}
