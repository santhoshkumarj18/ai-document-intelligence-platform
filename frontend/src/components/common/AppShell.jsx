// src/components/common/AppShell.jsx
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

function AppShell() {
  return (
    <div className="min-h-screen bg-canvas flex">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}

export default AppShell