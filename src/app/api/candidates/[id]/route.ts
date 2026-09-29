export const dynamic = 'force-dynamic';

// src/app/api/candidates/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const candidate = await prisma.candidate.findFirst({
      where: { 
        OR: [
          { id: params.id },
          { userId: params.id },
        ]
      },
      include: {
        user: { select: { id: true, email: true, username: true } },
        candidateTests: {
          include: {
            testSchedule: true,
            testResult: true,
            answers: { include: { question: true, selectedOption: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!candidate) return NextResponse.json({ error: 'Kandidat tidak ditemukan' }, { status: 404 })

    // User can only view their own profile
    if (session.user.role !== 'ADMIN' && candidate.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(candidate)
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()

    // If user (non-admin), can only update their own profile
    const candidate = await prisma.candidate.findUnique({ where: { id: params.id } })
    if (!candidate) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })

    if (session.user.role !== 'ADMIN' && candidate.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Admin can update status too, user cannot
    const updateData: any = {
      fullName: body.fullName,
      phone: body.phone,
      address: body.address,
      birthDate: body.birthDate ? new Date(body.birthDate) : null,
      gender: body.gender,
      education: body.education,
      major: body.major,
      institution: body.institution,
      experience: body.experience,
      position: body.position,
    }

    if (session.user.role === 'ADMIN' && body.status) {
      updateData.status = body.status
    }

    const updated = await prisma.candidate.update({
      where: { id: params.id },
      data: updateData,
      include: { user: { select: { email: true, username: true } } },
    })

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.candidate.delete({ where: { id: params.id } })
    return NextResponse.json({ message: 'Kandidat berhasil dihapus' })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
