// src/app/admin/question-codes/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { Plus, FileText, BookOpen, Calendar, Trash2, ChevronRight } from 'lucide-react'
import { formatDate, generateCode } from '@/lib/utils'
import Link from 'next/link'

export default function QuestionCodesPage() {
  const [codes, setCodes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ code: '', title: '', description: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCodes()
  }, [])

  async function fetchCodes() {
    setLoading(true)
    const res = await fetch('/api/question-codes')
    const data = await res.json()
    setCodes(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  function openModal() {
    setForm({ code: generateCode('PKT'), title: '', description: '' })
    setError('')
    setShowModal(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/question-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Gagal menyimpan'); return }
      setShowModal(false)
      fetchCodes()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Paket Soal</h1>
          <p className="text-gray-500 text-sm">Kelompokkan soal ke dalam paket untuk jadwal tes</p>
        </div>
        <button onClick={openModal} className="btn-primary">
          <Plus className="w-4 h-4" /> Buat Paket Soal
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-full" />
            </div>
          ))}
        </div>
      ) : codes.length === 0 ? (
        <div className="card p-16 text-center">
          <FileText className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-gray-600 font-medium">Belum ada paket soal</h3>
          <p className="text-gray-400 text-sm mt-1">Buat paket soal untuk mengelompokkan soal-soal tes</p>
          <button onClick={openModal} className="btn-primary mt-4 mx-auto">
            <Plus className="w-4 h-4" /> Buat Paket Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {codes.map((qc) => (
            <div key={qc.id} className="card hover:shadow-md transition-shadow cursor-pointer group">
              <div className="card-body">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">{qc.code}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{qc.title}</h3>
                {qc.description && <p className="text-sm text-gray-400 line-clamp-2 mb-3">{qc.description}</p>}
                <div className="flex items-center gap-4 text-xs text-gray-500 pt-3 border-t border-gray-100">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3" /> {qc._count?.questions || 0} soal
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {qc._count?.testSchedules || 0} jadwal
                  </span>
                </div>
                <Link href={`/admin/questions?questionCodeId=${qc.id}`}
                  className="flex items-center gap-1 text-xs text-blue-600 mt-2 hover:underline">
                  Lihat soal <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="font-semibold text-gray-900">Buat Paket Soal</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body py-4">
                {error && <div className="alert-error text-sm mb-3 py-2">{error}</div>}
                <div className="mb-3">
                  <label className="form-label">Kode Paket <span className="text-red-500">*</span></label>
                  <input type="text" value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))}
                    className="form-input font-mono py-1.5" placeholder="PKT-001" required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Nama Paket <span className="text-red-500">*</span></label>
                  <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                    className="form-input py-1.5" placeholder="Tes Developer - Batch 1" required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Deskripsi</label>
                  <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    className="form-textarea py-1.5 text-sm" rows={2} placeholder="Opsional..." />
                </div>
              </div>
              <div className="modal-footer py-3">
                <button type="button" onClick={() => setShowModal(false)} className="btn-outline">Batal</button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
