// Typed accessors over descriptions.yml (page subtitle/description lines).
// Render gated by isPageDescriptionEnabled(<page>) from src/config/featureFlags.ts.
import raw from './descriptions.yml'

export type PageKey = 'blogs' | 'readings' | 'travel' | 'hobbies' | 'gallery'

export const PAGE_DESCRIPTIONS = raw as Record<PageKey, string>
