export const dynamic = 'force-dynamic';

// src/app/api/schedule/route.ts
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

    const schedules = await prisma.testSchedule.findMany({
      include: {
        questionCode: { select: { code: true, title: true } },
        company: { select: { name: true } },
        _count: { select: { candidateTests: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(schedules)
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { title, codeTest, questionCodeId, startTime, endTime, duration } = body

    if (!title || !codeTest || !questionCodeId || !startTime || !endTime || !duration) {
      return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 })
    }

    const companyAdmin = await prisma.companyAdmin.findUnique({
      where: { userId: session.user.id }
    })

    const schedule = await prisma.testSchedule.create({
      data: {
        title,
        codeTest,
        questionCodeId,
        companyId: companyAdmin?.companyId || null,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        duration: parseInt(duration),
        active: true,
      },
      include: {
        questionCode: { select: { code: true, title: true } },
      }
    })

    return NextResponse.json(schedule, { status: 201 })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Kode tes sudah digunakan' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
