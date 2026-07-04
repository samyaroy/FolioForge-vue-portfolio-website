import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { isFeatureEnabled } from '../../config/featureFlags'
import {
  FACTS_NAV_LABEL,
  FACTS_URL,
  MAIN_SITE_URL,
  NAV_ITEMS,
  PORTFOLIO_NAV_LABEL,
} from '../../content/navigation'
import { SITE_PROFILE } from '../../content/site'

const MUTED_LINK_CLASS =
  'relative text-sm leading-normal font-medium text-[#6b7280] transition-colors duration-200 hover:text-primary'

function navLinkClass({ isActive }: { isActive: boolean }): string {
  return isActive
    ? 'relative text-sm leading-normal font-bold text-primary transition-colors duration-200'
    : 'relative text-sm leading-normal font-medium text-ink transition-colors duration-200 hover:text-primary'
}

export function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const enabledNavItems = NAV_ITEMS.filter((item) => isFeatureEnabled(item.flag))

  return (
    <>
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-header-border bg-surface px-10 py-4 whitespace-nowrap">
        <div
          className="inline-flex items-center gap-4 text-lg leading-tight font-bold tracking-[-0.015em] whitespace-nowrap text-ink"
          aria-label={SITE_PROFILE.name}
        >
          <span className="inline-flex size-4 flex-none overflow-hidden rounded-full bg-surface-soft">
            <img className="size-full object-cover" src={SITE_PROFILE.profileIconPath} alt="" />
          </span>
          <span>{SITE_PROFILE.name}</span>
        </div>

        <div className="flex flex-1 items-center justify-end gap-8">
          <nav
            className="hidden items-center gap-9 md:flex"
            aria-label="Primary navigation"
          >
            {enabledNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={navLinkClass}
                end={item.to === '/'}
              >
                {item.label}
              </NavLink>
            ))}
            {isFeatureEnabled('showFactsLink') && (
              <a href={FACTS_URL} className={MUTED_LINK_CLASS}>
                {FACTS_NAV_LABEL}
              </a>
            )}
            {isFeatureEnabled('showPortfolioLink') && (
              <a href={MAIN_SITE_URL} className={MUTED_LINK_CLASS}>
                {PORTFOLIO_NAV_LABEL}
              </a>
            )}
          </nav>

          <button
            className="flex size-10 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-black transition-colors duration-200 hover:text-primary md:hidden"
            type="button"
            aria-label="Open menu"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen((open) => !open)}
          >
            <span className="mdi mdi-menu text-2xl leading-none" aria-hidden="true" />
          </button>
        </div>
      </header>

      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50"
          onClick={() => setDrawerOpen(false)}
        >
          <div
            className="absolute top-0 right-0 h-full w-64 bg-white shadow-[0_20px_45px_rgba(15,23,42,0.18)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between px-4 pt-4">
              <h3 className="text-lg leading-normal font-bold text-ink">Menu</h3>
              <button
                className="size-6 cursor-pointer border-0 bg-transparent p-0 text-ink hover:text-primary"
                type="button"
                aria-label="Close menu"
                onClick={() => setDrawerOpen(false)}
              >
                <span className="mdi mdi-close text-2xl leading-none" aria-hidden="true" />
              </button>
            </div>
            <nav
              className="flex flex-col gap-4 px-4 pb-4"
              aria-label="Mobile navigation"
            >
              {enabledNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={navLinkClass}
                  end={item.to === '/'}
                  onClick={() => setDrawerOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}
              {isFeatureEnabled('showFactsLink') && (
                <a
                  href={FACTS_URL}
                  className={MUTED_LINK_CLASS}
                  onClick={() => setDrawerOpen(false)}
                >
                  {FACTS_NAV_LABEL}
                </a>
              )}
              {isFeatureEnabled('showPortfolioLink') && (
                <a
                  href={MAIN_SITE_URL}
                  className={MUTED_LINK_CLASS}
                  onClick={() => setDrawerOpen(false)}
                >
                  {PORTFOLIO_NAV_LABEL}
                </a>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
