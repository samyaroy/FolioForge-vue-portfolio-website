import { Outlet, ScrollRestoration } from 'react-router-dom'
import { Footer } from './Footer'
import { Header } from './Header'

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-page">
      <Header />

      <main className="mx-auto w-full max-w-300 flex-1 px-4 pt-8 pb-16 md:px-8 lg:px-20 lg:pt-10 lg:pb-20">
        <Outlet />
      </main>

      <Footer />

      <ScrollRestoration />
    </div>
  )
}
