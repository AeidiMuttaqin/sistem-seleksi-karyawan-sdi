// src/app/admin/layout.tsx
// Admin layout with sidebar navigation

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminLayoutWrapper from '@/components/admin/AdminLayoutWrapper'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s | Admin - Sistem Seleksi Karyawan' },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  
  if (!session) redirect('/login')
  if (session.user.role !== 'ADMIN') redirect('/user')

  return (
    <AdminLayoutWrapper user={session.user}>
      {children}
    </AdminLayoutWrapper>
  )
}
