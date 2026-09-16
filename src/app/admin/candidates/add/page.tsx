// src/app/admin/candidates/add/page.tsx
// Tambah kandidat manual oleh admin (create user + candidate)
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, UserPlus, Save, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function AddCandidatePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    username: '', email: '', password: 'candidate123', fullName: '',
    phone: '', address: '', gender: '', education: '', major: '',
    institution: '', experience: '', position: '', status: 'PENDING',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      // Step 1: Register user
      const regRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
          fullName: form.fullName,
          phone: form.phone,
          position: form.position,
        }),
      })
      const regData = await regRes.json()
      if (!regRes.ok) { setError(regData.error || 'Gagal membuat akun'); return }

      // Step 2: Update full profile using userId
      const candidatesRes = await fetch('/api/candidates?search=' + encodeURIComponent(form.email) + '&limit=1')
      const candidatesData = await candidatesRes.json()
      const candidate = candidatesData?.data?.[0]
      
      if (candidate) {
        await fetch(`/api/candidates/${candidate.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            address: form.address,
            gender: form.gender,
            education: form.education,
            major: form.major,
            institution: form.institution,
            experience: form.experience,
            status: form.status,
          }),
        })
      }

      setSuccess(true)
      setTimeout(() => router.push('/admin/candidates'), 1500)
    } catch {
      setError('Terjadi kesalahan server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in max-w-3xl">
      <div className="mb-6">
        <Link href="/admin/candidates" className="btn-outline btn-sm">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Link>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Tambah Kandidat</h1>
              <p className="text-sm text-gray-400">Tambahkan kandidat baru secara manual</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card-body space-y-5">
          {success && <div className="alert-success"><CheckCircle className="w-4 h-4" /> Kandidat berhasil ditambahkan!</div>}
          {error && <div className="alert-error"><AlertCircle className="w-4 h-4" /> {error}</div>}

          <div>
            <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">Akun Login</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Username <span className="text-red-500">*</span></label>
                <input type="text" name="username" value={form.username} onChange={handleChange} className="form-input" required />
              </div>
              <div className="form-group">
                <label className="form-label">Email <span className="text-red-500">*</span></label>
                <input type="email" name="email" value={form.email} onChange={handleChange} className="form-input" required />
              </div>
              <div className="form-group col-span-2">
                <label className="form-label">Password Default</label>
                <input type="text" name="password" value={form.password} onChange={handleChange} className="form-input font-mono" />
                <p className="text-xs text-gray-400 mt-1">Kandidat dapat mengganti password setelah login</p>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          <div>
            <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">Data Pribadi</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group col-span-2">
                <label className="form-label">Nama Lengkap <span className="text-red-500">*</span></label>
                <input type="text" name="fullName" value={form.fullName} onChange={handleChange} className="form-input" required />
              </div>
              <div className="form-group">
                <label className="form-label">Telepon</label>
                <input type="tel" name="phone" value={form.phone} onChange={handleChange} className="form-input" placeholder="08xxxxxxxxxx" />
              </div>
              <div className="form-group">
                <label className="form-label">Jenis Kelamin</label>
                <select name="gender" value={form.gender} onChange={handleChange} className="form-select">
                  <option value="">Pilih</option>
                  <option value="MALE">Laki-laki</option>
                  <option value="FEMALE">Perempuan</option>
                </select>
              </div>
              <div className="form-group col-span-2">
                <label className="form-label">Alamat</label>
                <textarea name="address" value={form.address} onChange={handleChange} className="form-textarea" rows={2} />
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          <div>
            <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">Pendidikan & Lamaran</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Pendidikan</label>
                <select name="education" value={form.education} onChange={handleChange} className="form-select">
                  <option value="">Pilih</option>
                  <option value="SMA/SMK">SMA/SMK</option>
                  <option value="D3">D3</option>
                  <option value="S1">S1</option>
                  <option value="S2">S2</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Jurusan</label>
                <input type="text" name="major" value={form.major} onChange={handleChange} className="form-input" />
              </div>
              <div className="form-group col-span-2">
                <label className="form-label">Institusi</label>
                <input type="text" name="institution" value={form.institution} onChange={handleChange} className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Posisi Dilamar</label>
                <input type="text" name="position" value={form.position} onChange={handleChange} className="form-input" placeholder="Developer, Analyst..." />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select name="status" value={form.status} onChange={handleChange} className="form-select">
                  <option value="PENDING">Menunggu</option>
                  <option value="REVIEWING">Sedang Diproses</option>
                  <option value="ACCEPTED">Diterima</option>
                  <option value="REJECTED">Ditolak</option>
                </select>
              </div>
              <div className="form-group col-span-2">
                <label className="form-label">Pengalaman</label>
                <textarea name="experience" value={form.experience} onChange={handleChange} className="form-textarea" rows={3} />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading || success} className="btn-primary">
              {loading ? 'Menyimpan...' : <><Save className="w-4 h-4" /> Tambah Kandidat</>}
            </button>
            <Link href="/admin/candidates" className="btn-outline">Batal</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
