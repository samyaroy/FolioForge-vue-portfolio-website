import { Outlet, ScrollRestoration } from 'react-router-dom'
import { Footer } from './Footer'
import { Header } from './Header'

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-page">
      <Header />

      {/* Container matches the root site's page shell
          (mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-8) so headings land
          in the same position across both apps. */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <Footer />

      <ScrollRestoration />
    </div>
  )
}
