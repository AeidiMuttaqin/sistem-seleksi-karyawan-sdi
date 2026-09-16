// src/app/register/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Building2, Eye, EyeOff, Loader2, UserPlus, AlertCircle, CheckCircle } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    position: '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok')
      return
    }
    if (form.password.length < 6) {
      setError('Password minimal 6 karakter')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
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

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Registrasi gagal')
        return
      }

      setSuccess(true)
      setTimeout(() => router.push('/login'), 2000)
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page py-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl" />
      </div>

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-lg mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Daftar Sebagai Kandidat</h1>
          <p className="text-sm text-gray-500 mt-1">PT. Solusi Datamart Indonesia</p>
        </div>

        {success && (
          <div className="alert-success mb-6">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-medium">Registrasi berhasil!</p>
              <p className="text-sm">Mengalihkan ke halaman login...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="alert-error mb-6">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group col-span-2">
              <label className="form-label">Nama Lengkap <span className="text-red-500">*</span></label>
              <input name="fullName" type="text" value={form.fullName} onChange={handleChange}
                className="form-input" placeholder="Nama lengkap sesuai KTP" required />
            </div>

            <div className="form-group">
              <label className="form-label">Username <span className="text-red-500">*</span></label>
              <input name="username" type="text" value={form.username} onChange={handleChange}
                className="form-input" placeholder="username" required />
            </div>

            <div className="form-group">
              <label className="form-label">No. Telepon</label>
              <input name="phone" type="tel" value={form.phone} onChange={handleChange}
                className="form-input" placeholder="08xxxxxxxxxx" />
            </div>

            <div className="form-group col-span-2">
              <label className="form-label">Email <span className="text-red-500">*</span></label>
              <input name="email" type="email" value={form.email} onChange={handleChange}
                className="form-input" placeholder="email@contoh.com" required />
            </div>

            <div className="form-group col-span-2">
              <label className="form-label">Posisi yang Dilamar</label>
              <input name="position" type="text" value={form.position} onChange={handleChange}
                className="form-input" placeholder="Contoh: Full Stack Developer" />
            </div>

            <div className="form-group">
              <label className="form-label">Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <input name="password" type={showPassword ? 'text' : 'password'} value={form.password}
                  onChange={handleChange} className="form-input pr-10" placeholder="Min. 6 karakter" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Konfirmasi Password <span className="text-red-500">*</span></label>
              <input name="confirmPassword" type={showPassword ? 'text' : 'password'} value={form.confirmPassword}
                onChange={handleChange} className="form-input" placeholder="Ulangi password" required />
            </div>
          </div>

          <button type="submit" disabled={loading || success} className="btn-primary w-full btn-lg">
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Mendaftar...</>
            ) : (
              <><UserPlus className="w-4 h-4" /> Daftar</>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">Masuk</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
