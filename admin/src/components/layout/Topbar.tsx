import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, CircleUserRound, GitBranch, Menu, Rocket, Search, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { searchableNavigationItems } from '@/config/navigation'
import { publishingBranchLabel } from '@/config/publishing'

type TopbarProps = {
  onOpenNavigation: () => void
}

export function Topbar({ onOpenNavigation }: TopbarProps) {
  const navigate = useNavigate()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const results = useMemo(() => searchableNavigationItems.filter(item => item.label.toLowerCase().includes(query.trim().toLowerCase())), [query])

  useEffect(() => {
    const openSearch = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      if (event.key === '/' && !['INPUT', 'TEXTAREA'].includes(target.tagName)) {
        event.preventDefault()
        setIsSearchOpen(true)
      }
    }
    window.addEventListener('keydown', openSearch)
    return () => window.removeEventListener('keydown', openSearch)
  }, [])

  const openResult = (path: string) => {
    navigate(path)
    setQuery('')
    setIsSearchOpen(false)
  }

  return (
    <header className="topbar">
      <div className="topbar-leading">
        <button className="icon-button menu-button" type="button" aria-label="Open navigation" onClick={onOpenNavigation}>
          <Menu aria-hidden="true" />
        </button>
        <button className="search-trigger" type="button" onClick={() => setIsSearchOpen(true)}>
          <Search aria-hidden="true" />
          <span>Search admin</span>
          <kbd>/</kbd>
        </button>
        <div className="branch-label">
          <GitBranch aria-hidden="true" />
          <span>{publishingBranchLabel}</span>
        </div>
      </div>
      <div className="topbar-actions">
        <span className="sync-state"><span className="status-dot" />Local</span>
        <Button variant="outline" size="sm" disabled>
          <Rocket aria-hidden="true" /> Publish changes
        </Button>
        <button className="profile-button" type="button" aria-label="Account settings">
          <CircleUserRound aria-hidden="true" />
        </button>
      </div>
      {isSearchOpen && (
        <div className="command-backdrop" role="presentation" onMouseDown={() => setIsSearchOpen(false)}>
          <section className="command-dialog" role="dialog" aria-modal="true" aria-label="Search admin" onMouseDown={event => event.stopPropagation()}>
            <div className="command-input"><Search aria-hidden="true" /><input autoFocus value={query} onChange={event => setQuery(event.target.value)} placeholder="Search pages and tools" aria-label="Search admin pages" /><button type="button" aria-label="Close search" onClick={() => setIsSearchOpen(false)}><X aria-hidden="true" /></button></div>
            <div className="command-results">
              {results.map(item => { const Icon = item.icon; return <button type="button" key={`${item.path}:${item.label}`} onClick={() => openResult(item.path)}><Icon aria-hidden="true" /><span>{item.label}</span><ArrowRight aria-hidden="true" /></button> })}
              {!results.length && <p>No matching admin pages.</p>}
            </div>
          </section>
        </div>
      )}
    </header>
  )
}
