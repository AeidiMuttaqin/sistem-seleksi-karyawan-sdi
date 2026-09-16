// src/app/admin/questions/page.tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import { Search, Plus, Edit2, Trash2, BookOpen, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { getStatusLabel, truncateText } from '@/lib/utils'

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [type, setType] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const fetchQuestions = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ search, type, page: String(page), limit: '10' })
    const res = await fetch(`/api/questions?${params}`)
    const data = await res.json()
    setQuestions(data.data || [])
    setTotal(data.total || 0)
    setTotalPages(data.totalPages || 1)
    setLoading(false)
  }, [search, type, page])

  useEffect(() => { fetchQuestions() }, [fetchQuestions])

  async function handleDelete(id: string) {
    if (!confirm('Hapus soal ini?')) return
    await fetch(`/api/questions/${id}`, { method: 'DELETE' })
    fetchQuestions()
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bank Soal</h1>
          <p className="text-gray-500 text-sm">Total {total} soal tersedia</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/question-codes" className="btn-outline">
            <BookOpen className="w-4 h-4" /> Paket Soal
          </Link>
          <Link href="/admin/questions/add" className="btn-primary">
            <Plus className="w-4 h-4" /> Tambah Soal
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body flex flex-wrap gap-3">
          <div className="flex-1 min-w-48 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text" placeholder="Cari soal..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="form-input pl-9"
            />
          </div>
          <select value={type} onChange={e => { setType(e.target.value); setPage(1) }} className="form-select w-44">
            <option value="">Semua Tipe</option>
            <option value="MULTIPLE_CHOICE">Pilihan Ganda</option>
            <option value="ESSAY">Essay</option>
          </select>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Pertanyaan</th>
                <th>Tipe</th>
                <th>Paket Soal</th>
                <th>Poin</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>{[...Array(6)].map((_, j) => (
                    <td key={j}><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                  ))}</tr>
                ))
              ) : questions.length === 0 ? (
                <tr><td colSpan={6}>
                  <div className="text-center py-12">
                    <BookOpen className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400">Belum ada soal. Tambahkan soal pertama!</p>
                  </div>
                </td></tr>
              ) : (
                questions.map((q, idx) => (
                  <tr key={q.id}>
                    <td className="text-gray-400 text-sm">{(page - 1) * 10 + idx + 1}</td>
                    <td className="max-w-sm">
                      <p className="text-sm text-gray-800 leading-relaxed">{truncateText(q.content, 120)}</p>
                      {q.type === 'MULTIPLE_CHOICE' && (
                        <p className="text-xs text-gray-400 mt-1">{q.options?.length || 0} pilihan jawaban</p>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${q.type === 'MULTIPLE_CHOICE' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                        {q.type === 'MULTIPLE_CHOICE' ? 'Pilihan Ganda' : 'Essay'}
                      </span>
                    </td>
                    <td className="text-sm text-gray-600">
                      {q.questionCode ? (
                        <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{q.questionCode.code}</span>
                      ) : '-'}
                    </td>
                    <td className="font-semibold text-gray-700">{q.point}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <Link href={`/admin/questions/${q.id}/edit`}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button onClick={() => handleDelete(q.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors">
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

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">Halaman {page} dari {totalPages}</p>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="btn-outline btn-sm">Sebelumnya</button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="btn-outline btn-sm">Berikutnya</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
