'use client'

// src/components/user/UserHeader.tsx
import { signOut } from 'next-auth/react'
import { Bell, LogOut, User, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

interface UserHeaderProps {
  user: { name?: string | null; email?: string | null }
}

export default function UserHeader({ user }: UserHeaderProps) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div>
        <h2 className="font-semibold text-gray-800 text-sm">Portal Kandidat</h2>
        <p className="text-xs text-gray-400">PT. Solusi Datamart Indonesia</p>
      </div>
      <div className="flex items-center gap-3">
        <Link href="/user/notifications" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Bell className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700">{user.name || 'Kandidat'}</span>
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
              <Link href="/user/profile"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setShowMenu(false)}>
                <User className="w-4 h-4" /> Profil Saya
              </Link>
              <hr className="my-1" />
              <button onClick={() => signOut({ callbackUrl: '/login' })}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                <LogOut className="w-4 h-4" /> Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
