// src/lib/email.ts
// Email service menggunakan Nodemailer

import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'PT. Solusi Datamart Indonesia',
      to,
      subject,
      html,
    })
    return { success: true }
  } catch (error) {
    console.error('Email gagal terkirim:', error)
    return { success: false, error }
  }
}

export function testInvitationTemplate(data: {
  candidateName: string
  testTitle: string
  codeTest: string
  startTime: string
  endTime: string
  duration: number
}) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">PT. Solusi Datamart Indonesia</h1>
        <p style="color: #bfdbfe; margin: 8px 0 0;">Sistem Informasi Seleksi Calon Karyawan</p>
      </div>
      <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0;">
        <h2 style="color: #1e40af;">Undangan Tes Seleksi</h2>
        <p>Yth. <strong>${data.candidateName}</strong>,</p>
        <p>Anda diundang untuk mengikuti tes seleksi calon karyawan PT. Solusi Datamart Indonesia.</p>
        <div style="background: white; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p><strong>Nama Tes:</strong> ${data.testTitle}</p>
          <p><strong>Kode Tes:</strong> <code style="background: #dbeafe; padding: 2px 8px; border-radius: 4px; font-size: 16px;">${data.codeTest}</code></p>
          <p><strong>Periode:</strong> ${data.startTime} s/d ${data.endTime}</p>
          <p><strong>Durasi:</strong> ${data.duration} menit</p>
        </div>
        <p>Gunakan kode tes di atas untuk memulai ujian melalui sistem kami.</p>
        <a href="${process.env.NEXTAUTH_URL}/user/test" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 10px;">Mulai Tes Sekarang</a>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
        <p style="color: #64748b; font-size: 12px;">Email ini dikirim secara otomatis oleh sistem. Jangan membalas email ini.</p>
        <p style="color: #64748b; font-size: 12px;">PT. Solusi Datamart Indonesia | Ruko Citra Business Park Blok H No. 18, Kalideres, Jakarta Barat</p>
      </div>
    </div>
  `
}

export function testResultTemplate(data: {
  candidateName: string
  testTitle: string
  score: number
  maxScore: number
  percentage: number
  result: string
  adminNotes?: string
}) {
  const isLulus = data.result === 'LULUS'
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">PT. Solusi Datamart Indonesia</h1>
        <p style="color: #bfdbfe; margin: 8px 0 0;">Hasil Tes Seleksi Calon Karyawan</p>
      </div>
      <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0;">
        <h2 style="color: #1e40af;">Hasil Tes Seleksi</h2>
        <p>Yth. <strong>${data.candidateName}</strong>,</p>
        <p>Berikut adalah hasil tes seleksi Anda untuk posisi di PT. Solusi Datamart Indonesia:</p>
        <div style="background: white; border: 1px solid #e2e8f0; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center;">
          <p style="font-size: 14px; color: #64748b; margin: 0;">Nama Tes: ${data.testTitle}</p>
          <div style="font-size: 48px; font-weight: bold; color: ${isLulus ? '#16a34a' : '#dc2626'}; margin: 10px 0;">
            ${data.percentage.toFixed(1)}%
          </div>
          <p style="color: #64748b;">${data.score} / ${data.maxScore} poin</p>
          <div style="display: inline-block; background: ${isLulus ? '#dcfce7' : '#fee2e2'}; color: ${isLulus ? '#15803d' : '#b91c1c'}; padding: 8px 24px; border-radius: 100px; font-weight: bold; font-size: 18px;">
            ${isLulus ? '✓ LULUS' : '✗ TIDAK LULUS'}
          </div>
        </div>
        ${data.adminNotes ? `<div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;"><strong>Catatan dari HRD:</strong><p>${data.adminNotes}</p></div>` : ''}
        <p>Terima kasih telah berpartisipasi dalam proses seleksi kami.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
        <p style="color: #64748b; font-size: 12px;">Email ini dikirim secara otomatis oleh sistem.</p>
      </div>
    </div>
  `
}
