// src/app/admin/profile/page.tsx
'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { User, Lock, Save, CheckCircle, AlertCircle } from 'lucide-react'

export default function AdminProfilePage() {
  const { data: session } = useSession()
  const [tab, setTab] = useState<'profile' | 'password'>('profile')
  const [profileForm, setProfileForm] = useState({ username: session?.user?.name || '' })
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError(''); setSuccess('')
    const res = await fetch(`/api/users/${session?.user?.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: profileForm.username }),
    })
    if (res.ok) setSuccess('Profil berhasil diperbarui')
    else { const d = await res.json(); setError(d.error) }
    setSaving(false)
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setSuccess('')
    if (passForm.newPassword !== passForm.confirmPassword) { setError('Password baru tidak cocok'); return }
    if (passForm.newPassword.length < 6) { setError('Password minimal 6 karakter'); return }
    setSaving(true)
    const res = await fetch(`/api/users/${session?.user?.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: passForm.newPassword }),
    })
    if (res.ok) { setSuccess('Password berhasil diubah'); setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' }) }
    else { const d = await res.json(); setError(d.error) }
    setSaving(false)
  }

  return (
    <div className="animate-fade-in max-w-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profil Admin</h1>
        <p className="text-gray-500 text-sm">Kelola akun dan keamanan</p>
      </div>

      {/* Avatar */}
      <div className="card mb-6">
        <div className="card-body flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
            {(session?.user?.name || 'A')[0].toUpperCase()}
          </div>
          <div>
            <h2 className="font-bold text-gray-900 text-lg">{session?.user?.name}</h2>
            <p className="text-gray-400 text-sm">{session?.user?.email}</p>
            <span className="badge bg-blue-100 text-blue-700 mt-1">Admin HRD</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 p-1 bg-gray-100 rounded-xl w-fit">
        <button onClick={() => { setTab('profile'); setSuccess(''); setError('') }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'profile' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
          <User className="w-4 h-4" /> Profil
        </button>
        <button onClick={() => { setTab('password'); setSuccess(''); setError('') }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'password' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
          <Lock className="w-4 h-4" /> Password
        </button>
      </div>

      {success && <div className="alert-success mb-4"><CheckCircle className="w-4 h-4" /> {success}</div>}
      {error && <div className="alert-error mb-4"><AlertCircle className="w-4 h-4" /> {error}</div>}

      <div className="card">
        {tab === 'profile' ? (
          <form onSubmit={saveProfile} className="card-body space-y-4">
            <div className="form-group">
              <label className="form-label">Username</label>
              <input type="text" value={profileForm.username}
                onChange={e => setProfileForm({ username: e.target.value })}
                className="form-input" required />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" value={session?.user?.email || ''} className="form-input" disabled readOnly />
              <p className="text-xs text-gray-400 mt-1">Email tidak dapat diubah</p>
            </div>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Menyimpan...' : <><Save className="w-4 h-4" /> Simpan</>}
            </button>
          </form>
        ) : (
          <form onSubmit={savePassword} className="card-body space-y-4">
            <div className="form-group">
              <label className="form-label">Password Baru</label>
              <input type="password" value={passForm.newPassword}
                onChange={e => setPassForm(p => ({ ...p, newPassword: e.target.value }))}
                className="form-input" placeholder="Min. 6 karakter" required />
            </div>
            <div className="form-group">
              <label className="form-label">Konfirmasi Password Baru</label>
              <input type="password" value={passForm.confirmPassword}
                onChange={e => setPassForm(p => ({ ...p, confirmPassword: e.target.value }))}
                className="form-input" required />
            </div>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Menyimpan...' : <><Lock className="w-4 h-4" /> Ubah Password</>}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
