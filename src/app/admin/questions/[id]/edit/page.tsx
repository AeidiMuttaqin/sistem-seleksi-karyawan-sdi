// src/app/admin/questions/[id]/edit/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, Save, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface Option {
  id?: string
  label: string
  content: string
  isCorrect: boolean
}

export default function EditQuestionPage() {
  const router = useRouter()
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [questionCodes, setQuestionCodes] = useState<any[]>([])
  
  const [form, setForm] = useState({
    content: '',
    type: 'MULTIPLE_CHOICE',
    correctAnswer: '',
    point: '10',
    questionCodeId: '',
  })
  
  const [options, setOptions] = useState<Option[]>([])

  useEffect(() => {
    Promise.all([
      fetch('/api/question-codes').then(r => r.json()),
      fetch(`/api/questions/${id}`).then(r => r.json())
    ]).then(([codesData, questionData]) => {
      setQuestionCodes(Array.isArray(codesData) ? codesData : [])
      
      if (questionData && !questionData.error) {
        setForm({
          content: questionData.content || '',
          type: questionData.type || 'MULTIPLE_CHOICE',
          correctAnswer: questionData.correctAnswer || '',
          point: String(questionData.point || '10'),
          questionCodeId: questionData.questionCodeId || '',
        })
        
        if (questionData.type === 'MULTIPLE_CHOICE' && questionData.options) {
          setOptions(questionData.options)
        } else {
          setOptions([
            { label: 'A', content: '', isCorrect: false },
            { label: 'B', content: '', isCorrect: false },
            { label: 'C', content: '', isCorrect: false },
            { label: 'D', content: '', isCorrect: false },
          ])
        }
      }
    }).finally(() => {
      setLoading(false)
    })
  }, [id])

  function updateOption(idx: number, field: keyof Option, value: any) {
    setOptions(prev => {
      const next = [...prev]
      if (field === 'isCorrect') {
        next.forEach(o => o.isCorrect = false)
        next[idx].isCorrect = true
      } else {
        (next[idx] as any)[field] = value
      }
      return next
    })
  }

  function addOption() {
    const labels = ['A', 'B', 'C', 'D', 'E', 'F']
    if (options.length >= 6) return
    setOptions(prev => [...prev, { label: labels[prev.length], content: '', isCorrect: false }])
  }

  function removeOption(idx: number) {
    if (options.length <= 2) return
    setOptions(prev => prev.filter((_, i) => i !== idx))
    
    // Reassign labels
    const labels = ['A', 'B', 'C', 'D', 'E', 'F']
    setOptions(prev => prev.map((opt, i) => ({ ...opt, label: labels[i] })))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.content.trim()) { setError('Pertanyaan wajib diisi'); return }
    if (form.type === 'MULTIPLE_CHOICE') {
      if (options.some(o => !o.content.trim())) { setError('Semua pilihan jawaban wajib diisi'); return }
      if (!options.some(o => o.isCorrect)) { setError('Pilih salah satu jawaban yang benar'); return }
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/questions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          point: parseInt(form.point),
          options: form.type === 'MULTIPLE_CHOICE' ? options : [],
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Gagal menyimpan'); return }
      setSuccess(true)
      setTimeout(() => router.push('/admin/questions'), 1500)
    } catch {
      setError('Terjadi kesalahan')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div>
  }

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="mb-4">
        <Link href="/admin/questions" className="btn-outline btn-sm">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Link>
      </div>

      <div className="card">
        <div className="card-header py-3">
          <h1 className="text-lg font-bold text-gray-900">Edit Soal</h1>
          <p className="text-xs text-gray-400 mt-0.5">Perbarui soal pilihan ganda atau essay</p>
        </div>

        <form onSubmit={handleSubmit} className="card-body py-4">
          {success && (
            <div className="alert-success mb-4 py-2">
              <CheckCircle className="w-4 h-4" /> Soal berhasil diperbarui!
            </div>
          )}
          {error && (
            <div className="alert-error mb-4 py-2">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="form-label">Tipe Soal <span className="text-red-500">*</span></label>
              <select
                value={form.type}
                onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                className="form-select py-1.5"
              >
                <option value="MULTIPLE_CHOICE">Pilihan Ganda</option>
                <option value="ESSAY">Essay</option>
              </select>
            </div>
            <div>
              <label className="form-label">Poin</label>
              <input type="number" min="1" max="100"
                value={form.point}
                onChange={e => setForm(p => ({ ...p, point: e.target.value }))}
                className="form-input py-1.5"
              />
            </div>
            <div>
              <label className="form-label">Paket Soal</label>
              <select
                value={form.questionCodeId}
                onChange={e => setForm(p => ({ ...p, questionCodeId: e.target.value }))}
                className="form-select py-1.5"
              >
                <option value="">-- Tidak dimasukkan ke paket --</option>
                {questionCodes.map((qc: any) => (
                  <option key={qc.id} value={qc.id}>{qc.code} - {qc.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label">Pertanyaan <span className="text-red-500">*</span></label>
            <textarea
              value={form.content}
              onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
              className="form-textarea py-2 text-sm"
              rows={3}
              placeholder="Tuliskan pertanyaan di sini..."
              required
            />
          </div>

          {form.type === 'MULTIPLE_CHOICE' && (
            <div className="mb-4">
              <label className="form-label mb-2 block">Pilihan Jawaban <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-gray-50/50 p-1.5 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 flex-shrink-0 pl-1">
                      <input
                        type="radio"
                        name="correctOption"
                        checked={opt.isCorrect}
                        onChange={() => updateOption(idx, 'isCorrect', true)}
                        className="w-4 h-4 text-blue-600"
                        title="Tandai sebagai jawaban benar"
                      />
                      <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0 ${opt.isCorrect ? 'bg-green-500 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
                        {opt.label}
                      </span>
                    </div>
                    <input
                      type="text"
                      value={opt.content}
                      onChange={e => updateOption(idx, 'content', e.target.value)}
                      className="form-input flex-1 py-1.5 px-3 text-sm min-w-0"
                      placeholder={`Pilihan ${opt.label}`}
                    />
                    {options.length > 2 && (
                      <button type="button" onClick={() => removeOption(idx)}
                        className="p-1.5 mr-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors flex-shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                {options.length < 6 && (
                  <button type="button" onClick={addOption}
                    className="btn-outline btn-sm py-1 px-2 text-xs">
                    <Plus className="w-3 h-3" /> Tambah Pilihan
                  </button>
                )}
                <p className="text-[11px] text-gray-400">Pilih radio button untuk menandai jawaban yang benar</p>
              </div>
            </div>
          )}

          {form.type === 'ESSAY' && (
            <div className="mb-4">
              <label className="form-label">Kunci Jawaban (Opsional)</label>
              <textarea
                value={form.correctAnswer}
                onChange={e => setForm(p => ({ ...p, correctAnswer: e.target.value }))}
                className="form-textarea py-2 text-sm"
                rows={2}
                placeholder="Tuliskan kunci jawaban sebagai panduan penilaian..."
              />
              <p className="text-[11px] text-gray-400 mt-1">Kunci jawaban hanya digunakan sebagai referensi admin saat menilai</p>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-gray-100 mt-4">
            <button type="submit" disabled={saving || success} className="btn-primary">
              {saving ? 'Menyimpan...' : <><Save className="w-4 h-4" /> Simpan Perubahan</>}
            </button>
            <Link href="/admin/questions" className="btn-outline">Batal</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
