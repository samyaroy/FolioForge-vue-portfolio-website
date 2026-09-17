import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/form'

export function NotFoundPage() {
  return <div className="not-found"><strong>404</strong><h1>Admin page not found</h1><p>The requested workspace route does not exist.</p><Button asChild><Link to="/"><ArrowLeft aria-hidden="true" /> Portfolio overview</Link></Button></div>
}
