// The slice of the portfolio content that the always-mounted shell reads: the
// header, footer, quote banner, and the site/media config modules they use.
//
// These are bundled into the entry chunk that every visitor downloads, so they
// must not import ./index — that barrel pulls in every section's YAML (gallery,
// workshops, education, ...), which then ships on every page. Pages that need
// the full config import ./index; Rollup splits it into a shared lazy chunk.
//
// To expose another key to the shell, add the one YAML file that defines it.
import meta from './meta.yml'
import profile from './profile.yml'
import pageQuotes from './page_quotes.yml'

import { withoutDisabledEntries } from '../../config/entryStatus'

// Same schemaless shape and disabled-entry filtering as ./index, so the shell
// sees exactly what the pages see for these keys.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const siteConfig: Record<string, any> = withoutDisabledEntries({
  ...meta,
  ...profile,
  ...pageQuotes,
})

export default siteConfig
