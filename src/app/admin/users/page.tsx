// src/app/admin/users/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { UserCog, Trash2, Shield, User } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchUsers() }, [])

  async function fetchUsers() {
    setLoading(true)
    const res = await fetch('/api/users')
    const data = await res.json()
    setUsers(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Hapus user ini? Semua data terkait akan ikut terhapus.')) return
    await fetch(`/api/users/${id}`, { method: 'DELETE' })
    fetchUsers()
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen User</h1>
        <p className="text-gray-500 text-sm">Kelola semua user dalam sistem</p>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Kandidat</th>
                <th>Status Kandidat</th>
                <th>Terdaftar</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}>{[...Array(6)].map((_, j) => (
                    <td key={j}><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                  ))}</tr>
                ))
              ) : users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                        u.role === 'ADMIN' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                      }`}>
                        {u.username[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{u.username}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${u.role === 'ADMIN' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                      <span className="flex items-center gap-1">
                        {u.role === 'ADMIN' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                        {u.role}
                      </span>
                    </span>
                  </td>
                  <td className="text-sm">{u.candidate?.fullName || <span className="text-gray-300">-</span>}</td>
                  <td>
                    {u.candidate?.status ? (
                      <span className="badge bg-gray-100 text-gray-600 text-xs">{u.candidate.status}</span>
                    ) : '-'}
                  </td>
                  <td className="text-sm text-gray-400">{formatDate(u.createdAt)}</td>
                  <td>
                    <button onClick={() => handleDelete(u.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors"
                      title="Hapus user">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
