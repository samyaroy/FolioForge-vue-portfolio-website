import { Link } from 'react-router-dom'
import { usePageTitle } from '../../lib/usePageTitle'

// "Aw, Snap!" sad tab: a page with a folded corner and a frowning face.
function AwSnapIcon() {
  return (
    <svg
      className="mx-auto mb-2 h-24 w-24 text-muted"
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 6h22l14 14v36a2 2 0 0 1-2 2H16a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
      <path d="M38 6v12a2 2 0 0 0 2 2h12" />
      <circle cx="26" cy="35" r="2" fill="currentColor" />
      <circle cx="40" cy="35" r="2" fill="currentColor" />
      <path d="M26 48c4-5 10-5 14 0" />
    </svg>
  )
}

export function NotFoundPage() {
  usePageTitle('Page not found')

  return (
    <section className="mx-auto max-w-xl py-16 text-center">
      <AwSnapIcon />
      <h1 className="text-[4rem] font-black tracking-[-0.033em] text-ink">404</h1>
      <p className="text-muted">
        That post doesn&apos;t exist (or hasn&apos;t been published yet).
      </p>
      <Link to="/">Back to all posts</Link>
    </section>
  )
}
