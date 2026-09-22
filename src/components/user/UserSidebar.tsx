'use client'

// src/components/user/UserSidebar.tsx
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ClipboardList, Bell, User, History, ChevronRight, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

type NavItem = {
  href: string
  label: string
  icon: LucideIcon
  exact?: boolean
}

type NavGroup = {
  group: string
  items: NavItem[]
}

const navItems: NavGroup[] = [
  {
    group: '',
    items: [
      { href: '/user', label: 'Dashboard', icon: LayoutDashboard, exact: true },
      { href: '/user/test', label: 'Ikut Tes', icon: ClipboardList },
      { href: '/user/history', label: 'Riwayat Tes', icon: History },
      { href: '/user/notifications', label: 'Notifikasi', icon: Bell },
      { href: '/user/profile', label: 'Profil Saya', icon: User },
    ]
  },
]

interface UserSidebarProps {
  isOpen: boolean
  toggleSidebar: () => void
}

export default function UserSidebar({ isOpen, toggleSidebar }: UserSidebarProps) {
  const pathname = usePathname()

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <aside 
      className={cn(
        "bg-gradient-to-b from-brand-900 to-brand-800 text-white flex flex-col h-full transition-all duration-300 relative shrink-0 z-20 shadow-lg",
        isOpen ? "w-64" : "w-16"
      )}
    >
      {/* Toggle Button */}
      <button 
        onClick={toggleSidebar}
        className="absolute -right-3 top-6 bg-white text-gray-500 rounded-full border border-gray-200 shadow-sm p-1 hover:text-green-600 focus:outline-none z-30"
      >
        {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 overflow-x-hidden scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        {navItems.map((group, groupIndex) => (
          <div key={groupIndex} className="mb-6">
            {group.group && isOpen && (
              <p className="px-6 py-2 text-[10px] font-bold text-brand-200 uppercase tracking-wider">
                {group.group}
              </p>
            )}
            {group.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                title={!isOpen ? item.label : undefined}
                className={cn(
                  'flex items-center gap-4 px-6 py-3 transition-colors duration-200 relative rounded-r-xl',
                  isActive(item.href, item.exact) 
                    ? 'bg-white/10 text-white' 
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                )}
              >
                {isActive(item.href, item.exact) && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-white rounded-r-md"></div>
                )}
                <item.icon className="w-5 h-5 shrink-0" />
                {isOpen && <span className="text-sm whitespace-nowrap">{item.label}</span>}
              </Link>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  )
}
