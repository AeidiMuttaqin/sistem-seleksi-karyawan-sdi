// src/app/admin/candidates/page.tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import { Search, Plus, Eye, Trash2, Filter, Download, Users } from 'lucide-react'
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'
import Link from 'next/link'
import type { Metadata } from 'next'

const STATUS_OPTIONS = ['', 'PENDING', 'REVIEWING', 'ACCEPTED', 'REJECTED']

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchCandidates = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ search, status, page: String(page), limit: '10' })
      const res = await fetch(`/api/candidates?${params}`)
      const data = await res.json()
      setCandidates(data.data || [])
      setTotal(data.total || 0)
      setTotalPages(data.totalPages || 1)
    } finally {
      setLoading(false)
    }
  }, [search, status, page])

  useEffect(() => { fetchCandidates() }, [fetchCandidates])

  async function handleDelete(id: string) {
    if (!confirm('Hapus kandidat ini?')) return
    await fetch(`/api/candidates/${id}`, { method: 'DELETE' })
    fetchCandidates()
  }

  async function handleStatusChange(id: string, newStatus: string) {
    await fetch(`/api/candidates/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    fetchCandidates()
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Data Kandidat</h1>
        <p className="text-gray-500 text-sm mt-1">Total {total} kandidat terdaftar</p>
      </div>
      
      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        {/* Left: Search */}
        <div className="w-full sm:w-auto flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama, posisi, atau email..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="form-input pl-9 w-full"
          />
        </div>
        
        {/* Right: Filter & Add */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-44">
            <select
              value={status}
              onChange={e => { setStatus(e.target.value); setPage(1) }}
              className="form-select w-full"
            >
              <option value="">Semua Status</option>
              {STATUS_OPTIONS.filter(Boolean).map(s => (
                <option key={s} value={s}>{getStatusLabel(s)}</option>
              ))}
            </select>
          </div>
          <Link href="/admin/candidates/add" className="btn-primary whitespace-nowrap">
            <Plus className="w-4 h-4" /> Tambah Kandidat
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Kandidat</th>
                <th>Posisi Dilamar</th>
                <th>Pendidikan</th>
                <th>Tanggal Daftar</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j}><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : candidates.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="text-center py-12">
                      <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                      <p className="text-gray-400">Tidak ada kandidat ditemukan</p>
                    </div>
                  </td>
                </tr>
              ) : (
                candidates.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div>
                        <p className="font-semibold text-gray-900">{c.fullName}</p>
                        <p className="text-xs text-gray-400">{c.user?.email}</p>
                        {c.phone && <p className="text-xs text-gray-400">{c.phone}</p>}
                      </div>
                    </td>
                    <td className="text-gray-700">{c.position || <span className="text-gray-300">-</span>}</td>
                    <td>
                      <div>
                        <p className="text-sm">{c.education || '-'}</p>
                        <p className="text-xs text-gray-400">{c.institution || ''}</p>
                      </div>
                    </td>
                    <td className="text-gray-500 text-sm">{formatDate(c.createdAt)}</td>
                    <td>
                      <select
                        value={c.status}
                        onChange={e => handleStatusChange(c.id, e.target.value)}
                        className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${getStatusColor(c.status)}`}
                      >
                        {STATUS_OPTIONS.filter(Boolean).map(s => (
                          <option key={s} value={s}>{getStatusLabel(s)}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/candidates/${c.id}`}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors" title="Detail">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button onClick={() => handleDelete(c.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors" title="Hapus">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Menampilkan {candidates.length} dari {total} kandidat
            </p>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="btn-outline btn-sm disabled:opacity-40">Sebelumnya</button>
              <span className="btn btn-sm bg-gray-100">{page}/{totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="btn-outline btn-sm disabled:opacity-40">Berikutnya</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
