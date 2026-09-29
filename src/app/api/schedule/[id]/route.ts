export const dynamic = 'force-dynamic';

// src/app/api/schedule/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const schedule = await prisma.testSchedule.findUnique({
      where: { id: params.id },
      include: {
        questionCode: { include: { questions: { include: { options: true } } } },
        candidateTests: {
          include: {
            candidate: { select: { fullName: true, position: true } },
            testResult: true,
          }
        }
      }
    })
    if (!schedule) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })
    return NextResponse.json(schedule)
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const body = await req.json()
    const updated = await prisma.testSchedule.update({
      where: { id: params.id },
      data: {
        title: body.title,
        startTime: body.startTime ? new Date(body.startTime) : undefined,
        endTime: body.endTime ? new Date(body.endTime) : undefined,
        duration: body.duration ? parseInt(body.duration) : undefined,
        active: body.active !== undefined ? body.active : undefined,
      }
    })
    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    await prisma.testSchedule.delete({ where: { id: params.id } })
    return NextResponse.json({ message: 'Jadwal berhasil dihapus' })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
