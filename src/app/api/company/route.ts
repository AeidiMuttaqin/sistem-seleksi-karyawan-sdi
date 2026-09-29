export const dynamic = 'force-dynamic';

// src/app/api/company/route.ts
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

    const companyAdmin = await prisma.companyAdmin.findUnique({
      where: { userId: session.user.id },
      include: { company: true }
    })

    if (!companyAdmin) return NextResponse.json({ error: 'Perusahaan tidak ditemukan' }, { status: 404 })
    return NextResponse.json(companyAdmin.company)
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const companyAdmin = await prisma.companyAdmin.findUnique({
      where: { userId: session.user.id }
    })
    if (!companyAdmin) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })

    const updated = await prisma.company.update({
      where: { id: companyAdmin.companyId },
      data: {
        name: body.name,
        address: body.address,
        phone: body.phone,
        email: body.email,
        website: body.website,
        description: body.description,
      }
    })
    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
