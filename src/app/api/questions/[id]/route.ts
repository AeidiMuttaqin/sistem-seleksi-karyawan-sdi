// src/app/api/questions/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const question = await prisma.question.findUnique({
      where: { id: params.id },
      include: { options: true, questionCode: true },
    })
    if (!question) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })
    return NextResponse.json(question)
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { content, type, correctAnswer, point, questionCodeId, options } = body

    // Update question
    const question = await prisma.question.update({
      where: { id: params.id },
      data: {
        content,
        type,
        correctAnswer: correctAnswer || null,
        point: point || 10,
        questionCodeId: questionCodeId || null,
      },
    })

    // If MC, update options
    if (type === 'MULTIPLE_CHOICE' && options?.length > 0) {
      // Delete existing options and recreate
      await prisma.option.deleteMany({ where: { questionId: params.id } })
      await prisma.option.createMany({
        data: options.map((opt: any) => ({
          questionId: params.id,
          label: opt.label,
          content: opt.content,
          isCorrect: opt.isCorrect || false,
        }))
      })
    }

    const updated = await prisma.question.findUnique({
      where: { id: params.id },
      include: { options: true, questionCode: true },
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
    await prisma.question.delete({ where: { id: params.id } })
    return NextResponse.json({ message: 'Soal berhasil dihapus' })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
