// src/app/admin/notifications/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { Bell, Send, Users, Check, AlertCircle } from 'lucide-react'

export default function NotificationsPage() {
  const [candidates, setCandidates] = useState<any[]>([])
  const [schedules, setSchedules] = useState<any[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [form, setForm] = useState({
    title: '',
    message: '',
    type: 'GENERAL',
    scheduleId: '',
    sendEmail: false,
  })
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/candidates?limit=100').then(r => r.json()).then(d => setCandidates(d.data || []))
    fetch('/api/schedule').then(r => r.json()).then(d => setSchedules(Array.isArray(d) ? d : []))
  }, [])

  function toggleSelect(userId: string) {
    setSelected(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    )
  }

  function selectAll() {
    if (selected.length === candidates.length) {
      setSelected([])
    } else {
      setSelected(candidates.map(c => c.userId))
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setResult('')
    if (!selected.length) { setError('Pilih minimal satu penerima'); return }
    if (!form.title || !form.message) { setError('Judul dan pesan wajib diisi'); return }

    setSending(true)
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientIds: selected,
          title: form.title,
          message: form.message,
          type: form.type,
          sendEmail: form.sendEmail,
          scheduleId: form.scheduleId || undefined,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setResult(data.message)
        setForm({ title: '', message: '', type: 'GENERAL', scheduleId: '', sendEmail: false })
        setSelected([])
      } else {
        setError(data.error || 'Gagal mengirim')
      }
    } finally {
      setSending(false)
    }
  }

  const TYPES = [
    { value: 'GENERAL', label: 'Umum' },
    { value: 'TEST_INVITATION', label: 'Undangan Tes' },
    { value: 'TEST_RESULT', label: 'Hasil Tes' },
    { value: 'SELECTION_UPDATE', label: 'Update Seleksi' },
  ]

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Kirim Notifikasi</h1>
        <p className="text-gray-500 text-sm">Kirim notifikasi dan email ke kandidat</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recipient selection */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Pilih Penerima</h2>
            <button onClick={selectAll} className="btn-outline btn-sm">
              {selected.length === candidates.length ? 'Batal Semua' : 'Pilih Semua'}
            </button>
          </div>
          <div className="card-body">
            <p className="text-sm text-gray-500 mb-3">{selected.length} dipilih dari {candidates.length} kandidat</p>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {candidates.map((c) => (
                <label key={c.id} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                  selected.includes(c.userId) ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50 border border-transparent'
                }`}>
                  <input
                    type="checkbox"
                    checked={selected.includes(c.userId)}
                    onChange={() => toggleSelect(c.userId)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-sm font-bold flex-shrink-0">
                    {c.fullName[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{c.fullName}</p>
                    <p className="text-xs text-gray-400 truncate">{c.user?.email}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Compose form */}
        <div className="card">
          <div className="card-header">
            <h2 className="font-semibold text-gray-900">Tulis Notifikasi</h2>
          </div>
          <form onSubmit={handleSend} className="card-body space-y-4">
            {result && <div className="alert-success"><Check className="w-4 h-4" /> {result}</div>}
            {error && <div className="alert-error"><AlertCircle className="w-4 h-4" /> {error}</div>}

            <div className="form-group">
              <label className="form-label">Tipe Notifikasi</label>
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="form-select">
                {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Judul <span className="text-red-500">*</span></label>
              <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                className="form-input" placeholder="Judul notifikasi..." required />
            </div>

            <div className="form-group">
              <label className="form-label">Pesan <span className="text-red-500">*</span></label>
              <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                className="form-textarea" rows={4} placeholder="Isi pesan notifikasi..." required />
            </div>

            {form.type === 'TEST_INVITATION' && (
              <div className="form-group">
                <label className="form-label">Jadwal Tes (untuk email)</label>
                <select value={form.scheduleId} onChange={e => setForm(p => ({ ...p, scheduleId: e.target.value }))} className="form-select">
                  <option value="">-- Pilih jadwal --</option>
                  {schedules.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.title} ({s.codeTest})</option>
                  ))}
                </select>
              </div>
            )}

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.sendEmail}
                onChange={e => setForm(p => ({ ...p, sendEmail: e.target.checked }))}
                className="w-4 h-4 rounded text-blue-600" />
              <span className="text-sm text-gray-700">Kirim email ke kandidat yang dipilih</span>
            </label>

            <button type="submit" disabled={sending} className="btn-primary w-full">
              {sending ? 'Mengirim...' : <><Send className="w-4 h-4" /> Kirim Notifikasi ({selected.length})</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
