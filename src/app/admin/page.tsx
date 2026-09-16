// src/app/admin/page.tsx
// Admin Dashboard - Halaman utama admin
'use client'

import { useEffect, useState } from 'react'
import { 
  Users, Calendar, BookOpen, ClipboardCheck, 
  TrendingUp, UserCheck, UserX, Clock,
  ArrowUpRight, RefreshCw
} from 'lucide-react'
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'
import Link from 'next/link'

interface DashboardStats {
  totalCandidates: number
  pendingCandidates: number
  acceptedCandidates: number
  rejectedCandidates: number
  activeSchedules: number
  totalQuestions: number
  pendingGrading: number
}

interface DashboardData {
  stats: DashboardStats
  recentCandidates: any[]
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchData() {
    setLoading(true)
    try {
      const res = await fetch('/api/dashboard')
      const json = await res.json()
      setData(json)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const statCards = data ? [
    {
      label: 'Total Kandidat',
      value: data.stats.totalCandidates,
      icon: Users,
      color: 'bg-blue-100 text-blue-600',
      trend: '+12% bulan ini',
    },
    {
      label: 'Menunggu Seleksi',
      value: data.stats.pendingCandidates,
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-600',
      trend: 'Perlu ditindaklanjuti',
    },
    {
      label: 'Kandidat Diterima',
      value: data.stats.acceptedCandidates,
      icon: UserCheck,
      color: 'bg-green-100 text-green-600',
      trend: 'Sudah dikonfirmasi',
    },
    {
      label: 'Jadwal Tes Aktif',
      value: data.stats.activeSchedules,
      icon: Calendar,
      color: 'bg-purple-100 text-purple-600',
      trend: 'Sedang berjalan',
    },
    {
      label: 'Bank Soal',
      value: data.stats.totalQuestions,
      icon: BookOpen,
      color: 'bg-indigo-100 text-indigo-600',
      trend: 'Total soal tersedia',
    },
    {
      label: 'Menunggu Penilaian',
      value: data.stats.pendingGrading,
      icon: ClipboardCheck,
      color: 'bg-orange-100 text-orange-600',
      trend: data.stats.pendingGrading > 0 ? 'Perlu segera dinilai' : 'Semua sudah dinilai',
    },
  ] : []

  return (
    <div className="animate-fade-in">
      {/* Page title */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Ringkasan sistem seleksi calon karyawan</p>
        </div>
        <button onClick={fetchData} disabled={loading}
          className="btn-outline btn-sm">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="stat-card animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {statCards.map((card) => (
            <div key={card.label} className="stat-card group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">{card.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{card.trend}</p>
                </div>
                <div className={`stat-card-icon ${card.color}`}>
                  <card.icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Candidates */}
        <div className="card lg:col-span-2">
          <div className="card-header flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Kandidat Terbaru</h2>
              <p className="text-xs text-gray-400 mt-0.5">5 kandidat terbaru yang mendaftar</p>
            </div>
            <Link href="/admin/candidates" className="btn-outline btn-sm">
              Lihat Semua <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Posisi</th>
                  <th>Tanggal Daftar</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(4)].map((_, j) => (
                        <td key={j}><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                      ))}
                    </tr>
                  ))
                ) : data?.recentCandidates.length === 0 ? (
                  <tr><td colSpan={4} className="text-center text-gray-400 py-8">Belum ada kandidat</td></tr>
                ) : (
                  data?.recentCandidates.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <div>
                          <p className="font-medium text-gray-900">{c.fullName}</p>
                          <p className="text-xs text-gray-400">{c.user?.email}</p>
                        </div>
                      </td>
                      <td className="text-gray-600">{c.position || '-'}</td>
                      <td className="text-gray-500 text-xs">{formatDate(c.createdAt)}</td>
                      <td>
                        <span className={`badge ${getStatusColor(c.status)}`}>
                          {getStatusLabel(c.status)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h2 className="font-semibold text-gray-900">Aksi Cepat</h2>
          </div>
          <div className="card-body space-y-2">
            {[
              { href: '/admin/candidates', label: 'Kelola Kandidat', icon: Users, desc: 'Lihat dan kelola data pelamar' },
              { href: '/admin/schedule/add', label: 'Buat Jadwal Tes', icon: Calendar, desc: 'Jadwalkan tes seleksi baru' },
              { href: '/admin/questions/add', label: 'Tambah Soal', icon: BookOpen, desc: 'Tambahkan soal ke bank soal' },
              { href: '/admin/results', label: 'Nilai Jawaban', icon: ClipboardCheck, desc: 'Nilai jawaban essay kandidat' },
              { href: '/admin/notifications', label: 'Kirim Notifikasi', icon: TrendingUp, desc: 'Notifikasi ke kandidat' },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
              >
                <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <action.icon className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{action.label}</p>
                  <p className="text-xs text-gray-400">{action.desc}</p>
                </div>
                <ArrowUpRight className="w-3 h-3 text-gray-300 ml-auto group-hover:text-blue-500" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
