// src/app/api/dashboard/route.ts
// Stats untuk admin dashboard

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()

    const [
      totalCandidates,
      pendingCandidates,
      acceptedCandidates,
      rejectedCandidates,
      activeSchedules,
      totalQuestions,
      pendingGrading,
      recentCandidates,
    ] = await Promise.all([
      prisma.candidate.count(),
      prisma.candidate.count({ where: { status: 'PENDING' } }),
      prisma.candidate.count({ where: { status: 'ACCEPTED' } }),
      prisma.candidate.count({ where: { status: 'REJECTED' } }),
      prisma.testSchedule.count({ where: { active: true, endTime: { gte: now } } }),
      prisma.question.count(),
      prisma.candidateTest.count({ where: { status: 'SUBMITTED' } }),
      prisma.candidate.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { email: true } } },
      }),
    ])

    return NextResponse.json({
      stats: {
        totalCandidates,
        pendingCandidates,
        acceptedCandidates,
        rejectedCandidates,
        activeSchedules,
        totalQuestions,
        pendingGrading,
      },
      recentCandidates,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
