// prisma/seed.ts
// Seed data awal untuk Sistem Seleksi Karyawan
// Jalankan dengan: npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts

import { PrismaClient, Role, CandidateStatus, QuestionType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // 1. Buat perusahaan
  const company = await prisma.company.upsert({
    where: { id: 'company-sdi' },
    update: {},
    create: {
      id: 'company-sdi',
      name: 'PT. Solusi Datamart Indonesia',
      address: 'Ruko Citra Business Park Blok H No. 18, Kalideres, Jakarta Barat, DKI Jakarta 11840',
      phone: '021-12345678',
      email: 'hrd@solusi-datamart.co.id',
      website: 'https://solusi-datamart.co.id',
      description: 'Perusahaan teknologi informasi yang bergerak di bidang solusi data dan sistem informasi.',
    }
  })
  console.log('✅ Perusahaan dibuat:', company.name)

  // 2. Buat user admin
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@solusi-datamart.co.id' },
    update: {},
    create: {
      username: 'admin_sdi',
      email: 'admin@solusi-datamart.co.id',
      password: adminPassword,
      role: Role.ADMIN,
    }
  })
  console.log('✅ Admin dibuat:', admin.email)

  // 3. Hubungkan admin ke perusahaan
  await prisma.companyAdmin.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      companyId: company.id,
    }
  })

  // 4. Buat user kandidat contoh
  const userPassword = await bcrypt.hash('user123', 10)
  const user1 = await prisma.user.upsert({
    where: { email: 'budi@example.com' },
    update: {},
    create: {
      username: 'budi_santoso',
      email: 'budi@example.com',
      password: userPassword,
      role: Role.USER,
    }
  })

  const user2 = await prisma.user.upsert({
    where: { email: 'siti@example.com' },
    update: {},
    create: {
      username: 'siti_rahayu',
      email: 'siti@example.com',
      password: userPassword,
      role: Role.USER,
    }
  })

  const user3 = await prisma.user.upsert({
    where: { email: 'andi@example.com' },
    update: {},
    create: {
      username: 'andi_pratama',
      email: 'andi@example.com',
      password: userPassword,
      role: Role.USER,
    }
  })
  console.log('✅ User kandidat dibuat')

  // 5. Buat profil kandidat
  await prisma.candidate.upsert({
    where: { userId: user1.id },
    update: {},
    create: {
      userId: user1.id,
      fullName: 'Budi Santoso',
      phone: '081234567890',
      address: 'Jl. Merdeka No. 10, Jakarta Selatan',
      birthDate: new Date('1998-05-15'),
      gender: 'MALE',
      education: 'S1',
      major: 'Teknik Informatika',
      institution: 'Universitas Nasional',
      experience: '2 tahun sebagai Web Developer di PT. XYZ',
      position: 'Full Stack Developer',
      status: CandidateStatus.PENDING,
    }
  })

  await prisma.candidate.upsert({
    where: { userId: user2.id },
    update: {},
    create: {
      userId: user2.id,
      fullName: 'Siti Rahayu',
      phone: '085678901234',
      address: 'Jl. Sudirman No. 25, Jakarta Pusat',
      birthDate: new Date('1999-09-20'),
      gender: 'FEMALE',
      education: 'S1',
      major: 'Sistem Informasi',
      institution: 'Universitas Indonesia',
      experience: '1 tahun magang di PT. ABC',
      position: 'Business Analyst',
      status: CandidateStatus.REVIEWING,
    }
  })

  await prisma.candidate.upsert({
    where: { userId: user3.id },
    update: {},
    create: {
      userId: user3.id,
      fullName: 'Andi Pratama',
      phone: '089012345678',
      address: 'Jl. Kebon Jeruk No. 5, Jakarta Barat',
      birthDate: new Date('2000-03-10'),
      gender: 'MALE',
      education: 'D3',
      major: 'Manajemen Informatika',
      institution: 'Politeknik Negeri Jakarta',
      experience: 'Fresh Graduate',
      position: 'Junior Programmer',
      status: CandidateStatus.PENDING,
    }
  })
  console.log('✅ Profil kandidat dibuat')

  // 6. Buat Paket Soal
  const qCode1 = await prisma.questionCode.upsert({
    where: { code: 'TES-DEV-001' },
    update: {},
    create: {
      code: 'TES-DEV-001',
      title: 'Tes Seleksi Developer - Batch 1',
      description: 'Paket soal untuk seleksi posisi Developer',
      companyId: company.id,
    }
  })

  const qCode2 = await prisma.questionCode.upsert({
    where: { code: 'TES-BA-001' },
    update: {},
    create: {
      code: 'TES-BA-001',
      title: 'Tes Seleksi Business Analyst - Batch 1',
      description: 'Paket soal untuk seleksi posisi Business Analyst',
      companyId: company.id,
    }
  })
  console.log('✅ Paket soal dibuat')

  // 7. Buat soal-soal (pilihan ganda)
  const q1 = await prisma.question.create({
    data: {
      content: 'Apa yang dimaksud dengan REST API?',
      type: QuestionType.MULTIPLE_CHOICE,
      point: 10,
      companyId: company.id,
      createdById: admin.id,
      questionCodeId: qCode1.id,
      options: {
        create: [
          { label: 'A', content: 'Remote Execution System Technology', isCorrect: false },
          { label: 'B', content: 'Representational State Transfer Application Programming Interface', isCorrect: true },
          { label: 'C', content: 'Real-time Event Streaming Technology', isCorrect: false },
          { label: 'D', content: 'Resource Extraction and Storage Tool', isCorrect: false },
        ]
      }
    }
  })

  const q2 = await prisma.question.create({
    data: {
      content: 'Dalam database relasional, apa fungsi dari PRIMARY KEY?',
      type: QuestionType.MULTIPLE_CHOICE,
      point: 10,
      companyId: company.id,
      createdById: admin.id,
      questionCodeId: qCode1.id,
      options: {
        create: [
          { label: 'A', content: 'Untuk menghubungkan dua tabel yang berbeda', isCorrect: false },
          { label: 'B', content: 'Untuk mengenkripsi data yang tersimpan', isCorrect: false },
          { label: 'C', content: 'Untuk mengidentifikasi setiap baris secara unik dalam sebuah tabel', isCorrect: true },
          { label: 'D', content: 'Untuk mempercepat proses pencarian data', isCorrect: false },
        ]
      }
    }
  })

  const q3 = await prisma.question.create({
    data: {
      content: 'Apa perbedaan antara GET dan POST method dalam HTTP?',
      type: QuestionType.MULTIPLE_CHOICE,
      point: 10,
      companyId: company.id,
      createdById: admin.id,
      questionCodeId: qCode1.id,
      options: {
        create: [
          { label: 'A', content: 'GET lebih aman daripada POST karena data dienkripsi', isCorrect: false },
          { label: 'B', content: 'GET mengirim data melalui URL, POST mengirim data melalui body request', isCorrect: true },
          { label: 'C', content: 'POST hanya bisa digunakan untuk mengambil data', isCorrect: false },
          { label: 'D', content: 'Tidak ada perbedaan antara GET dan POST', isCorrect: false },
        ]
      }
    }
  })

  // Essay question
  const q4 = await prisma.question.create({
    data: {
      content: 'Jelaskan apa yang Anda pahami tentang konsep Object-Oriented Programming (OOP) dan sebutkan 4 prinsip utamanya!',
      type: QuestionType.ESSAY,
      correctAnswer: 'OOP adalah paradigma pemrograman yang mengorganisasi perangkat lunak sebagai kumpulan objek. 4 prinsip: Encapsulation (pembungkusan data), Inheritance (pewarisan), Polymorphism (banyak bentuk), Abstraction (penyembunyian detail implementasi).',
      point: 30,
      companyId: company.id,
      createdById: admin.id,
      questionCodeId: qCode1.id,
    }
  })

  const q5 = await prisma.question.create({
    data: {
      content: 'Mengapa version control (seperti Git) penting dalam pengembangan perangkat lunak?',
      type: QuestionType.ESSAY,
      correctAnswer: 'Version control penting untuk: melacak perubahan kode, kolaborasi tim, rollback ke versi sebelumnya, branching untuk fitur baru, dan dokumentasi history pengembangan.',
      point: 20,
      companyId: company.id,
      createdById: admin.id,
      questionCodeId: qCode1.id,
    }
  })
  console.log('✅ Soal-soal dibuat')

  // 8. Buat Jadwal Tes
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const dayAfter = new Date(now)
  dayAfter.setDate(dayAfter.getDate() + 3)

  const schedule1 = await prisma.testSchedule.upsert({
    where: { codeTest: 'SDI-DEV-2026-001' },
    update: {},
    create: {
      title: 'Tes Seleksi Developer - September 2026',
      codeTest: 'SDI-DEV-2026-001',
      questionCodeId: qCode1.id,
      companyId: company.id,
      startTime: tomorrow,
      endTime: dayAfter,
      duration: 90,
      active: true,
    }
  })
  console.log('✅ Jadwal tes dibuat:', schedule1.codeTest)

  // 9. Buat notifikasi
  const candidates = await prisma.candidate.findMany({ include: { user: true } })
  for (const candidate of candidates) {
    await prisma.notification.create({
      data: {
        recipientId: candidate.userId,
        senderId: admin.id,
        title: 'Selamat Datang di Sistem Seleksi PT. Solusi Datamart Indonesia',
        message: `Halo ${candidate.fullName}, selamat datang! Akun Anda telah berhasil terdaftar. Silakan lengkapi profil dan pantau informasi jadwal tes seleksi.`,
        type: 'GENERAL',
      }
    })
  }
  console.log('✅ Notifikasi dibuat')

  console.log('\n🎉 Seeding selesai!')
  console.log('\n📋 Akun yang tersedia:')
  console.log('  Admin : admin@solusi-datamart.co.id | password: admin123')
  console.log('  User 1: budi@example.com            | password: user123')
  console.log('  User 2: siti@example.com            | password: user123')
  console.log('  User 3: andi@example.com            | password: user123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
