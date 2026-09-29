export const dynamic = 'force-dynamic';

// src/app/api/question-codes/route.ts
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

    const codes = await prisma.questionCode.findMany({
      include: {
        _count: { select: { questions: true, testSchedules: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(codes)
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
    const { code, title, description } = body

    if (!code || !title) {
      return NextResponse.json({ error: 'Kode dan judul wajib diisi' }, { status: 400 })
    }

    const companyAdmin = await prisma.companyAdmin.findUnique({
      where: { userId: session.user.id }
    })

    const qCode = await prisma.questionCode.create({
      data: {
        code,
        title,
        description: description || null,
        companyId: companyAdmin?.companyId || null,
      }
    })

    return NextResponse.json(qCode, { status: 201 })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Kode sudah digunakan' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
