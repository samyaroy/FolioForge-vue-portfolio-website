import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, CircleUserRound, GitBranch, Menu, Rocket, Search, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button, IconButton, TextField } from '@/components/form'
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
        <IconButton variant="bare" size="none" className="icon-button menu-button" label="Open navigation" onClick={onOpenNavigation}>
          <Menu aria-hidden="true" />
        </IconButton>
        <Button variant="bare" size="none" className="search-trigger" onClick={() => setIsSearchOpen(true)}>
          <Search aria-hidden="true" />
          <span>Search admin</span>
          <kbd>/</kbd>
        </Button>
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
        <IconButton variant="bare" size="none" className="profile-button" label="Account settings">
          <CircleUserRound aria-hidden="true" />
        </IconButton>
      </div>
      {isSearchOpen && (
        <div className="command-backdrop" role="presentation" onMouseDown={() => setIsSearchOpen(false)}>
          <section className="command-dialog" role="dialog" aria-modal="true" aria-label="Search admin" onMouseDown={event => event.stopPropagation()}>
            <div className="command-input"><Search aria-hidden="true" /><TextField autoFocus className="h-auto border-0 bg-transparent px-0 text-[13px]" value={query} onChange={setQuery} placeholder="Search pages and tools" aria-label="Search admin pages" /><IconButton variant="bare" size="none" label="Close search" onClick={() => setIsSearchOpen(false)}><X aria-hidden="true" /></IconButton></div>
            <div className="command-results">
              {results.map(item => { const Icon = item.icon; return <Button variant="bare" size="none" key={`${item.path}:${item.label}`} onClick={() => openResult(item.path)}><Icon aria-hidden="true" /><span>{item.label}</span><ArrowRight aria-hidden="true" /></Button> })}
              {!results.length && <p>No matching admin pages.</p>}
            </div>
          </section>
        </div>
      )}
    </header>
  )
}
