export const dynamic = 'force-dynamic';

// src/app/api/candidates/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET - List semua kandidat (admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where: any = {}
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { position: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ]
    }
    if (status) where.status = status

    const [candidates, total] = await Promise.all([
      prisma.candidate.findMany({
        where,
        include: {
          user: { select: { id: true, email: true, username: true } },
          candidateTests: {
            include: {
              testSchedule: { select: { title: true, codeTest: true } },
              testResult: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.candidate.count({ where }),
    ])

    return NextResponse.json({
      data: candidates,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('[CANDIDATES GET]', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST - Tambah kandidat baru (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { userId, fullName, phone, address, birthDate, gender, education, major, institution, experience, position, status } = body

    if (!userId || !fullName) {
      return NextResponse.json({ error: 'User ID dan nama lengkap wajib diisi' }, { status: 400 })
    }

    const candidate = await prisma.candidate.upsert({
      where: { userId },
      create: { userId, fullName, phone, address, birthDate: birthDate ? new Date(birthDate) : null, gender, education, major, institution, experience, position, status: status || 'PENDING' },
      update: { fullName, phone, address, birthDate: birthDate ? new Date(birthDate) : null, gender, education, major, institution, experience, position, status },
    })

    return NextResponse.json(candidate, { status: 201 })
  } catch (error) {
    console.error('[CANDIDATES POST]', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
