export const dynamic = 'force-dynamic';

// src/app/api/results/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { sendEmail, testResultTemplate } from '@/lib/email'
import { formatDateTime } from '@/lib/utils'

// GET - List hasil tes yang perlu dinilai / sudah dinilai
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || ''

    const where: any = {}
    if (status === 'PENDING') {
      where.status = 'SUBMITTED'
    }

    const tests = await prisma.candidateTest.findMany({
      where,
      include: {
        candidate: {
          include: { user: { select: { email: true } } }
        },
        testSchedule: { select: { title: true, codeTest: true } },
        testResult: true,
        answers: {
          include: {
            question: true,
            selectedOption: true,
          }
        },
      },
      orderBy: { submittedAt: 'desc' },
    })

    return NextResponse.json(tests)
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST - Tambah/update hasil penilaian essay
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { candidateTestId, essayGrades, adminNotes, sendNotification } = body
    // essayGrades: [{ answerId, score, feedback }]

    const candidateTest = await prisma.candidateTest.findUnique({
      where: { id: candidateTestId },
      include: {
        candidate: { include: { user: true } },
        testSchedule: { select: { title: true } },
        answers: { include: { question: true } },
        testResult: true,
      }
    })

    if (!candidateTest) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })

    await prisma.$transaction(async (tx) => {
      // Update essay grades
      if (essayGrades?.length > 0) {
        for (const grade of essayGrades) {
          await tx.candidateAnswer.update({
            where: { id: grade.answerId },
            data: { score: grade.score, feedback: grade.feedback }
          })
        }
      }

      // Calculate total score
      const allAnswers = await tx.candidateAnswer.findMany({
        where: { candidateTestId },
        include: { question: true }
      })

      const totalScore = allAnswers.reduce((sum, a) => sum + (a.score || 0), 0)
      const maxScore = allAnswers.reduce((sum, a) => sum + a.question.point, 0)
      const mcScore = allAnswers.filter(a => a.question.type === 'MULTIPLE_CHOICE')
                                .reduce((sum, a) => sum + (a.score || 0), 0)
      const essayScore = allAnswers.filter(a => a.question.type === 'ESSAY')
                                   .reduce((sum, a) => sum + (a.score || 0), 0)
      const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0
      const resultStatus = percentage >= 60 ? 'LULUS' : 'TIDAK_LULUS'

      // Upsert TestResult
      await tx.testResult.upsert({
        where: { candidateTestId },
        create: {
          candidateTestId,
          totalScore,
          mcScore,
          essayScore,
          maxScore,
          percentage,
          status: resultStatus,
          adminNotes: adminNotes || null,
          gradedAt: new Date(),
        },
        update: {
          totalScore,
          mcScore,
          essayScore,
          maxScore,
          percentage,
          status: resultStatus,
          adminNotes: adminNotes || null,
          gradedAt: new Date(),
        }
      })

      await tx.candidateTest.update({
        where: { id: candidateTestId },
        data: { status: 'GRADED', totalScore }
      })

      // Send notification if requested
      if (sendNotification) {
        // Create in-app notification
        await tx.notification.create({
          data: {
            recipientId: candidateTest.candidate.userId,
            senderId: session.user.id,
            title: 'Hasil Tes Seleksi',
            message: `Hasil tes "${candidateTest.testSchedule.title}" Anda telah tersedia. Nilai: ${totalScore}/${maxScore} (${percentage.toFixed(1)}%) - ${resultStatus === 'LULUS' ? 'LULUS' : 'TIDAK LULUS'}`,
            type: 'TEST_RESULT',
          }
        })

        // Send email (async, don't wait)
        sendEmail({
          to: candidateTest.candidate.user.email,
          subject: `Hasil Tes Seleksi - PT. Solusi Datamart Indonesia`,
          html: testResultTemplate({
            candidateName: candidateTest.candidate.fullName,
            testTitle: candidateTest.testSchedule.title,
            score: totalScore,
            maxScore,
            percentage,
            result: resultStatus,
            adminNotes,
          })
        }).catch(console.error)
      }
    })

    return NextResponse.json({ message: 'Penilaian berhasil disimpan' })
  } catch (error) {
    console.error('[RESULTS POST]', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
