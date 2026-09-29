// src/app/user/layout.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import UserLayoutWrapper from '@/components/user/UserLayoutWrapper'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { default: 'Dashboard Kandidat', template: '%s | Portal Kandidat' },
}

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  
  if (!session) redirect('/login')
  if (session.user.role === 'ADMIN') redirect('/admin')

  return (
    <UserLayoutWrapper user={session.user}>
      {children}
    </UserLayoutWrapper>
  )
}
