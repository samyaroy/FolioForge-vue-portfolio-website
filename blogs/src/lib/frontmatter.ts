// Minimal frontmatter parser — handles the small, controlled subset this blog
// uses: a leading `---` block of `key: value` lines, where values are strings
// (optionally quoted), inline arrays (`[a, b]`), or booleans. Avoids pulling in
// a YAML dependency for what is, in practice, a flat key/value header.

export interface ParsedFrontmatter {
  attributes: Record<string, string | string[] | boolean>
  body: string
}

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/

function parseValue(raw: string): string | string[] | boolean {
  const value = raw.trim()
  if (value === 'true') return true
  if (value === 'false') return false

  // Inline array: [a, "b", c]
  if (value.startsWith('[') && value.endsWith(']')) {
    return value
      .slice(1, -1)
      .split(',')
      .map((item) => unquote(item.trim()))
      .filter((item) => item.length > 0)
  }

  return unquote(value)
}

function unquote(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1)
  }
  return value
}

export function parseFrontmatter(raw: string): ParsedFrontmatter {
  const match = raw.match(FRONTMATTER_RE)
  if (!match) {
    return { attributes: {}, body: raw }
  }

  const attributes: ParsedFrontmatter['attributes'] = {}
  for (const line of match[1].split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const colon = trimmed.indexOf(':')
    if (colon === -1) continue
    const key = trimmed.slice(0, colon).trim()
    attributes[key] = parseValue(trimmed.slice(colon + 1))
  }

  return { attributes, body: raw.slice(match[0].length) }
}
