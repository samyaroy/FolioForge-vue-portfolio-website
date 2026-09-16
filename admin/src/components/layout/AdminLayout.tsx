import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { VisibilityProvider } from '@/components/admin/VisibilityProvider'
import { LogoProvider } from '@/components/admin/LogoProvider'

export function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <VisibilityProvider><LogoProvider><div className="admin-shell">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="workspace">
        <Topbar onOpenNavigation={() => setIsSidebarOpen(true)} />
        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div></LogoProvider></VisibilityProvider>
  )
}
