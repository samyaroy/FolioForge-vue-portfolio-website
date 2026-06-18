import { Link, Outlet, ScrollRestoration } from 'react-router-dom'

const MAIN_SITE = 'https://samyabrata.codeium.xyz'

export function Layout() {
  return (
    <div className="page">
      <header className="site-header">
        <div className="container site-header__inner">
          <Link to="/" className="site-header__brand">
            Samyabrata&apos;s Blog
          </Link>
          <nav className="site-header__nav">
            <a href={MAIN_SITE}>← Portfolio</a>
          </nav>
        </div>
      </header>

      <main className="container site-main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container">
          © {new Date().getFullYear()} Samyabrata Roy ·{' '}
          <a href={MAIN_SITE}>samyabrata.codeium.xyz</a>
        </div>
      </footer>

      <ScrollRestoration />
    </div>
  )
}
