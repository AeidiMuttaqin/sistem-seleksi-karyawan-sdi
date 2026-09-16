// src/app/admin/company/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { Building2, Save, CheckCircle, AlertCircle } from 'lucide-react'

export default function CompanyPage() {
  const [company, setCompany] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '', address: '', phone: '', email: '', website: '', description: ''
  })

  useEffect(() => {
    fetch('/api/company')
      .then(r => r.json())
      .then(data => {
        setCompany(data)
        setForm({
          name: data.name || '',
          address: data.address || '',
          phone: data.phone || '',
          email: data.email || '',
          website: data.website || '',
          description: data.description || '',
        })
      })
      .finally(() => setLoading(false))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)
    try {
      const res = await fetch('/api/company', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) setSuccess(true)
      else { const d = await res.json(); setError(d.error) }
    } finally {
      setSaving(false)
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
  }

  if (loading) return <div className="flex justify-center mt-20"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div>

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Data Perusahaan</h1>
        <p className="text-gray-500 text-sm">Informasi PT. Solusi Datamart Indonesia</p>
      </div>

      <div className="card">
        <div className="card-header py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Profil Perusahaan</h2>
              <p className="text-xs text-gray-400">Edit informasi perusahaan</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card-body py-4">
          {success && <div className="alert-success mb-4 py-2"><CheckCircle className="w-4 h-4" /> Data perusahaan berhasil disimpan</div>}
          {error && <div className="alert-error mb-4 py-2"><AlertCircle className="w-4 h-4" /> {error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="form-label">Nama Perusahaan <span className="text-red-500">*</span></label>
              <input type="text" name="name" value={form.name} onChange={handleChange} className="form-input py-1.5" required />
            </div>
            <div>
              <label className="form-label">Website</label>
              <input type="url" name="website" value={form.website} onChange={handleChange} className="form-input py-1.5" placeholder="https://..." />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="form-label">Telepon</label>
              <input type="text" name="phone" value={form.phone} onChange={handleChange} className="form-input py-1.5" placeholder="021-..." />
            </div>
            <div>
              <label className="form-label">Email Perusahaan</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} className="form-input py-1.5" />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label">Alamat</label>
            <textarea name="address" value={form.address} onChange={handleChange} className="form-textarea py-2 text-sm" rows={2} />
          </div>

          <div className="mb-4">
            <label className="form-label">Deskripsi</label>
            <textarea name="description" value={form.description} onChange={handleChange} className="form-textarea py-2 text-sm" rows={2} />
          </div>

          <div className="pt-3 border-t border-gray-100 mt-4">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Menyimpan...' : <><Save className="w-4 h-4" /> Simpan Perubahan</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
