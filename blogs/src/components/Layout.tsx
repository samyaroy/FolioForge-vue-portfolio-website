import { Outlet, ScrollRestoration } from 'react-router-dom'
import { Footer } from './Footer'
import { Header } from './Header'

export function Layout() {
  return (
    <div className="page">
      <Header />

      <main className="container site-main">
        <Outlet />
      </main>

      <Footer />

      <ScrollRestoration />
    </div>
  )
}
