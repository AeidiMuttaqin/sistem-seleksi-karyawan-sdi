// src/app/admin/schedule/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { Plus, Calendar, Clock, Users, Eye, Trash2, Toggle } from 'lucide-react'
import Link from 'next/link'
import { formatDateTime } from '@/lib/utils'

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchSchedules() }, [])

  async function fetchSchedules() {
    setLoading(true)
    const res = await fetch('/api/schedule')
    const data = await res.json()
    setSchedules(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  async function handleToggleActive(id: string, current: boolean) {
    await fetch(`/api/schedule/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !current }),
    })
    fetchSchedules()
  }

  async function handleDelete(id: string) {
    if (!confirm('Hapus jadwal ini?')) return
    await fetch(`/api/schedule/${id}`, { method: 'DELETE' })
    fetchSchedules()
  }

  function getScheduleStatus(s: any) {
    const now = new Date()
    if (!s.active) return { label: 'Nonaktif', color: 'bg-gray-100 text-gray-600' }
    if (now < new Date(s.startTime)) return { label: 'Belum Mulai', color: 'bg-yellow-100 text-yellow-700' }
    if (now > new Date(s.endTime)) return { label: 'Sudah Berakhir', color: 'bg-red-100 text-red-700' }
    return { label: 'Aktif', color: 'bg-green-100 text-green-700' }
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jadwal Tes</h1>
          <p className="text-gray-500 text-sm">Kelola jadwal tes seleksi kandidat</p>
        </div>
        <Link href="/admin/schedule/add" className="btn-primary">
          <Plus className="w-4 h-4" /> Buat Jadwal
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : schedules.length === 0 ? (
        <div className="card p-16 text-center">
          <Calendar className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-gray-600 font-medium">Belum ada jadwal tes</h3>
          <Link href="/admin/schedule/add" className="btn-primary mt-4 inline-flex">
            <Plus className="w-4 h-4" /> Buat Jadwal Tes
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {schedules.map((s) => {
            const status = getScheduleStatus(s)
            return (
              <div key={s.id} className="card hover:shadow-md transition-shadow">
                <div className="card-body">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{s.title}</h3>
                          <span className={`badge ${status.color}`}>{status.label}</span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <span className="font-mono text-blue-600 text-xs bg-blue-50 px-2 py-0.5 rounded">
                              {s.codeTest}
                            </span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {s.duration} menit
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" /> {s._count?.candidateTests || 0} peserta
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-gray-400">
                          <span>Mulai: {formatDateTime(s.startTime)}</span>
                          <span className="mx-2">—</span>
                          <span>Berakhir: {formatDateTime(s.endTime)}</span>
                        </div>
                        {s.questionCode && (
                          <div className="mt-1 text-xs text-gray-400">
                            Paket soal: <span className="font-medium text-gray-600">{s.questionCode.title}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleToggleActive(s.id, s.active)}
                        className={`btn-sm ${s.active ? 'btn-outline text-orange-600' : 'btn-success'}`}
                        title={s.active ? 'Nonaktifkan' : 'Aktifkan'}
                      >
                        {s.active ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                      <button onClick={() => handleDelete(s.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
