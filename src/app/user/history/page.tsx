// src/app/user/history/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { History, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { formatDateTime, getStatusColor, getStatusLabel } from '@/lib/utils'

export default function UserHistoryPage() {
  const { data: session } = useSession()
  const [candidate, setCandidate] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    if (!session?.user?.id) return
    fetch(`/api/candidates/${session.user.id}`)
      .then(r => r.json())
      .then(setCandidate)
      .finally(() => setLoading(false))
  }, [session])

  const tests = candidate?.candidateTests || []

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Riwayat Tes</h1>
        <p className="text-gray-500 text-sm">Histori semua tes yang pernah Anda ikuti</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => (
          <div key={i} className="card p-6 animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-1/3 mb-2" />
            <div className="h-4 bg-gray-100 rounded w-2/3" />
          </div>
        ))}</div>
      ) : tests.length === 0 ? (
        <div className="card p-16 text-center">
          <History className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-gray-600 font-medium">Belum ada riwayat tes</h3>
          <p className="text-gray-400 text-sm mt-1">Ikuti tes seleksi untuk melihat riwayat di sini</p>
          <a href="/user/test" className="btn-primary mt-4 inline-flex">Ikut Tes Sekarang</a>
        </div>
      ) : (
        <div className="space-y-4">
          {tests.map((ct: any) => {
            const isExpanded = expanded === ct.id
            const result = ct.testResult
            
            return (
              <div key={ct.id} className="card overflow-hidden">
                <div
                  className="card-body cursor-pointer"
                  onClick={() => setExpanded(prev => prev === ct.id ? null : ct.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        result?.status === 'LULUS' ? 'bg-green-100' :
                        result?.status === 'TIDAK_LULUS' ? 'bg-red-100' :
                        'bg-yellow-100'
                      }`}>
                        {result?.status === 'LULUS' ? <CheckCircle className="w-6 h-6 text-green-600" /> :
                         result?.status === 'TIDAK_LULUS' ? <XCircle className="w-6 h-6 text-red-500" /> :
                         <Clock className="w-6 h-6 text-yellow-500" />
                        }
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{ct.testSchedule?.title}</h3>
                        <p className="text-sm text-gray-400 font-mono">{ct.testSchedule?.codeTest}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`badge ${getStatusColor(ct.status)}`}>{getStatusLabel(ct.status)}</span>
                          {result && (
                            <span className={`badge ${getStatusColor(result.status)}`}>{getStatusLabel(result.status)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {result && (
                        <div className={`text-2xl font-bold ${result.status === 'LULUS' ? 'text-green-600' : 'text-red-500'}`}>
                          {result.percentage?.toFixed(1)}%
                        </div>
                      )}
                      <p className="text-xs text-gray-400 mt-0.5">
                        {ct.submittedAt ? formatDateTime(ct.submittedAt) : '-'}
                      </p>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400 ml-auto mt-1" /> : <ChevronDown className="w-4 h-4 text-gray-400 ml-auto mt-1" />}
                    </div>
                  </div>
                </div>

                {isExpanded && result && (
                  <div className="px-6 pb-6 border-t border-gray-100">
                    <div className="pt-4 space-y-4">
                      {/* Score breakdown */}
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { label: 'Total Nilai', value: `${result.totalScore}/${result.maxScore}` },
                          { label: 'Pilihan Ganda', value: result.mcScore != null ? result.mcScore : '-' },
                          { label: 'Essay', value: result.essayScore != null ? result.essayScore : '-' },
                        ].map(s => (
                          <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center">
                            <p className="text-xs text-gray-400">{s.label}</p>
                            <p className="font-bold text-gray-900 text-lg">{s.value}</p>
                          </div>
                        ))}
                      </div>

                      {result.adminNotes && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                          <p className="text-xs font-semibold text-blue-700 mb-1">Catatan HRD:</p>
                          <p className="text-sm text-blue-800">{result.adminNotes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
