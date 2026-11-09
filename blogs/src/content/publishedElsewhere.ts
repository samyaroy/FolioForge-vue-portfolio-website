import { withoutDisabledEntries } from '../../../src/config/entryStatus'
// Read straight from the portfolio's article list, so an article is added once
// (there or in the admin) and the blog's "Published elsewhere" list follows.
import raw from '../../../src/content/profile_info/publications.yml'

type PortfolioArticle = {
  title?: string
  /** `general` for magazine and newsletter pieces, `journal` for papers. */
  type?: string
  link?: string
  cred_link?: string
  publication?: { name?: string }
}

export type PublishedElsewhereItem = {
  title: string
  /** The publisher's page, or the archived copy when there is none. */
  url: string
  /** Where it ran, e.g. "EPOCHS 2025 (2nd Edition)". */
  publication?: string
}

const { articles = [] } = raw as { articles?: PortfolioArticle[] }

// Journal papers stay on the portfolio; only the general-audience writing is
// listed beside the blog. Kept in the YAML's order, newest first.
export const PUBLISHED_ELSEWHERE: PublishedElsewhereItem[] = withoutDisabledEntries(
  articles,
).flatMap((article) => {
  const title = article.title?.trim()
  const url = article.link?.trim() || article.cred_link?.trim()
  if (article.type !== 'general' || !title || !url) return []
  return [{ title, url, publication: article.publication?.name?.trim() || undefined }]
})
