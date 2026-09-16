'use client'

// src/components/user/UserSidebar.tsx
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ClipboardList, Bell, User, History, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/user', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/user/test', label: 'Ikut Tes', icon: ClipboardList },
  { href: '/user/history', label: 'Riwayat Tes', icon: History },
  { href: '/user/notifications', label: 'Notifikasi', icon: Bell },
  { href: '/user/profile', label: 'Profil Saya', icon: User },
]

export default function UserSidebar() {
  const pathname = usePathname()

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="w-9 h-9 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-white text-sm leading-tight truncate">Portal Kandidat</p>
          <p className="text-brand-300 text-xs leading-tight truncate">PT. Solusi Datamart</p>
        </div>
      </div>

      <nav className="sidebar-nav py-6">
        {navItems.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn('sidebar-nav-item', active && 'active')}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="px-4 py-4 border-t border-brand-700">
        <div className="flex items-center gap-2 px-2 py-2 rounded-xl bg-brand-800/50">
          <div className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center text-xs font-bold text-white">K</div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-white truncate">Kandidat</p>
            <p className="text-xs text-brand-400 truncate">PT. SDI</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
