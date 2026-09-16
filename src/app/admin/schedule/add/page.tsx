// src/app/admin/schedule/add/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, CheckCircle, AlertCircle, Calendar } from 'lucide-react'
import Link from 'next/link'
import { generateCode } from '@/lib/utils'

export default function AddSchedulePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [questionCodes, setQuestionCodes] = useState<any[]>([])
  const [form, setForm] = useState({
    title: '',
    codeTest: generateCode('SDI'),
    questionCodeId: '',
    startTime: '',
    endTime: '',
    duration: '90',
  })

  useEffect(() => {
    fetch('/api/question-codes').then(r => r.json()).then(data => {
      setQuestionCodes(Array.isArray(data) ? data : [])
    })
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.title || !form.codeTest || !form.questionCodeId || !form.startTime || !form.endTime) {
      setError('Semua field wajib diisi')
      return
    }
    if (new Date(form.startTime) >= new Date(form.endTime)) {
      setError('Waktu mulai harus lebih awal dari waktu berakhir')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Gagal menyimpan'); return }
      setSuccess(true)
      setTimeout(() => router.push('/admin/schedule'), 1500)
    } catch {
      setError('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in max-w-2xl">
      <div className="mb-6">
        <Link href="/admin/schedule" className="btn-outline btn-sm">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Link>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Buat Jadwal Tes</h1>
              <p className="text-sm text-gray-400">Atur jadwal dan informasi tes seleksi</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card-body space-y-5">
          {success && (
            <div className="alert-success">
              <CheckCircle className="w-5 h-5" /> Jadwal berhasil dibuat!
            </div>
          )}
          {error && (
            <div className="alert-error">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Nama Tes <span className="text-red-500">*</span></label>
            <input type="text" name="title" value={form.title} onChange={handleChange}
              className="form-input" placeholder="Tes Seleksi Developer - Batch 1" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Kode Tes <span className="text-red-500">*</span></label>
              <input type="text" name="codeTest" value={form.codeTest} onChange={handleChange}
                className="form-input font-mono" placeholder="SDI-2026-001" required />
              <p className="form-error">Kode ini dibagikan ke kandidat</p>
            </div>
            <div className="form-group">
              <label className="form-label">Durasi (menit) <span className="text-red-500">*</span></label>
              <input type="number" name="duration" value={form.duration} onChange={handleChange}
                className="form-input" min="10" max="480" required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Paket Soal <span className="text-red-500">*</span></label>
            <select name="questionCodeId" value={form.questionCodeId} onChange={handleChange}
              className="form-select" required>
              <option value="">-- Pilih paket soal --</option>
              {questionCodes.map((qc: any) => (
                <option key={qc.id} value={qc.id}>{qc.code} — {qc.title}</option>
              ))}
            </select>
            {questionCodes.length === 0 && (
              <p className="text-xs text-orange-500 mt-1">
                Belum ada paket soal. <Link href="/admin/question-codes" className="underline">Buat paket soal dulu.</Link>
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Waktu Mulai <span className="text-red-500">*</span></label>
              <input type="datetime-local" name="startTime" value={form.startTime} onChange={handleChange}
                className="form-input" required />
            </div>
            <div className="form-group">
              <label className="form-label">Waktu Berakhir <span className="text-red-500">*</span></label>
              <input type="datetime-local" name="endTime" value={form.endTime} onChange={handleChange}
                className="form-input" required />
            </div>
          </div>

          <div className="alert-info">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium">Cara kerja kode tes:</p>
              <p>Bagikan kode tes <strong>{form.codeTest || '...'}</strong> ke kandidat. Kandidat menggunakan kode ini untuk memulai tes seleksi.</p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading || success} className="btn-primary">
              {loading ? 'Menyimpan...' : <><Save className="w-4 h-4" /> Buat Jadwal</>}
            </button>
            <Link href="/admin/schedule" className="btn-outline">Batal</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
