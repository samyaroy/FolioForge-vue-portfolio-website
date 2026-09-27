// An article is placed by its `type`: only 'journal' reaches the Journal
// Articles section, and every other value — including a missing one — is
// treated as general.
export const articleTypeLabels = {
  general: 'General',
  journal: 'Journal',
} as const

export const articleTypes = Object.keys(articleTypeLabels)

export const journalArticleType = 'journal'

export type ArticleType = keyof typeof articleTypeLabels
