import { AlertTriangle } from 'lucide-react'
import type { CvIssue } from '@/cv/schema'

/** Problems in the CV content, each at the place it was found. */
export function CvIssues({ issues, title = 'Fix these before the CV can build' }: { issues: readonly CvIssue[]; title?: string }) {
  if (!issues.length) return null
  return (
    <section className="cv-issues" role="alert">
      <h2><AlertTriangle aria-hidden="true" />{title}</h2>
      <ul>
        {issues.map((issue, index) => (
          <li key={index}><code>{issue.path}</code>{issue.message}</li>
        ))}
      </ul>
    </section>
  )
}
