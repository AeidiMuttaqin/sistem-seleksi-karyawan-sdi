// src/app/user/page.tsx
// User Dashboard - Kandidat

'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { ClipboardList, Bell, User, ArrowRight, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { formatDate, formatDateTime, getStatusColor, getStatusLabel } from '@/lib/utils'

export default function UserDashboardPage() {
  const { data: session } = useSession()
  const [candidate, setCandidate] = useState<any>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session?.user?.id) return
    Promise.all([
      fetch(`/api/candidates/${session.user.id}`).then(r => r.json()),
      fetch('/api/notifications').then(r => r.json()),
    ]).then(([cand, notifs]) => {
      setCandidate(cand)
      setNotifications(Array.isArray(notifs) ? notifs.slice(0, 3) : [])
    }).finally(() => setLoading(false))
  }, [session])

  const tests = candidate?.candidateTests || []
  const lastTest = tests[0]
  const unreadNotifs = notifications.filter((n: any) => !n.isRead).length

  function getStatusIcon(status: string) {
    if (status === 'ACCEPTED') return <CheckCircle className="w-5 h-5 text-green-600" />
    if (status === 'REJECTED') return <AlertCircle className="w-5 h-5 text-red-500" />
    return <Clock className="w-5 h-5 text-yellow-500" />
  }

  return (
    <div className="animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-800 to-blue-600 rounded-2xl p-6 mb-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-blue-200 text-sm mb-1">Selamat datang,</p>
            <h1 className="text-2xl font-bold">
              {loading ? '...' : candidate?.fullName || session?.user?.name || 'Kandidat'}
            </h1>
            <p className="text-blue-200 text-sm mt-1">
              {candidate?.position ? `Melamar sebagai ${candidate.position}` : 'Lengkapi profil Anda untuk memulai'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-blue-200 text-xs">Status Lamaran</p>
            {candidate ? (
              <span className={`badge mt-1 ${getStatusColor(candidate.status)} text-sm px-3`}>
                {getStatusLabel(candidate.status)}
              </span>
            ) : (
              <span className="badge bg-white/20 text-white text-sm px-3 mt-1">—</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick actions */}
        <div className="lg:col-span-2 space-y-4">
          {/* Quick action cards */}
          <div className="grid grid-cols-2 gap-4">
            <Link href="/user/test" className="card p-5 hover:shadow-md transition-all group hover:border-blue-200">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-blue-600 transition-colors">
                <ClipboardList className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-semibold text-gray-900">Ikut Tes</h3>
              <p className="text-sm text-gray-400 mt-0.5">Masukkan kode tes untuk memulai</p>
              <span className="flex items-center gap-1 text-blue-600 text-sm mt-3">
                Mulai <ArrowRight className="w-3 h-3" />
              </span>
            </Link>

            <Link href="/user/history" className="card p-5 hover:shadow-md transition-all group hover:border-green-200">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-green-600 transition-colors">
                <CheckCircle className="w-5 h-5 text-green-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-semibold text-gray-900">Riwayat Tes</h3>
              <p className="text-sm text-gray-400 mt-0.5">{tests.length} tes diikuti</p>
              <span className="flex items-center gap-1 text-green-600 text-sm mt-3">
                Lihat <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          </div>

          {/* Last test result */}
          {lastTest && (
            <div className="card">
              <div className="card-header">
                <h2 className="font-semibold text-gray-900">Tes Terakhir</h2>
              </div>
              <div className="card-body">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    {getStatusIcon(lastTest.status)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{lastTest.testSchedule?.title}</h3>
                    <p className="text-sm text-gray-400">Kode: {lastTest.testSchedule?.codeTest}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`badge ${getStatusColor(lastTest.status)}`}>
                        {getStatusLabel(lastTest.status)}
                      </span>
                      {lastTest.testResult && (
                        <span className={`badge ${getStatusColor(lastTest.testResult.status)}`}>
                          {lastTest.testResult.totalScore}/{lastTest.testResult.maxScore} poin ({lastTest.testResult.percentage?.toFixed(1)}%)
                        </span>
                      )}
                    </div>
                    {lastTest.submittedAt && (
                      <p className="text-xs text-gray-400 mt-1">
                        Dikumpulkan: {formatDateTime(lastTest.submittedAt)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Profile completeness */}
          {candidate && (
            <div className="card">
              <div className="card-header">
                <h2 className="font-semibold text-gray-900">Kelengkapan Profil</h2>
              </div>
              <div className="card-body">
                {(() => {
                  const fields = ['fullName', 'phone', 'address', 'birthDate', 'gender', 'education', 'major', 'institution', 'experience', 'position']
                  const filled = fields.filter(f => candidate[f])
                  const pct = Math.round((filled.length / fields.length) * 100)
                  return (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">{filled.length} dari {fields.length} field terisi</span>
                        <span className="font-bold text-blue-600">{pct}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      {pct < 100 && (
                        <Link href="/user/profile" className="btn-outline btn-sm mt-3">
                          <User className="w-3 h-3" /> Lengkapi Profil
                        </Link>
                      )}
                    </div>
                  )
                })()}
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-gray-900">Notifikasi</h2>
              {unreadNotifs > 0 && (
                <span className="w-5 h-5 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center">{unreadNotifs}</span>
              )}
            </div>
            <Link href="/user/notifications" className="text-xs text-blue-600 hover:underline">Lihat semua</Link>
          </div>
          <div className="card-body space-y-3">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-100 rounded w-3/4 mb-1" />
                  <div className="h-3 bg-gray-50 rounded w-full" />
                </div>
              ))
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Belum ada notifikasi</p>
              </div>
            ) : (
              notifications.map((n: any) => (
                <div key={n.id} className={`p-3 rounded-xl border transition-colors ${n.isRead ? 'border-gray-100' : 'border-blue-200 bg-blue-50'}`}>
                  {!n.isRead && <span className="w-2 h-2 bg-blue-500 rounded-full inline-block mr-2" />}
                  <p className="text-sm font-medium text-gray-900">{n.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(n.createdAt)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
