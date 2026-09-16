// src/app/api/questions/route.ts
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

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type') || ''
    const questionCodeId = searchParams.get('questionCodeId') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where: any = {}
    if (search) where.content = { contains: search, mode: 'insensitive' }
    if (type) where.type = type
    if (questionCodeId) where.questionCodeId = questionCodeId

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        include: {
          options: true,
          questionCode: true,
          createdBy: { select: { username: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.question.count({ where }),
    ])

    return NextResponse.json({
      data: questions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
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
    const { content, type, correctAnswer, point, questionCodeId, options } = body

    if (!content || !type) {
      return NextResponse.json({ error: 'Konten dan tipe soal wajib diisi' }, { status: 400 })
    }

    // Get admin's company
    const companyAdmin = await prisma.companyAdmin.findUnique({
      where: { userId: session.user.id }
    })

    const question = await prisma.question.create({
      data: {
        content,
        type,
        correctAnswer: correctAnswer || null,
        point: point || 10,
        companyId: companyAdmin?.companyId || null,
        createdById: session.user.id,
        questionCodeId: questionCodeId || null,
        options: type === 'MULTIPLE_CHOICE' && options?.length > 0 ? {
          create: options.map((opt: any) => ({
            label: opt.label,
            content: opt.content,
            isCorrect: opt.isCorrect || false,
          }))
        } : undefined,
      },
      include: { options: true, questionCode: true },
    })

    return NextResponse.json(question, { status: 201 })
  } catch (error) {
    console.error('[QUESTIONS POST]', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
