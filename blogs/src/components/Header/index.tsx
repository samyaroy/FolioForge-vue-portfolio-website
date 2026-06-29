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

function navLinkClass({ isActive }: { isActive: boolean }): string {
  return isActive
    ? 'site-header__link site-header__link--active'
    : 'site-header__link'
}

export function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const enabledNavItems = NAV_ITEMS.filter((item) => isFeatureEnabled(item.flag))

  return (
    <>
      <header className="site-header">
        <div className="site-header__brand" aria-label={SITE_PROFILE.name}>
          <span className="site-header__avatar">
            <img src={SITE_PROFILE.profileIconPath} alt="" />
          </span>
          <span>{SITE_PROFILE.name}</span>
        </div>

        <div className="site-header__nav-wrap">
          <nav className="site-header__nav" aria-label="Primary navigation">
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
              <a href={FACTS_URL} className="site-header__link">
                {FACTS_NAV_LABEL}
              </a>
            )}
            {isFeatureEnabled('showPortfolioLink') && (
              <a href={MAIN_SITE_URL} className="site-header__link site-header__link--muted">
                {PORTFOLIO_NAV_LABEL}
              </a>
            )}
          </nav>

          <button
            className="site-header__menu-button"
            type="button"
            aria-label="Open menu"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen((open) => !open)}
          >
            <span className="mdi mdi-menu" aria-hidden="true" />
          </button>
        </div>
      </header>

      {drawerOpen && (
        <div className="site-drawer" onClick={() => setDrawerOpen(false)}>
          <div
            className="site-drawer__panel"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="site-drawer__header">
              <h3>Menu</h3>
              <button
                className="site-drawer__close"
                type="button"
                aria-label="Close menu"
                onClick={() => setDrawerOpen(false)}
              >
                <span className="mdi mdi-close" aria-hidden="true" />
              </button>
            </div>
            <nav className="site-drawer__nav" aria-label="Mobile navigation">
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
                  className="site-header__link"
                  onClick={() => setDrawerOpen(false)}
                >
                  {FACTS_NAV_LABEL}
                </a>
              )}
              {isFeatureEnabled('showPortfolioLink') && (
                <a
                  href={MAIN_SITE_URL}
                  className="site-header__link site-header__link--muted"
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
