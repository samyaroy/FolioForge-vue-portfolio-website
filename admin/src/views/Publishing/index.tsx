import { Check, CircleDashed, GitBranch, GitPullRequest, LockKeyhole, Rocket } from 'lucide-react'
import { PageHeader } from '@/components/admin/PageHeader'
import { Button } from '@/components/form'
import { publishingTarget } from '@/config/publishing'

const steps = [
  { title: 'Cloudflare Access', description: 'Protect the admin hostname and verify Access JWTs in the Worker.', icon: LockKeyhole },
  { title: 'GitHub App', description: 'Create short-lived installation tokens for approved content paths.', icon: GitPullRequest },
  { title: 'Validation pipeline', description: 'Validate schemas, generated manifests, media, and affected builds.', icon: Check },
  { title: 'Deployment status', description: 'Confirm the merged revision is live before reporting success.', icon: Rocket },
]

export function PublishingPage() {
  return (
    <>
      <PageHeader title="Publishing" description="Track the protected GitHub review and deployment workflow." actions={<Button disabled><Rocket aria-hidden="true" /> Publish changes</Button>} />
      <section className="publish-target" aria-label="Publishing target">
        <span><GitBranch aria-hidden="true" /></span>
        <div><small>Fixed destination branch</small><strong>{publishingTarget.branch}</strong><p>Every admin change targets the beta environment. The main branch is never an allowed destination.</p></div>
        <span className="type-badge">{publishingTarget.environment}</span>
      </section>
      <section className="workflow-panel">
        <div className="panel-heading"><div><span>Configuration</span><h2>Connection checklist</h2></div><span className="type-badge">Not connected</span></div>
        <div className="workflow-list">
          {steps.map((step, index) => { const Icon = step.icon; return <article key={step.title}><span className="workflow-index">{index + 1}</span><Icon aria-hidden="true" /><div><strong>{step.title}</strong><p>{step.description}</p></div><CircleDashed aria-label="Pending" /></article> })}
        </div>
      </section>
    </>
  )
}
