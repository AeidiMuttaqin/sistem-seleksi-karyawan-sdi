// src/app/user/test/page.tsx
// Halaman ikut tes - masukkan kode test, kerjakan soal

'use client'

import { useState, useEffect, useRef } from 'react'
import { ClipboardList, Clock, AlertCircle, CheckCircle, ChevronRight, ChevronLeft, Send } from 'lucide-react'

type TestState = 'input' | 'taking' | 'submitted'

export default function UserTestPage() {
  const [state, setState] = useState<TestState>('input')
  const [codeTest, setCodeTest] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [testData, setTestData] = useState<any>(null)
  const [answers, setAnswers] = useState<Record<string, { selectedOptionId?: string; essayAnswer?: string }>>({})
  const [currentQ, setCurrentQ] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const timerRef = useRef<NodeJS.Timeout>()

  // Timer countdown
  useEffect(() => {
    if (state !== 'taking' || !testData?.duration) return
    const start = testData.startedAt ? new Date(testData.startedAt) : new Date()
    const end = new Date(start.getTime() + testData.duration * 60 * 1000)
    
    function tick() {
      const now = new Date()
      const remaining = Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000))
      setTimeLeft(remaining)
      if (remaining === 0) handleSubmit()
    }
    
    tick()
    timerRef.current = setInterval(tick, 1000)
    return () => clearInterval(timerRef.current)
  }, [state, testData])

  async function handleEnterCode(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`/api/test?code=${encodeURIComponent(codeTest.trim())}`)
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setTestData(data)
      // Initialize answers
      const initial: Record<string, any> = {}
      data.questions.forEach((q: any) => { initial[q.id] = {} })
      setAnswers(initial)
      setState('taking')
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  function setAnswer(questionId: string, field: string, value: string) {
    setAnswers(prev => ({ ...prev, [questionId]: { ...prev[questionId], [field]: value } }))
  }

  async function handleSubmit() {
    clearInterval(timerRef.current)
    setSubmitting(true)
    try {
      const payload = testData.questions.map((q: any) => ({
        questionId: q.id,
        selectedOptionId: answers[q.id]?.selectedOptionId || null,
        essayAnswer: answers[q.id]?.essayAnswer || null,
      }))
      await fetch('/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateTestId: testData.candidateTestId, answers: payload }),
      })
      setState('submitted')
    } finally {
      setSubmitting(false)
    }
  }

  const q = testData?.questions?.[currentQ]
  const answered = Object.values(answers).filter((a: any) => a.selectedOptionId || a.essayAnswer?.trim()).length

  // Code input screen
  if (state === 'input') {
    return (
      <div className="animate-fade-in max-w-lg mx-auto mt-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Ikut Tes Seleksi</h1>
          <p className="text-gray-500 mt-2">Masukkan kode tes yang telah diberikan oleh HRD</p>
        </div>

        <div className="card">
          <div className="card-body">
            <form onSubmit={handleEnterCode} className="space-y-4">
              {error && (
                <div className="alert-error">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <div className="form-group">
                <label className="form-label text-center block">Kode Tes</label>
                <input
                  type="text"
                  value={codeTest}
                  onChange={e => setCodeTest(e.target.value.toUpperCase())}
                  className="form-input text-center font-mono text-lg tracking-widest"
                  placeholder="SDI-XXXX-XXXX"
                  required
                  autoFocus
                />
              </div>
              <button type="submit" disabled={loading || !codeTest} className="btn-primary w-full btn-lg">
                {loading ? 'Memeriksa...' : 'Mulai Tes'}
              </button>
            </form>

            <div className="mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
              <p className="text-xs font-semibold text-yellow-700 mb-1">⚠️ Perhatian sebelum mulai:</p>
              <ul className="text-xs text-yellow-600 space-y-1 list-disc list-inside">
                <li>Pastikan koneksi internet stabil</li>
                <li>Tes akan berjalan sesuai durasi yang ditetapkan</li>
                <li>Jawaban akan otomatis dikumpulkan saat waktu habis</li>
                <li>Setiap kode tes hanya bisa digunakan satu kali</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Submitted screen
  if (state === 'submitted') {
    return (
      <div className="animate-fade-in max-w-lg mx-auto mt-16 text-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Tes Selesai!</h1>
        <p className="text-gray-500 mt-3">Jawaban Anda telah berhasil dikumpulkan. Tim HRD akan segera memeriksa dan memberikan hasilnya.</p>
        <div className="mt-8 space-x-3">
          <a href="/user/history" className="btn-primary">Lihat Riwayat Tes</a>
          <a href="/user" className="btn-outline">Kembali ke Dashboard</a>
        </div>
      </div>
    )
  }

  // Taking test screen
  return (
    <div className="animate-fade-in max-w-3xl">
      {/* Header bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 flex items-center justify-between shadow-sm">
        <div>
          <h2 className="font-bold text-gray-900">{testData?.scheduleTitle}</h2>
          <p className="text-sm text-gray-400">
            Soal {currentQ + 1} dari {testData?.questions?.length} | {answered} soal dijawab
          </p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-lg ${timeLeft < 300 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-700'}`}>
          <Clock className="w-5 h-5" />
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Question navigation dots */}
      <div className="flex flex-wrap gap-2 mb-6">
        {testData?.questions?.map((_: any, idx: number) => {
          const qId = testData.questions[idx].id
          const isAnswered = answers[qId]?.selectedOptionId || answers[qId]?.essayAnswer?.trim()
          return (
            <button
              key={idx}
              onClick={() => setCurrentQ(idx)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                idx === currentQ ? 'bg-blue-600 text-white' :
                isAnswered ? 'bg-green-100 text-green-700 border border-green-300' :
                'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {idx + 1}
            </button>
          )
        })}
      </div>

      {/* Question card */}
      {q && (
        <div className="card mb-6">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <span className={`badge ${q.type === 'MULTIPLE_CHOICE' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                {q.type === 'MULTIPLE_CHOICE' ? 'Pilihan Ganda' : 'Essay'}
              </span>
              <span className="text-sm text-gray-400">{q.point} poin</span>
            </div>
          </div>
          <div className="card-body">
            <p className="text-gray-900 font-medium text-lg leading-relaxed mb-6">{q.content}</p>

            {q.type === 'MULTIPLE_CHOICE' ? (
              <div className="space-y-3">
                {q.options?.map((opt: any) => (
                  <label key={opt.id}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      answers[q.id]?.selectedOptionId === opt.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      value={opt.id}
                      checked={answers[q.id]?.selectedOptionId === opt.id}
                      onChange={() => setAnswer(q.id, 'selectedOptionId', opt.id)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                      answers[q.id]?.selectedOptionId === opt.id ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>{opt.label}</span>
                    <span className="text-gray-800">{opt.content}</span>
                  </label>
                ))}
              </div>
            ) : (
              <textarea
                value={answers[q.id]?.essayAnswer || ''}
                onChange={e => setAnswer(q.id, 'essayAnswer', e.target.value)}
                className="form-textarea"
                rows={6}
                placeholder="Tuliskan jawaban Anda di sini..."
              />
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentQ(p => Math.max(0, p - 1))}
          disabled={currentQ === 0}
          className="btn-outline disabled:opacity-40"
        >
          <ChevronLeft className="w-4 h-4" /> Sebelumnya
        </button>

        {currentQ < (testData?.questions?.length - 1) ? (
          <button onClick={() => setCurrentQ(p => p + 1)} className="btn-primary">
            Selanjutnya <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => {
              const unanswered = testData?.questions?.length - answered
              if (unanswered > 0 && !confirm(`Masih ada ${unanswered} soal yang belum dijawab. Kumpulkan sekarang?`)) return
              handleSubmit()
            }}
            disabled={submitting}
            className="btn-success btn-lg"
          >
            {submitting ? 'Mengumpulkan...' : <><Send className="w-4 h-4" /> Kumpulkan Jawaban</>}
          </button>
        )}
      </div>
    </div>
  )
}
