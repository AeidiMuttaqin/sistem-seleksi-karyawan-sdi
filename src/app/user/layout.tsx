// src/app/user/layout.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import UserSidebar from '@/components/user/UserSidebar'
import UserHeader from '@/components/user/UserHeader'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { default: 'Dashboard Kandidat', template: '%s | Portal Kandidat' },
}

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  
  if (!session) redirect('/login')
  if (session.user.role === 'ADMIN') redirect('/admin')

  return (
    <div className="flex min-h-screen bg-gray-50">
      <UserSidebar />
      <div className="flex-1 ml-64">
        <UserHeader user={session.user} />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
