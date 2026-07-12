import { useEffect } from 'react'
import { SITE_PROFILE } from '../content/site'

// Keep in sync with the static <title> in index.html, which is what crawlers
// and the first paint see before React mounts.
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
  }, [title])
}
