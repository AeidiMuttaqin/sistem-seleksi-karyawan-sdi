// src/app/user/notifications/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { Bell, CheckCheck } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

const TYPE_ICONS: Record<string, string> = {
  GENERAL: '📢',
  TEST_INVITATION: '📋',
  TEST_RESULT: '🏆',
  SELECTION_UPDATE: '🔄',
  SYSTEM: '⚙️',
}

export default function UserNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchNotifications() }, [])

  async function fetchNotifications() {
    setLoading(true)
    const res = await fetch('/api/notifications')
    const data = await res.json()
    setNotifications(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  async function markAllRead() {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [] }),
    })
    fetchNotifications()
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="animate-fade-in max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifikasi</h1>
          <p className="text-gray-500 text-sm">{unreadCount > 0 ? `${unreadCount} notifikasi belum dibaca` : 'Semua sudah dibaca'}</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="btn-outline btn-sm">
            <CheckCheck className="w-4 h-4" /> Tandai Semua Dibaca
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => (
          <div key={i} className="card p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-100 rounded w-full" />
          </div>
        ))}</div>
      ) : notifications.length === 0 ? (
        <div className="card p-16 text-center">
          <Bell className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-gray-600 font-medium">Belum ada notifikasi</h3>
          <p className="text-gray-400 text-sm">Notifikasi dari HRD akan muncul di sini</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div key={n.id} className={`card p-4 transition-colors ${!n.isRead ? 'border-blue-200 bg-blue-50/50' : ''}`}>
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{TYPE_ICONS[n.type] || '🔔'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={`font-semibold ${!n.isRead ? 'text-blue-900' : 'text-gray-900'}`}>
                      {!n.isRead && <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2 align-middle" />}
                      {n.title}
                    </h3>
                    <span className="text-xs text-gray-400 flex-shrink-0">{formatDateTime(n.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
