// src/app/admin/results/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { ClipboardCheck, CheckCircle, XCircle, Clock, Star, ChevronDown, ChevronUp, Send } from 'lucide-react'
import { formatDateTime, getStatusColor, getStatusLabel } from '@/lib/utils'

export default function ResultsPage() {
  const [tests, setTests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('') // PENDING or ''
  const [expanded, setExpanded] = useState<string | null>(null)
  const [gradingId, setGradingId] = useState<string | null>(null)
  const [essayGrades, setEssayGrades] = useState<Record<string, { score: number; feedback: string }>>({})
  const [adminNotes, setAdminNotes] = useState('')
  const [sendNotification, setSendNotification] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchTests() }, [filter])

  async function fetchTests() {
    setLoading(true)
    const params = filter ? `?status=${filter}` : ''
    const res = await fetch(`/api/results${params}`)
    const data = await res.json()
    setTests(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  function toggleExpand(id: string) {
    setExpanded(prev => prev === id ? null : id)
    setGradingId(null)
  }

  function startGrading(testId: string, answers: any[]) {
    setGradingId(testId)
    const initial: Record<string, { score: number; feedback: string }> = {}
    answers.filter(a => a.question.type === 'ESSAY').forEach(a => {
      initial[a.id] = { score: a.score || 0, feedback: a.feedback || '' }
    })
    setEssayGrades(initial)
    setAdminNotes('')
    setSendNotification(true)
  }

  async function handleGrade(candidateTestId: string) {
    setSaving(true)
    try {
      const grades = Object.entries(essayGrades).map(([answerId, { score, feedback }]) => ({
        answerId, score, feedback
      }))
      const res = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateTestId, essayGrades: grades, adminNotes, sendNotification }),
      })
      if (res.ok) {
        setGradingId(null)
        fetchTests()
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hasil Seleksi</h1>
          <p className="text-gray-500 text-sm">Penilaian dan hasil tes kandidat</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setFilter('')} className={`btn-sm ${!filter ? 'btn-primary' : 'btn-outline'}`}>Semua</button>
          <button onClick={() => setFilter('PENDING')} className={`btn-sm ${filter === 'PENDING' ? 'btn-primary' : 'btn-outline'}`}>
            Perlu Dinilai
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : tests.length === 0 ? (
        <div className="card p-16 text-center">
          <ClipboardCheck className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-gray-600 font-medium">Tidak ada hasil tes</h3>
          <p className="text-gray-400 text-sm">Belum ada kandidat yang mengumpulkan tes</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tests.map((ct) => {
            const isExpanded = expanded === ct.id
            const essayAnswers = ct.answers?.filter((a: any) => a.question.type === 'ESSAY') || []
            const needsGrading = ct.status === 'SUBMITTED' && essayAnswers.length > 0

            return (
              <div key={ct.id} className="card">
                <div
                  className="card-body cursor-pointer"
                  onClick={() => toggleExpand(ct.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        ct.status === 'GRADED' ? 'bg-green-100' : 'bg-yellow-100'
                      }`}>
                        {ct.status === 'GRADED'
                          ? <CheckCircle className="w-5 h-5 text-green-600" />
                          : <Clock className="w-5 h-5 text-yellow-600" />
                        }
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{ct.candidate?.fullName}</h3>
                        <p className="text-sm text-gray-500">{ct.testSchedule?.title}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                          <span>Dikumpulkan: {ct.submittedAt ? formatDateTime(ct.submittedAt) : '-'}</span>
                          {ct.testResult && (
                            <span className="font-semibold text-gray-700">
                              Nilai: {ct.testResult.totalScore}/{ct.testResult.maxScore} ({ct.testResult.percentage.toFixed(1)}%)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {needsGrading && (
                        <span className="badge bg-orange-100 text-orange-700">Perlu Dinilai</span>
                      )}
                      {ct.testResult && (
                        <span className={`badge ${getStatusColor(ct.testResult.status)}`}>
                          {getStatusLabel(ct.testResult.status)}
                        </span>
                      )}
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-6 pb-6 border-t border-gray-100">
                    <div className="pt-4 space-y-4">
                      {/* Answers list */}
                      <h4 className="font-semibold text-gray-700 text-sm">Jawaban Kandidat</h4>
                      {ct.answers?.map((answer: any, idx: number) => (
                        <div key={answer.id} className={`p-4 rounded-xl border ${
                          answer.question.type === 'MULTIPLE_CHOICE'
                            ? answer.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                            : 'border-blue-200 bg-blue-50'
                        }`}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-700 mb-1">
                                Soal {idx + 1}: {answer.question.content}
                              </p>
                              {answer.question.type === 'MULTIPLE_CHOICE' ? (
                                <div>
                                  <p className="text-sm">
                                    Jawaban: <span className={`font-medium ${answer.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                                      {answer.selectedOption?.label}. {answer.selectedOption?.content || '(Tidak dijawab)'}
                                    </span>
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {answer.isCorrect ? '✓ Benar' : '✗ Salah'} | Poin: {answer.score || 0}/{answer.question.point}
                                  </p>
                                </div>
                              ) : (
                                <div>
                                  <p className="text-sm text-gray-700 bg-white p-2 rounded border border-gray-200 mt-1">
                                    {answer.essayAnswer || '(Tidak dijawab)'}
                                  </p>
                                  {gradingId === ct.id && (
                                    <div className="mt-2 space-y-2">
                                      <div className="flex items-center gap-2">
                                        <Star className="w-4 h-4 text-yellow-500" />
                                        <label className="text-xs font-medium text-gray-600">
                                          Nilai (0-{answer.question.point}):
                                        </label>
                                        <input type="number" min="0" max={answer.question.point}
                                          value={essayGrades[answer.id]?.score || 0}
                                          onChange={e => setEssayGrades(p => ({
                                            ...p,
                                            [answer.id]: { ...p[answer.id], score: Number(e.target.value) }
                                          }))}
                                          className="w-20 form-input py-1 text-sm"
                                        />
                                      </div>
                                      <textarea
                                        placeholder="Feedback (opsional)"
                                        value={essayGrades[answer.id]?.feedback || ''}
                                        onChange={e => setEssayGrades(p => ({
                                          ...p,
                                          [answer.id]: { ...p[answer.id], feedback: e.target.value }
                                        }))}
                                        className="form-textarea text-sm" rows={2}
                                      />
                                    </div>
                                  )}
                                  {answer.score !== null && !gradingId && (
                                    <p className="text-xs text-blue-600 mt-1">
                                      Nilai: {answer.score}/{answer.question.point}
                                      {answer.feedback && <span> — {answer.feedback}</span>}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Grading panel */}
                      {needsGrading && (
                        <div className="border-t border-gray-100 pt-4">
                          {gradingId !== ct.id ? (
                            <button onClick={() => startGrading(ct.id, ct.answers)}
                              className="btn-primary">
                              <Star className="w-4 h-4" /> Mulai Penilaian Essay
                            </button>
                          ) : (
                            <div className="space-y-3">
                              <div className="form-group">
                                <label className="form-label">Catatan Admin</label>
                                <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)}
                                  className="form-textarea" rows={2} placeholder="Catatan umum untuk kandidat ini..." />
                              </div>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={sendNotification}
                                  onChange={e => setSendNotification(e.target.checked)}
                                  className="w-4 h-4 rounded text-blue-600" />
                                <span className="text-sm text-gray-700">Kirim notifikasi hasil ke kandidat</span>
                              </label>
                              <div className="flex gap-2">
                                <button onClick={() => handleGrade(ct.id)} disabled={saving}
                                  className="btn-primary">
                                  {saving ? 'Menyimpan...' : <><Send className="w-4 h-4" /> Simpan Penilaian</>}
                                </button>
                                <button onClick={() => setGradingId(null)} className="btn-outline">Batal</button>
                              </div>
                            </div>
                          )}
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
