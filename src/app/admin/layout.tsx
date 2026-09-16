// src/app/admin/layout.tsx
// Admin layout with sidebar navigation

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s | Admin - Sistem Seleksi Karyawan' },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  
  if (!session) redirect('/login')
  if (session.user.role !== 'ADMIN') redirect('/user')

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 ml-64">
        <AdminHeader user={session.user} />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
