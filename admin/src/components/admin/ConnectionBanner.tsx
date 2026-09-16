import { ArrowUpRight, Rocket } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { publishingTarget } from '@/config/publishing'

export function ConnectionBanner() {
  return (
    <section className="connection-banner" aria-label="Publishing connection status">
      <span className="connection-icon"><Rocket aria-hidden="true" /></span>
      <div>
        <strong>Publishing workflow is ready to connect</strong>
        <p>Changes remain local until the Worker can submit them to the beta <code>{publishingTarget.branch}</code> branch.</p>
      </div>
      <Button variant="outline" size="sm" asChild>
        <Link to="/workspace/publishing">Review setup <ArrowUpRight aria-hidden="true" /></Link>
      </Button>
    </section>
  )
}
