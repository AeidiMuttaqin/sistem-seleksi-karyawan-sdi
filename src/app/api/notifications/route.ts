// src/app/api/notifications/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { sendEmail, testInvitationTemplate } from '@/lib/email'
import { formatDateTime } from '@/lib/utils'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const notifications = await prisma.notification.findMany({
      where: { recipientId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json(notifications)
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
    const { recipientIds, title, message, type, sendEmail: shouldSendEmail, scheduleId } = body

    if (!recipientIds?.length || !title || !message) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    // Create notifications for all recipients
    const notifications = await prisma.notification.createMany({
      data: recipientIds.map((id: string) => ({
        recipientId: id,
        senderId: session.user.id,
        title,
        message,
        type: type || 'GENERAL',
      }))
    })

    // Send email if requested and schedule provided
    if (shouldSendEmail && scheduleId) {
      const schedule = await prisma.testSchedule.findUnique({
        where: { id: scheduleId },
      })

      if (schedule) {
        const recipients = await prisma.user.findMany({
          where: { id: { in: recipientIds } },
          include: { candidate: true }
        })

        for (const recipient of recipients) {
          if (!recipient.email) continue
          sendEmail({
            to: recipient.email,
            subject: `Undangan Tes Seleksi - ${schedule.title}`,
            html: testInvitationTemplate({
              candidateName: recipient.candidate?.fullName || recipient.username,
              testTitle: schedule.title,
              codeTest: schedule.codeTest,
              startTime: formatDateTime(schedule.startTime),
              endTime: formatDateTime(schedule.endTime),
              duration: schedule.duration,
            })
          }).catch(console.error)
        }
      }
    }

    return NextResponse.json({ message: `${notifications.count} notifikasi berhasil dikirim` }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// PATCH - Mark notification as read
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { ids } = body // array of notification IDs, or empty for all

    if (ids?.length > 0) {
      await prisma.notification.updateMany({
        where: { id: { in: ids }, recipientId: session.user.id },
        data: { isRead: true }
      })
    } else {
      await prisma.notification.updateMany({
        where: { recipientId: session.user.id, isRead: false },
        data: { isRead: true }
      })
    }

    return NextResponse.json({ message: 'Notifikasi ditandai sudah dibaca' })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
