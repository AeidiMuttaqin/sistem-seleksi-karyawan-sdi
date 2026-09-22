// src/app/user/profile/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { User, Save, CheckCircle, AlertCircle, Edit2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function UserProfilePage() {
  const { data: session } = useSession()
  const [candidate, setCandidate] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState<any>({})

  useEffect(() => {
    if (!session?.user?.id) return
    fetch(`/api/candidates/${session.user.id}`)
      .then(r => r.json())
      .then(data => {
        setCandidate(data)
        setForm({
          fullName: data.fullName || '',
          phone: data.phone || '',
          address: data.address || '',
          birthDate: data.birthDate ? data.birthDate.split('T')[0] : '',
          gender: data.gender || '',
          education: data.education || '',
          major: data.major || '',
          institution: data.institution || '',
          experience: data.experience || '',
          position: data.position || '',
        })
      })
      .finally(() => setLoading(false))
  }, [session])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((p: any) => ({ ...p, [e.target.name]: e.target.value }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)
    try {
      const res = await fetch(`/api/candidates/${candidate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        const updated = await res.json()
        setCandidate(updated)
        setSuccess(true)
        setEditing(false)
      } else {
        const d = await res.json()
        setError(d.error || 'Gagal menyimpan')
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center mt-20"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div>

  return (
    <div className="animate-fade-in max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profil Saya</h1>
          <p className="text-gray-500 text-sm">Informasi pribadi dan data lamaran</p>
        </div>
        {!editing && (
          <button onClick={() => setEditing(true)} className="btn-outline">
            <Edit2 className="w-4 h-4" /> Edit Profil
          </button>
        )}
      </div>

      <div className="card">
        {/* Profile header */}
        <div className="card-body border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gray-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
              {candidate?.fullName?.[0] || '?'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{candidate?.fullName}</h2>
              <p className="text-blue-600 font-medium">{candidate?.position || 'Posisi belum diisi'}</p>
              <p className="text-sm text-gray-400">{session?.user?.email}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="card-body space-y-4">
          {success && <div className="alert-success"><CheckCircle className="w-4 h-4" /> Profil berhasil disimpan</div>}
          {error && <div className="alert-error"><AlertCircle className="w-4 h-4" /> {error}</div>}

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group col-span-2">
              <label className="form-label">Nama Lengkap</label>
              {editing
                ? <input type="text" name="fullName" value={form.fullName} onChange={handleChange} className="form-input" required />
                : <p className="text-gray-900 py-2.5 font-medium">{candidate?.fullName || '-'}</p>
              }
            </div>

            <div className="form-group">
              <label className="form-label">No. Telepon</label>
              {editing
                ? <input type="tel" name="phone" value={form.phone} onChange={handleChange} className="form-input" placeholder="08xxxxxxxxxx" />
                : <p className="text-gray-700 py-2.5">{candidate?.phone || '-'}</p>
              }
            </div>

            <div className="form-group">
              <label className="form-label">Jenis Kelamin</label>
              {editing
                ? <select name="gender" value={form.gender} onChange={handleChange} className="form-select">
                    <option value="">Pilih</option>
                    <option value="MALE">Laki-laki</option>
                    <option value="FEMALE">Perempuan</option>
                  </select>
                : <p className="text-gray-700 py-2.5">{candidate?.gender === 'MALE' ? 'Laki-laki' : candidate?.gender === 'FEMALE' ? 'Perempuan' : '-'}</p>
              }
            </div>

            <div className="form-group">
              <label className="form-label">Tanggal Lahir</label>
              {editing
                ? <input type="date" name="birthDate" value={form.birthDate} onChange={handleChange} className="form-input" />
                : <p className="text-gray-700 py-2.5">{candidate?.birthDate ? formatDate(candidate.birthDate) : '-'}</p>
              }
            </div>

            <div className="form-group">
              <label className="form-label">Posisi Dilamar</label>
              {editing
                ? <input type="text" name="position" value={form.position} onChange={handleChange} className="form-input" placeholder="Full Stack Developer" />
                : <p className="text-gray-700 py-2.5">{candidate?.position || '-'}</p>
              }
            </div>

            <div className="form-group col-span-2">
              <label className="form-label">Alamat</label>
              {editing
                ? <textarea name="address" value={form.address} onChange={handleChange} className="form-textarea" rows={2} />
                : <p className="text-gray-700 py-2.5">{candidate?.address || '-'}</p>
              }
            </div>

            <div className="form-group">
              <label className="form-label">Pendidikan Terakhir</label>
              {editing
                ? <select name="education" value={form.education} onChange={handleChange} className="form-select">
                    <option value="">Pilih</option>
                    <option value="SMA/SMK">SMA/SMK</option>
                    <option value="D3">D3</option>
                    <option value="S1">S1</option>
                    <option value="S2">S2</option>
                    <option value="S3">S3</option>
                  </select>
                : <p className="text-gray-700 py-2.5">{candidate?.education || '-'}</p>
              }
            </div>

            <div className="form-group">
              <label className="form-label">Jurusan</label>
              {editing
                ? <input type="text" name="major" value={form.major} onChange={handleChange} className="form-input" />
                : <p className="text-gray-700 py-2.5">{candidate?.major || '-'}</p>
              }
            </div>

            <div className="form-group col-span-2">
              <label className="form-label">Institusi/Universitas</label>
              {editing
                ? <input type="text" name="institution" value={form.institution} onChange={handleChange} className="form-input" />
                : <p className="text-gray-700 py-2.5">{candidate?.institution || '-'}</p>
              }
            </div>

            <div className="form-group col-span-2">
              <label className="form-label">Pengalaman Kerja</label>
              {editing
                ? <textarea name="experience" value={form.experience} onChange={handleChange} className="form-textarea" rows={3} placeholder="Ceritakan pengalaman kerja Anda..." />
                : <p className="text-gray-700 py-2.5 whitespace-pre-wrap">{candidate?.experience || '-'}</p>
              }
            </div>
          </div>

          {editing && (
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Menyimpan...' : <><Save className="w-4 h-4" /> Simpan Profil</>}
              </button>
              <button type="button" onClick={() => setEditing(false)} className="btn-outline">Batal</button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
