// Markdown syntax is stripped before the words are counted so a post is not
// credited for its fences, link URLs, or table pipes — a code-heavy post would
// otherwise read as far longer than it is.
const WORDS_PER_MINUTE = 200

export function readingTimeMinutes(markdown: string): number {
  const prose = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    // Links and images keep their label and lose their target.
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_~|-]/g, ' ')

  const words = prose.split(/\s+/).filter(Boolean).length

  // Anything with words in it takes at least a minute to read.
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE))
}
