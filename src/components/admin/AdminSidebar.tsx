'use client'

// src/components/admin/AdminSidebar.tsx
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, Users, BookOpen, Calendar, 
  ClipboardCheck, Bell, Settings, Building2, 
  UserCog, FileText, ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  {
    group: 'Utama',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    ]
  },
  {
    group: 'Seleksi',
    items: [
      { href: '/admin/candidates', label: 'Data Kandidat', icon: Users },
      { href: '/admin/schedule', label: 'Jadwal Tes', icon: Calendar },
      { href: '/admin/results', label: 'Hasil Seleksi', icon: ClipboardCheck },
    ]
  },
  {
    group: 'Soal',
    items: [
      { href: '/admin/questions', label: 'Bank Soal', icon: BookOpen },
      { href: '/admin/question-codes', label: 'Paket Soal', icon: FileText },
    ]
  },
  {
    group: 'Manajemen',
    items: [
      { href: '/admin/notifications', label: 'Notifikasi', icon: Bell },
      { href: '/admin/users', label: 'Manajemen User', icon: UserCog },
      { href: '/admin/company', label: 'Data Perusahaan', icon: Building2 },
    ]
  },
  {
    group: 'Akun',
    items: [
      { href: '/admin/profile', label: 'Profil', icon: Settings },
    ]
  },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-white text-sm leading-tight truncate">Sistem Seleksi</p>
          <p className="text-brand-300 text-xs leading-tight truncate">PT. Solusi Datamart</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((group) => (
          <div key={group.group} className="mb-2">
            <p className="sidebar-nav-group">{group.group}</p>
            {group.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'sidebar-nav-item',
                  isActive(item.href, item.exact) && 'active'
                )}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
                {isActive(item.href, item.exact) && (
                  <ChevronRight className="w-3 h-3 opacity-60" />
                )}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-brand-700">
        <div className="flex items-center gap-2 px-2 py-2 rounded-xl bg-brand-800/50">
          <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center text-xs font-bold text-white">
            A
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-white truncate">Admin HRD</p>
            <p className="text-xs text-brand-400 truncate">PT. SDI</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
