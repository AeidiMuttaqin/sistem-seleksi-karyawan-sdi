export const dynamic = 'force-dynamic';

// src/app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.user.role !== 'ADMIN' && session.user.id !== params.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true, username: true, email: true, role: true, createdAt: true,
        candidate: true,
      }
    })
    if (!user) return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })
    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.user.role !== 'ADMIN' && session.user.id !== params.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const updateData: any = {}
    if (body.username) updateData.username = body.username
    if (body.email) updateData.email = body.email
    if (body.password) updateData.password = await bcrypt.hash(body.password, 10)

    const user = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: { id: true, username: true, email: true, role: true }
    })
    return NextResponse.json(user)
  } catch (error: any) {
    if (error.code === 'P2002') return NextResponse.json({ error: 'Email atau username sudah digunakan' }, { status: 400 })
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    await prisma.user.delete({ where: { id: params.id } })
    return NextResponse.json({ message: 'User berhasil dihapus' })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
