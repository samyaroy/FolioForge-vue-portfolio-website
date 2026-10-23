import { useEffect, useRef, useState } from 'react'
import { buildShareUrl, copyText, openShare } from '@shared/shareTargets'
import { downloadReviewImage } from '../../lib/reviewImage'

type ReviewShareProps = {
  title: string
  review?: string
  url: string
}

const BUTTON_BASE_CLASS = 'inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50'
const BUTTON_CLASS = `${BUTTON_BASE_CLASS} border-border text-muted hover:bg-slate-900/5`
const COPIED_BUTTON_CLASS = `${BUTTON_BASE_CLASS} border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700`

export function ReviewShare({ title, review, url }: ReviewShareProps) {
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState<'link' | 'review' | null>(null)
  const copyTimer = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => () => clearTimeout(copyTimer.current), [])
  const content = { title: `${title} — Review`, text: review?.trim(), url }
  const caption = [content.title, review?.trim(), url].filter(Boolean).join('\n\n')

  async function instagram() {
    setBusy(true)
    setStatus('Preparing review image…')
    try {
      // Start the clipboard write directly from the click, before image work.
      const copied = copyText(caption)
      downloadReviewImage(title, review, url)
      setStatus(await copied
        ? 'Review image saved and caption copied. Upload the image to Instagram and paste the caption. Long reviews may need a shorter caption.'
        : 'Review image saved. Upload it to Instagram; use Copy review to copy the caption, or copy the text from the review.')
    } catch {
      setStatus('Could not save the review image. You can still copy the review and link.')
    } finally {
      setBusy(false)
    }
  }

  async function copy(value: string, target: 'link' | 'review') {
    clearTimeout(copyTimer.current)
    setCopied(null)
    setStatus('')
    if (await copyText(value)) {
      setCopied(target)
      copyTimer.current = setTimeout(() => setCopied(null), 2500)
    } else {
      setStatus('Could not copy automatically. Select and copy the review text or the URL from your address bar.')
    }
  }

  return (
    <footer className="shrink-0 border-t border-border bg-surface px-5 py-3 sm:px-6">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Share this review">
        <span className="mr-1 text-xs font-semibold text-faint">Share review</span>
        <button type="button" className={BUTTON_CLASS} disabled={busy} onClick={() => void instagram()}>
          <span className="mdi mdi-instagram" aria-hidden="true" />Instagram
        </button>
        <button type="button" className={BUTTON_CLASS} onClick={() => openShare(buildShareUrl('linkedin', content))}>
          <span className="mdi mdi-linkedin" aria-hidden="true" />LinkedIn
        </button>
        <button type="button" className={BUTTON_CLASS} onClick={() => openShare(buildShareUrl('x', content))}>
          <span className="mdi mdi-alpha-x" aria-hidden="true" />X (Twitter)
        </button>
        <button type="button" className={copied === 'link' ? COPIED_BUTTON_CLASS : BUTTON_CLASS} aria-label={copied === 'link' ? 'Link copied' : 'Copy link'} onClick={() => void copy(url, 'link')}>
          {copied === 'link' && <span className="mdi mdi-check" aria-hidden="true" />}Copy link
        </button>
        <button type="button" className={copied === 'review' ? COPIED_BUTTON_CLASS : BUTTON_CLASS} aria-label={copied === 'review' ? 'Review copied' : 'Copy review'} onClick={() => void copy(caption, 'review')}>
          {copied === 'review' && <span className="mdi mdi-check" aria-hidden="true" />}Copy review
        </button>
      </div>
      {status && <p role="status" aria-live="polite" className="mt-1 text-xs leading-relaxed text-muted">{status}</p>}
    </footer>
  )
}
