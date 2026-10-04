import { useCallback, useEffect, useState } from 'react'
import { portfolioPublicUrl } from '@/config/publishing'
import { entryIds } from '@/cv/collections'
import { templateHashes } from '@/cv/render'
import type { PortfolioCollections, ResolveContext } from '@/cv/resolve'
import { SECTION_SOURCES, parseLibrary, parsePresets, type CvIssue, type CvPreset } from '@/cv/schema'
import { templates } from '@/cv/templates'
import { validateCv } from '@/cv/validate'
import { bundledCollection, bundledProfile } from '@/data/cvBundle'
import { fetchCollection } from '@/services/content'
import { fetchRepositoryHead } from '@/services/repository'

/**
 * Everything the CV pages read, in one place: the CV library and presets, the
 * portfolio collections a CV can draw from, and the template hashes a build
 * input records.
 *
 * With GitHub connected it is V1 as the Worker reads it, pending edits
 * included, and the presets' base revision so the builder can save. Without
 * it, the content bundled into this build of the admin, read-only.
 */

const LIBRARY_LISTS = ['entries', 'bullets', 'summaries', 'skills', 'interests'] as const
const PORTFOLIO_COLLECTIONS = [...new Set(Object.values(SECTION_SOURCES).flat())]

export type CvContent = {
  mode: 'live' | 'bundled'
  /** Why V1 could not be read, when it could not. */
  notice?: string
  presets: CvPreset[]
  /** The revision a preset save quotes; empty when saving is not possible. */
  presetsBaseSha: string
  /** Set once the library parses; the pages need it to resolve anything. */
  context?: ResolveContext
  issues: CvIssue[]
}

type Reader = (collection: string) => readonly unknown[]

async function assemble(read: Reader, mode: CvContent['mode'], sha: string, presetsBaseSha: string, notice?: string): Promise<CvContent> {
  const library = parseLibrary(Object.fromEntries(LIBRARY_LISTS.map(list => [list, read(`cv/${list}`)])))
  const presets = parsePresets({ presets: read('cv/presets') })
  const issues = [...(library.ok ? [] : library.issues), ...(presets.ok ? [] : presets.issues)]
  const base = { mode, notice, presetsBaseSha, presets: presets.ok ? presets.value : [] }
  if (!library.ok) return { ...base, issues }

  const portfolio: PortfolioCollections = new Map(PORTFOLIO_COLLECTIONS.map(collection => [collection, read(collection)]))
  const index = new Map([...portfolio].map(([collection, entries]) => [collection, entryIds(entries)]))
  if (presets.ok) issues.push(...validateCv({ library: library.value, presets: presets.value, templates, portfolio: index }))

  return {
    ...base,
    issues,
    context: {
      library: library.value,
      portfolio,
      profile: bundledProfile,
      siteUrl: portfolioPublicUrl,
      templates,
      templateHashes: await templateHashes(),
      source: { v1Sha: sha, pending: false },
    },
  }
}

async function loadLive(signal: AbortSignal): Promise<CvContent> {
  const collections = [...LIBRARY_LISTS.map(list => `cv/${list}`), 'cv/presets', ...PORTFOLIO_COLLECTIONS]
  const [head, ...states] = await Promise.all([fetchRepositoryHead(signal), ...collections.map(collection => fetchCollection(collection, signal))])
  const byCollection = new Map(collections.map((collection, index) => [collection, states[index]]))
  return assemble(collection => byCollection.get(collection)?.entries ?? [], 'live', head.sha, byCollection.get('cv/presets')?.baseSha ?? '')
}

export function useCvContent(): { content?: CvContent; reload: () => void } {
  const [content, setContent] = useState<CvContent>()
  const [generation, setGeneration] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    loadLive(controller.signal)
      .catch(async (error: unknown) => {
        if (error instanceof Error && error.name === 'AbortError') throw error
        const reason = error instanceof Error ? error.message : 'V1 could not be read.'
        return assemble(bundledCollection, 'bundled', '0'.repeat(40), '', reason)
      })
      .then(setContent, () => undefined)
    return () => controller.abort()
  }, [generation])

  const reload = useCallback(() => setGeneration(value => value + 1), [])
  return { content, reload }
}
