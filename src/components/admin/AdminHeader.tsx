'use client'

// src/components/admin/AdminHeader.tsx
import { signOut } from 'next-auth/react'
import { Bell, LogOut, User, ChevronDown, Building2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface AdminHeaderProps {
  user: { name?: string | null; email?: string | null; role?: string }
}

export default function AdminHeader({ user }: AdminHeaderProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).toUpperCase()

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between z-30 shadow-sm shrink-0">
      {/* Logo Area */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <div className="flex flex-col">
          <h2 className="font-semibold text-gray-800 text-sm">Panel Administrasi</h2>
          <p className="text-xs text-gray-500">PT. Solusi Datamart Indonesia</p>
        </div>
      </div>

      {/* Center Date */}
      <div className="hidden md:block text-xs font-medium text-gray-500 tracking-wider">
        {currentDate}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Link href="/admin/notifications" className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
          <Bell className="w-5 h-5 text-gray-500" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          )}
        </Link>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-3 p-1 pr-2 rounded-full hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
          >
            <div className="flex flex-col items-end">
              <span className="text-sm font-semibold text-gray-700">{user.name || 'Admin'}</span>
              <span className="text-xs text-gray-500">{user.email || 'admin@perusahaan.com'}</span>
            </div>
            <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
              <User className="w-5 h-5 text-gray-500" />
            </div>
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
              <Link
                href="/admin/profile"
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setShowMenu(false)}
              >
                <User className="w-4 h-4" />
                Profil Saya
              </Link>
              <hr className="my-1 border-gray-100" />
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
