export const dynamic = 'force-dynamic';

// src/app/api/test/route.ts
// API untuk mengambil dan mengerjakan tes

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET - Ambil soal tes berdasarkan kode tes
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const codeTest = searchParams.get('code')
    if (!codeTest) return NextResponse.json({ error: 'Kode tes wajib diisi' }, { status: 400 })

    // Cari jadwal tes
    const schedule = await prisma.testSchedule.findUnique({
      where: { codeTest },
      include: {
        questionCode: {
          include: {
            questions: {
              include: {
                options: { orderBy: { label: 'asc' } }
              },
              orderBy: { createdAt: 'asc' }
            }
          }
        }
      }
    })

    if (!schedule) {
      return NextResponse.json({ error: 'Kode tes tidak valid' }, { status: 404 })
    }

    const now = new Date()
    if (!schedule.active) {
      return NextResponse.json({ error: 'Jadwal tes tidak aktif' }, { status: 400 })
    }
    if (now < schedule.startTime) {
      return NextResponse.json({ error: 'Tes belum dimulai' }, { status: 400 })
    }
    if (now > schedule.endTime) {
      return NextResponse.json({ error: 'Tes sudah berakhir' }, { status: 400 })
    }

    // Cari kandidat berdasarkan user
    const candidate = await prisma.candidate.findUnique({
      where: { userId: session.user.id }
    })
    if (!candidate) {
      return NextResponse.json({ error: 'Data kandidat tidak ditemukan' }, { status: 404 })
    }

    // Cek apakah sudah pernah ikut tes ini
    const existingTest = await prisma.candidateTest.findUnique({
      where: {
        candidateId_testScheduleId: {
          candidateId: candidate.id,
          testScheduleId: schedule.id,
        }
      }
    })

    if (existingTest?.status === 'SUBMITTED' || existingTest?.status === 'GRADED') {
      return NextResponse.json({ error: 'Anda sudah mengumpulkan tes ini' }, { status: 400 })
    }

    // Buat atau ambil session tes kandidat
    let candidateTest = existingTest
    if (!candidateTest) {
      candidateTest = await prisma.candidateTest.create({
        data: {
          candidateId: candidate.id,
          testScheduleId: schedule.id,
          status: 'IN_PROGRESS',
          startedAt: new Date(),
        }
      })
    }

    // Shuffle soal untuk keamanan
    const questions = schedule.questionCode.questions.map(q => ({
      id: q.id,
      content: q.content,
      type: q.type,
      point: q.point,
      options: q.type === 'MULTIPLE_CHOICE' ? q.options.map(o => ({
        id: o.id,
        label: o.label,
        content: o.content,
        // JANGAN kirim isCorrect ke client
      })) : [],
    }))

    return NextResponse.json({
      candidateTestId: candidateTest.id,
      scheduleTitle: schedule.title,
      duration: schedule.duration,
      startedAt: candidateTest.startedAt,
      questions,
    })
  } catch (error) {
    console.error('[TEST GET]', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST - Submit jawaban tes
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { candidateTestId, answers } = body
    // answers: [{ questionId, selectedOptionId?, essayAnswer? }]

    if (!candidateTestId || !answers?.length) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    const candidateTest = await prisma.candidateTest.findUnique({
      where: { id: candidateTestId },
      include: { candidate: true }
    })

    if (!candidateTest) return NextResponse.json({ error: 'Sesi tes tidak ditemukan' }, { status: 404 })
    if (candidateTest.candidate.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (candidateTest.status !== 'IN_PROGRESS') {
      return NextResponse.json({ error: 'Tes sudah dikumpulkan' }, { status: 400 })
    }

    // Proses jawaban
    let mcScore = 0
    let mcTotal = 0

    await prisma.$transaction(async (tx) => {
      for (const answer of answers) {
        const question = await tx.question.findUnique({
          where: { id: answer.questionId },
          include: { options: true }
        })
        if (!question) continue

        let isCorrect: boolean | null = null
        let score: number | null = null

        if (question.type === 'MULTIPLE_CHOICE') {
          mcTotal += question.point
          const correctOption = question.options.find(o => o.isCorrect)
          isCorrect = answer.selectedOptionId === correctOption?.id
          score = isCorrect ? question.point : 0
          mcScore += score
        }

        await tx.candidateAnswer.upsert({
          where: {
            candidateTestId_questionId: {
              candidateTestId,
              questionId: answer.questionId,
            }
          },
          create: {
            candidateTestId,
            questionId: answer.questionId,
            selectedOptionId: answer.selectedOptionId || null,
            essayAnswer: answer.essayAnswer || null,
            isCorrect,
            score,
          },
          update: {
            selectedOptionId: answer.selectedOptionId || null,
            essayAnswer: answer.essayAnswer || null,
            isCorrect,
            score,
          }
        })
      }

      // Update status candidateTest
      await tx.candidateTest.update({
        where: { id: candidateTestId },
        data: {
          status: 'SUBMITTED',
          submittedAt: new Date(),
          totalScore: mcScore,
        }
      })

      // Auto-create result for MC only tests, essay needs manual grading
      const hasEssay = answers.some((a: any) => {
        // simplified check
        return a.essayAnswer !== undefined
      })

      // Get all questions to calculate max score
      const schedule = await tx.testSchedule.findFirst({
        where: { candidateTests: { some: { id: candidateTestId } } },
        include: { questionCode: { include: { questions: true } } }
      })

      const maxScore = schedule?.questionCode.questions.reduce((sum, q) => sum + q.point, 0) || 100
      const hasEssayQuestions = schedule?.questionCode.questions.some(q => q.type === 'ESSAY') || false

      if (!hasEssayQuestions) {
        // Auto grade if no essay
        const percentage = (mcScore / maxScore) * 100
        await tx.testResult.create({
          data: {
            candidateTestId,
            totalScore: mcScore,
            mcScore,
            maxScore,
            percentage,
            status: percentage >= 60 ? 'LULUS' : 'TIDAK_LULUS',
          }
        })

        await tx.candidateTest.update({
          where: { id: candidateTestId },
          data: { status: 'GRADED' }
        })
      }
    })

    return NextResponse.json({ message: 'Jawaban berhasil dikumpulkan' })
  } catch (error) {
    console.error('[TEST POST]', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
