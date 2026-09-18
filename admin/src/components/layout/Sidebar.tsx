import { useState } from 'react'
import { ChevronRight, Cloud, X } from 'lucide-react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Button, IconButton } from '@/components/form'
import { navigation } from '@/config/navigation'
import { useIntegrations } from '@/hooks/useIntegrations'
import { useRepositoryHead } from '@/hooks/useRepositoryHead'
import { cn } from '@/lib/utils'

type SidebarProps = {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({ Home: true })
  const repository = useRepositoryHead()
  const integrations = useIntegrations()

  const toggleParent = (label: string, path: string, isExpanded: boolean) => {
    setExpandedItems(current => ({ ...current, [label]: !isExpanded }))
    if (!isExpanded) navigate(path)
  }

  return (
    <>
      {isOpen && <IconButton variant="bare" size="none" className="sidebar-backdrop" label="Close navigation" onClick={onClose} />}
      <aside className={cn('sidebar', isOpen && 'sidebar-open')}>
        <div className="sidebar-brand">
          <NavLink to="/" className="brand-link" aria-label="Samyabrata Roy admin home" onClick={onClose}>
            <img src="/profile-icon.png" alt="" className="brand-avatar" />
            <span className="min-w-0">
              <strong>Portfolio CMS</strong>
              <small>Local workspace</small>
            </span>
          </NavLink>
          <IconButton variant="bare" size="none" className="icon-button" label="Close navigation" onClick={onClose}>
            <X aria-hidden="true" />
          </IconButton>
        </div>

        <div className="workspace-status">
          <span className={cn('status-dot', repository.connected === false && 'status-dot-local')} aria-hidden="true" />
          <span>{repository.head ? `${repository.head.branch} @ ${repository.head.sha.slice(0, 7)}` : 'Repository content'}</span>
          <span className="workspace-label">{repository.connected === undefined ? '...' : repository.connected ? 'GITHUB' : 'LOCAL'}</span>
        </div>

        <nav className="sidebar-nav" aria-label="Admin sections">
          {navigation.map(group => (
            <div className="nav-group" key={group.label}>
              <p>{group.label}</p>
              {group.items.map(item => {
                const Icon = item.icon
                if (item.children?.length) {
                  const isActive = item.children.some(child => child.path === location.pathname)
                  const isExpanded = expandedItems[item.label] ?? isActive
                  return (
                    <div className="nav-tree" key={item.path}>
                      <Button
                        variant="bare"
                        size="none"
                        className={cn('nav-item nav-parent', isActive && 'nav-item-active')}
                        title={item.label}
                        aria-expanded={isExpanded}
                        onClick={() => toggleParent(item.label, item.path, isExpanded)}
                      >
                        <Icon aria-hidden="true" />
                        <span>{item.label}</span>
                        <ChevronRight className={cn('nav-chevron', isExpanded && 'nav-chevron-open')} aria-hidden="true" />
                      </Button>
                      {isExpanded && (
                        <div className="nav-children">
                          {item.children.map(child => (
                            <NavLink className={({ isActive: childActive }) => cn('nav-child', childActive && 'nav-child-active')} key={child.path} to={child.path} title={child.label} onClick={onClose}>
                              {child.label}
                            </NavLink>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                }
                return (
                  <NavLink
                    className={({ isActive }) => cn('nav-item', isActive && 'nav-item-active')}
                    end
                    key={item.path}
                    title={item.label}
                    to={item.path}
                    onClick={onClose}
                  >
                    <Icon aria-hidden="true" />
                    <span>{item.label}</span>
                    {item.count !== undefined && <span className="nav-count">{item.count}</span>}
                  </NavLink>
                )
              })}
            </div>
          ))}
        </nav>

        <div className="storage-status">
          <Cloud aria-hidden="true" />
          <span>
            <strong>Cloudflare R2</strong>
            <small>{integrations.r2 ? 'Logo catalogue readable' : 'Connection pending'}</small>
          </span>
          <span className={cn('storage-dot', integrations.r2 && 'storage-dot-ready')} aria-hidden="true" />
        </div>
      </aside>
    </>
  )
}
