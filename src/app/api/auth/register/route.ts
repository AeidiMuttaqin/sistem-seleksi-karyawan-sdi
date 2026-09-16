// src/app/api/auth/register/route.ts
// API endpoint untuk registrasi kandidat baru

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { username, email, password, fullName, phone, position } = body

    // Validasi input
    if (!username || !email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Username, email, password, dan nama lengkap wajib diisi' },
        { status: 400 }
      )
    }

    // Cek email sudah terdaftar
    const existingEmail = await prisma.user.findUnique({ where: { email } })
    if (existingEmail) {
      return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 })
    }

    // Cek username sudah digunakan
    const existingUsername = await prisma.user.findUnique({ where: { username } })
    if (existingUsername) {
      return NextResponse.json({ error: 'Username sudah digunakan' }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Buat user dan candidate dalam satu transaksi
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          role: 'USER',
        }
      })

      const candidate = await tx.candidate.create({
        data: {
          userId: user.id,
          fullName,
          phone: phone || null,
          position: position || null,
          status: 'PENDING',
        }
      })

      return { user, candidate }
    })

    return NextResponse.json({
      message: 'Registrasi berhasil',
      user: {
        id: result.user.id,
        email: result.user.email,
        username: result.user.username,
      }
    }, { status: 201 })

  } catch (error) {
    console.error('[REGISTER ERROR]', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
