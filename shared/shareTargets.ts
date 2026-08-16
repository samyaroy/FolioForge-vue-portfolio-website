// One share vocabulary for both apps in this repo: the Vue portfolio (src/) and
// the React blog (blogs/). Which networks exist, what a caption reads like, and
// how a link is handed to each network are decided once here, so the two share
// menus — ShareMenu.vue and ShareMenu.tsx — stay pure presentation and cannot
// drift apart. It is the runtime counterpart of scripts/seo-build.ts, which is
// already shared by both builds the same way.
//
// Adding a network is one entry in SHARE_TARGETS plus one case in
// buildShareUrl(); both menus pick it up with no further change.
//
// Nothing here imports a framework. The three functions that touch the DOM
// (openShare, copyText, saveImage) all guard for the prerender pass, which runs
// in Node.

export type ShareTargetId =
  | 'linkedin'
  | 'x'
  | 'whatsapp'
  | 'facebook'
  | 'email'
  | 'instagram'
  | 'copy'

export interface ShareContent {
  /** Absolute canonical URL of the thing being shared. Never a relative path:
      every network resolves this on its own servers, not in the browser. */
  url: string
  title: string
  /** One-line summary. Becomes the post body on the networks that accept one. */
  text?: string
  /** Bare words, no leading '#'. Used by X only. */
  hashtags?: string[]
  /** Absolute image URL. Its presence is what makes Instagram shareable at all;
      see saveImage() for why. */
  imageUrl?: string
}

export interface ShareTarget {
  id: ShareTargetId
  label: string
  /** Material Design Icon name. Both apps ship @mdi/font; each renders it its
      own way (`<v-icon>` in Vue, `class="mdi mdi-…"` in React). */
  icon: string
  /** Brand colour for the icon, as a Tailwind class. */
  colorClass: string
  /** 'link' opens buildShareUrl() in a new tab. 'action' is run by the menu
      itself — there is no URL to open. */
  kind: 'link' | 'action'
}

/** Menu order. Networks first, then the two local actions. */
export const SHARE_TARGETS: readonly ShareTarget[] = Object.freeze([
  {
    id: 'linkedin',
    label: 'LinkedIn',
    icon: 'mdi-linkedin',
    colorClass: 'text-[#0a66c2]',
    kind: 'link',
  },
  {
    id: 'x',
    label: 'X',
    icon: 'mdi-alpha-x',
    colorClass: 'text-[#0f172a]',
    kind: 'link',
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    icon: 'mdi-whatsapp',
    colorClass: 'text-[#25d366]',
    kind: 'link',
  },
  {
    id: 'facebook',
    label: 'Facebook',
    icon: 'mdi-facebook',
    colorClass: 'text-[#1877f2]',
    kind: 'link',
  },
  {
    id: 'email',
    label: 'Email',
    icon: 'mdi-email-outline',
    colorClass: 'text-slate-500',
    kind: 'link',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    icon: 'mdi-instagram',
    colorClass: 'text-[#e1306c]',
    kind: 'action',
  },
  {
    id: 'copy',
    label: 'Copy link',
    icon: 'mdi-link-variant',
    colorClass: 'text-slate-500',
    kind: 'action',
  },
] as const)

/** A post at 280 characters minus the 23 an X-shortened link always costs,
    minus room for a couple of hashtags. */
const X_TEXT_LIMIT = 200

/**
 * The targets that make sense for one piece of content. Instagram drops out
 * when there is no image, because handing over the image *is* the whole
 * interaction there — a blog post has nothing to give it.
 */
export function resolveShareTargets(content: ShareContent): ShareTarget[] {
  return SHARE_TARGETS.filter(
    (target) => target.id !== 'instagram' || Boolean(content.imageUrl),
  )
}

/** The sentence that goes in the post body, for the networks that take one. */
export function shareMessage(content: ShareContent): string {
  const text = content.text?.trim()

  return text && text !== content.title ? `${content.title} — ${text}` : content.title
}

/**
 * Where a given target sends the user. Only meaningful for `kind: 'link'`
 * targets; the two actions return the content URL so a caller that opens this
 * blindly still lands somewhere sensible.
 */
export function buildShareUrl(targetId: ShareTargetId, content: ShareContent): string {
  const encodedUrl = encodeURIComponent(content.url)
  const message = shareMessage(content)

  switch (targetId) {
    case 'linkedin':
      // LinkedIn removed support for `title`/`summary` parameters in 2021: it
      // scrapes the target page's OG tags and ignores everything else passed
      // here. The preview quality is therefore decided entirely by the <head>
      // that scripts/seo-build.ts stamps on the shared page.
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`

    case 'x': {
      const params = new URLSearchParams({
        url: content.url,
        text: truncate(message, X_TEXT_LIMIT),
      })
      const hashtags = (content.hashtags ?? []).map(toHashtag).filter(Boolean)
      if (hashtags.length) params.set('hashtags', hashtags.join(','))

      return `https://x.com/intent/post?${params.toString()}`
    }

    case 'whatsapp':
      // One `text` field carries both, so the URL goes in the body.
      return `https://wa.me/?text=${encodeURIComponent(`${message}\n${content.url}`)}`

    case 'facebook':
      // URL only, same as LinkedIn: `quote` is ignored for non-app shares.
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`

    case 'email':
      return `mailto:?subject=${encodeURIComponent(content.title)}&body=${encodeURIComponent(
        `${message}\n\n${content.url}`,
      )}`

    default:
      return content.url
  }
}

// A page shows one share button per card, and two popovers open at once read as
// a glitch rather than a choice. Each menu hands its own close function over on
// opening, which closes whichever menu held the slot before it.
//
// This cannot be left to the outside-click listeners: a trigger click has to
// stop propagating, or it would reach the listener the same click just
// installed and close the menu it opened.
let closeOpenShareMenu: (() => void) | null = null

/** Called by a menu as it opens. Closes whichever menu was open before. */
export function claimOpenShareMenu(close: () => void): void {
  if (closeOpenShareMenu && closeOpenShareMenu !== close) closeOpenShareMenu()

  closeOpenShareMenu = close
}

/** Called by a menu as it closes. Ignored if another menu already took the slot,
    which is what keeps a close-then-open handover from clearing the new one. */
export function releaseOpenShareMenu(close: () => void): void {
  if (closeOpenShareMenu === close) closeOpenShareMenu = null
}

/** Opens a share endpoint. `mailto:` navigates the current tab — a hand-off to
    the mail client, which never renders a window of its own. */
export function openShare(url: string): void {
  if (typeof window === 'undefined') return

  if (url.startsWith('mailto:')) {
    window.location.href = url
    return
  }

  window.open(url, '_blank', 'noopener,noreferrer')
}

/** True when the text reached the clipboard. The execCommand path is the
    fallback for insecure contexts, where navigator.clipboard is undefined. */
export async function copyText(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // Permission denied or a non-focused document; fall through.
    }
  }

  if (typeof document === 'undefined') return false

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()

  try {
    return document.execCommand('copy')
  } catch {
    return false
  } finally {
    document.body.removeChild(textarea)
  }
}

/** How far the Instagram hand-off got. */
export type ImageHandoff = 'downloaded' | 'opened' | 'failed'

/**
 * Instagram is the one network here with no web share endpoint — nothing
 * accepts a URL and opens a composer, and it does not read OG tags, because a
 * post is an image rather than a link. The closest honest thing is to put the
 * image in the user's downloads and the caption on their clipboard, leaving the
 * post two taps away in the Instagram app itself.
 *
 * Returns:
 *   'downloaded' — the file is saved (image host allows cross-origin reads)
 *   'opened'     — no CORS header on the image, so it is in a new tab to save
 *                  by hand; a cross-origin `download` attribute is ignored by
 *                  every browser, so there is no way around this
 *   'failed'     — neither worked, almost always a blocked popup
 */
export async function saveImage(imageUrl: string, fileName: string): Promise<ImageHandoff> {
  if (typeof document === 'undefined' || typeof window === 'undefined') return 'failed'

  try {
    const response = await fetch(imageUrl, { mode: 'cors' })
    if (!response.ok) throw new Error(`image responded ${response.status}`)

    const objectUrl = URL.createObjectURL(await response.blob())
    const link = document.createElement('a')
    link.href = objectUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    // Revoking synchronously races the download the click just started.
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000)

    return 'downloaded'
  } catch {
    return window.open(imageUrl, '_blank', 'noopener,noreferrer') ? 'opened' : 'failed'
  }
}

/** `example.com/a/b/photo.jpeg` → `photo.jpeg`. A URL with no file extension
    (a signed or generated image) falls back to a slug of the given name. */
export function imageFileName(imageUrl: string, fallbackName: string): string {
  const lastSegment = imageUrl.split(/[?#]/)[0].split('/').pop() ?? ''
  if (/\.[a-z0-9]{2,5}$/i.test(lastSegment)) return decodeURIComponent(lastSegment)

  const slug = fallbackName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return `${slug || 'image'}.jpg`
}

function toHashtag(tag: string): string {
  return tag.replace(/[^a-z0-9]/gi, '')
}

/** Cuts on a word boundary so a truncated caption does not end mid-word. */
function truncate(text: string, limit: number): string {
  if (text.length <= limit) return text

  const clipped = text.slice(0, limit - 1)
  const lastSpace = clipped.lastIndexOf(' ')

  return `${(lastSpace > limit * 0.6 ? clipped.slice(0, lastSpace) : clipped).trimEnd()}…`
}
