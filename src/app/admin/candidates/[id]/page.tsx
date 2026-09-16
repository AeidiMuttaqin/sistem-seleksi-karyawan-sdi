// src/app/admin/candidates/[id]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, User, Phone, MapPin, Calendar, GraduationCap, Briefcase, FileText, ClipboardList } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatDate, formatDateTime, getStatusColor, getStatusLabel } from '@/lib/utils'

export default function CandidateDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [candidate, setCandidate] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/candidates/${id}`)
      .then(r => r.json())
      .then(setCandidate)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="flex items-center justify-center min-h-64">
      <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
    </div>
  )

  if (!candidate) return (
    <div className="text-center py-16 text-gray-400">
      <User className="w-16 h-16 mx-auto mb-3 opacity-30" />
      <p>Kandidat tidak ditemukan</p>
    </div>
  )

  const lastTest = candidate.candidateTests?.[0]

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      {/* Back button */}
      <div className="mb-6">
        <Link href="/admin/candidates" className="btn-outline btn-sm">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Link>
      </div>

      {/* Profile Header */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              {candidate.fullName[0]}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{candidate.fullName}</h1>
                  <p className="text-blue-600 font-medium">{candidate.position || 'Posisi belum diisi'}</p>
                  <p className="text-sm text-gray-400 mt-0.5">{candidate.user?.email}</p>
                </div>
                <span className={`badge ${getStatusColor(candidate.status)} text-sm px-3 py-1`}>
                  {getStatusLabel(candidate.status)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Info */}
        <div className="card">
          <div className="card-header">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-500" /> Informasi Pribadi
            </h2>
          </div>
          <div className="card-body space-y-3">
            {[
              { icon: Phone, label: 'Telepon', value: candidate.phone },
              { icon: MapPin, label: 'Alamat', value: candidate.address },
              { icon: Calendar, label: 'Tgl. Lahir', value: candidate.birthDate ? formatDate(candidate.birthDate) : null },
              { icon: User, label: 'Jenis Kelamin', value: candidate.gender === 'MALE' ? 'Laki-laki' : candidate.gender === 'FEMALE' ? 'Perempuan' : null },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3">
                <Icon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="text-sm text-gray-800">{value || '-'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Education & Experience */}
        <div className="card">
          <div className="card-header">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-500" /> Pendidikan & Pengalaman
            </h2>
          </div>
          <div className="card-body space-y-3">
            {[
              { icon: GraduationCap, label: 'Pendidikan', value: candidate.education },
              { icon: BookOpen, label: 'Jurusan', value: candidate.major },
              { icon: School, label: 'Institusi', value: candidate.institution },
              { icon: Briefcase, label: 'Pengalaman', value: candidate.experience },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3">
                <Icon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="text-sm text-gray-800">{value || '-'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Test History */}
        <div className="card lg:col-span-2">
          <div className="card-header">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-blue-500" /> Riwayat Tes
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Nama Tes</th>
                  <th>Kode Tes</th>
                  <th>Status</th>
                  <th>Nilai</th>
                  <th>Hasil</th>
                  <th>Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {candidate.candidateTests?.length === 0 ? (
                  <tr><td colSpan={6} className="text-center text-gray-400 py-8">Belum ada riwayat tes</td></tr>
                ) : (
                  candidate.candidateTests?.map((ct: any) => (
                    <tr key={ct.id}>
                      <td className="font-medium">{ct.testSchedule?.title}</td>
                      <td className="text-gray-500 font-mono text-xs">{ct.testSchedule?.codeTest}</td>
                      <td>
                        <span className={`badge ${getStatusColor(ct.status)}`}>{getStatusLabel(ct.status)}</span>
                      </td>
                      <td>
                        {ct.testResult ? (
                          <span className="font-semibold">{ct.testResult.totalScore}/{ct.testResult.maxScore}</span>
                        ) : '-'}
                      </td>
                      <td>
                        {ct.testResult ? (
                          <span className={`badge ${getStatusColor(ct.testResult.status)}`}>
                            {getStatusLabel(ct.testResult.status)}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="text-sm text-gray-400">
                        {ct.submittedAt ? formatDateTime(ct.submittedAt) : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

// Missing icon stubs
function BookOpen({ className }: { className?: string }) {
  return <GraduationCap className={className} />
}
function School({ className }: { className?: string }) {
  return <GraduationCap className={className} />
}
