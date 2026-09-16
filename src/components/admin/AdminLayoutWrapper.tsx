'use client'

import { useState } from 'react'
import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'

export default function AdminLayoutWrapper({
  children,
  user
}: {
  children: React.ReactNode
  user: any
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      <AdminHeader user={user} />
      
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className={`flex-1 overflow-y-auto bg-gray-50 p-6 transition-all duration-300`}>
          {children}
        </main>
      </div>
    </div>
  )
}
