// src/components/common/AppShell.jsx
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

function AppShell() {
  return (
    <div className="h-screen bg-canvas flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 px-8 pb-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}

export default AppShell