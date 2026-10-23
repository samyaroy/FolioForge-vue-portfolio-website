import type { BuildInput } from './schema.ts'

/**
 * The fingerprint of a build's input: the same content, preset and template
 * always hash the same, whatever order the keys arrived in. It is what the
 * Build and Published chips compare, so where the content came from (`source`)
 * is left out — the same CV built from V1 or from a pending edit is the same CV.
 */

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value).sort().map(key => [key, canonical((value as Record<string, unknown>)[key])]),
    )
  }
  return value
}

export function canonicalJson(value: unknown): string {
  return JSON.stringify(canonical(value))
}

export async function sha256(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('')
}

export async function inputHash(input: BuildInput): Promise<string> {
  return `sha256:${await sha256(canonicalJson({ ...input, source: undefined }))}`
}
