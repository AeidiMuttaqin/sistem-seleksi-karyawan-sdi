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
    where: { email: 'user1@example.com' },
    update: {},
    create: {
      username: 'user1',
      email: 'user1@example.com',
      password: userPassword,
      role: Role.USER,
    }
  })

  const user2 = await prisma.user.upsert({
    where: { email: 'user2@example.com' },
    update: {},
    create: {
      username: 'user2',
      email: 'user2@example.com',
      password: userPassword,
      role: Role.USER,
    }
  })

  const user3 = await prisma.user.upsert({
    where: { email: 'user3@example.com' },
    update: {},
    create: {
      username: 'user3',
      email: 'user3@example.com',
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
      fullName: 'user1',
      phone: '081234567890',
      address: 'Jl. Merdeka No. 10, Jakarta Selatan',
      birthDate: new Date('1998-05-15'),
      gender: 'MALE',
      education: 'S1',
      major: 'Teknik Informatika',
      institution: 'Universitas Nasional',
      experience: '2 tahun sebagai Web Developer',
      position: 'Frontend Developer',
      status: CandidateStatus.PENDING,
    }
  })

  await prisma.candidate.upsert({
    where: { userId: user2.id },
    update: {},
    create: {
      userId: user2.id,
      fullName: 'user2',
      phone: '085678901234',
      address: 'Jl. Sudirman No. 25, Jakarta Pusat',
      birthDate: new Date('1999-09-20'),
      gender: 'FEMALE',
      education: 'S1',
      major: 'Sistem Informasi',
      institution: 'Universitas Indonesia',
      experience: '1 tahun magang',
      position: 'Backend Developer',
      status: CandidateStatus.REVIEWING,
    }
  })

  await prisma.candidate.upsert({
    where: { userId: user3.id },
    update: {},
    create: {
      userId: user3.id,
      fullName: 'user3',
      phone: '089012345678',
      address: 'Jl. Kebon Jeruk No. 5, Jakarta Barat',
      birthDate: new Date('2000-03-10'),
      gender: 'MALE',
      education: 'D3',
      major: 'Manajemen Informatika',
      institution: 'Politeknik Negeri Jakarta',
      experience: 'Fresh Graduate',
      position: 'Full Stack Developer',
      status: CandidateStatus.PENDING,
    }
  })
  console.log('✅ Profil kandidat dibuat')

  // 6. Buat Paket Soal
  const packages = [
    { code: 'TES-FE-001', title: 'Frontend Developer Test', desc: 'React.js, CSS, HTML, JS' },
    { code: 'TES-BE-001', title: 'Backend Developer Test', desc: 'Node.js, Express, API' },
    { code: 'TES-FS-001', title: 'Fullstack Developer Test', desc: 'MERN Stack' },
    { code: 'TES-DB-001', title: 'Database Administrator Test', desc: 'SQL, Optimization, RDBMS' },
    { code: 'TES-QA-001', title: 'Quality Assurance Test', desc: 'Automation, Manual, Testing' },
    { code: 'TES-DO-001', title: 'DevOps Engineer Test', desc: 'Docker, CI/CD, AWS' },
  ];

  const qCodes: Record<string, any> = {};
  for (const p of packages) {
    qCodes[p.code] = await prisma.questionCode.upsert({
      where: { code: p.code },
      update: {},
      create: {
        code: p.code,
        title: p.title,
        description: p.desc,
        companyId: company.id,
      }
    });
  }
  console.log('✅ Paket soal dibuat (6 paket)');

  // 7. Buat bank soal (50+ soal)
  const questionBank = [
    // --- Frontend (TES-FE-001) ---
    { code: 'TES-FE-001', q: 'Menebak Output: `console.log(typeof null)`', opts: ['"null"', '"object"*', '"undefined"', 'Error'] },
    { code: 'TES-FE-001', q: 'Melengkapi Codingan: `<img src="img.png" ___="Image" />`', opts: ['title', 'alt*', 'name', 'desc'] },
    { code: 'TES-FE-001', q: 'Hook React untuk side-effects?', opts: ['useState', 'useContext', 'useEffect*', 'useMemo'] },
    { code: 'TES-FE-001', q: 'Apa itu Virtual DOM?', type: 'ESSAY', ans: 'Representasi in-memory dari DOM nyata yang digunakan React untuk optimasi rendering.' },
    { code: 'TES-FE-001', q: 'Menebak Output: `console.log(1 + "1")`', opts: ['2', '"11"*', 'NaN', 'Error'] },
    { code: 'TES-FE-001', q: 'CSS property untuk membuat elemen fleksibel?', opts: ['display: block', 'display: grid', 'display: flex*', 'display: inline'] },
    { code: 'TES-FE-001', q: 'Manakah yang bukan semantic HTML?', opts: ['<header>', '<footer>', '<div>*', '<article>'] },
    { code: 'TES-FE-001', q: 'Melengkapi: `fetch("api").then(res => res.____())`', opts: ['json*', 'parse', 'data', 'text'] },
    { code: 'TES-FE-001', q: 'Jelaskan perbedaan let dan const!', type: 'ESSAY', ans: 'let nilainya bisa diubah (reassigned), const tidak bisa diubah.' },

    // --- Backend (TES-BE-001) ---
    { code: 'TES-BE-001', q: 'Menebak Output: Promise.all dengan 1 reject?', opts: ['Tunggu semua selesai', 'Langsung reject*', 'Return array', 'Ignore reject'] },
    { code: 'TES-BE-001', q: 'Melengkapi: `app.get("/users", (req, res) => { res.____({ok: true}) })`', opts: ['send', 'json*', 'end', 'render'] },
    { code: 'TES-BE-001', q: 'Apa itu middleware di Express?', type: 'ESSAY', ans: 'Fungsi yang dieksekusi di tengah-tengah request dan response cycle.' },
    { code: 'TES-BE-001', q: 'Status HTTP untuk "Not Found"?', opts: ['400', '401', '404*', '500'] },
    { code: 'TES-BE-001', q: 'Method HTTP untuk memperbarui data parsial?', opts: ['PUT', 'PATCH*', 'POST', 'UPDATE'] },
    { code: 'TES-BE-001', q: 'Library standard Node.js untuk file system?', opts: ['path', 'http', 'fs*', 'url'] },
    { code: 'TES-BE-001', q: 'Menebak Output: `console.log(0 == false)`', opts: ['true*', 'false', 'SyntaxError', 'undefined'] },
    { code: 'TES-BE-001', q: 'Apa itu Event Loop?', type: 'ESSAY', ans: 'Mekanisme Node.js untuk menangani operasi I/O secara asinkron (non-blocking).' },
    { code: 'TES-BE-001', q: 'Melengkapi Query: `SELECT * FROM users ___ age > 18`', opts: ['WHEN', 'WHERE*', 'IF', 'FILTER'] },

    // --- Fullstack (TES-FS-001) ---
    { code: 'TES-FS-001', q: 'Kepanjangan MERN?', opts: ['MySQL Express React Node', 'MongoDB Express React Node*', 'Mongo Express Redux Node', 'MySQL Engine React Node'] },
    { code: 'TES-FS-001', q: 'CORS adalah singkatan dari?', opts: ['Cross-Origin Resource Sharing*', 'Cross-Origin Request Security', 'Cross-Origin Restricted Source', 'Cross-Origin React State'] },
    { code: 'TES-FS-001', q: 'Jelaskan alur autentikasi JWT!', type: 'ESSAY', ans: 'Client login, server buat JWT, dikembalikan ke client. Client simpan JWT & kirim di header untuk tiap request selanjutnya.' },
    { code: 'TES-FS-001', q: 'Database apa yang biasanya digunakan dengan Mongoose?', opts: ['MySQL', 'PostgreSQL', 'MongoDB*', 'SQLite'] },
    { code: 'TES-FS-001', q: 'Melengkapi React: `const [count, setCount] = ___(0)`', opts: ['useMemo', 'useState*', 'useEffect', 'useReducer'] },
    { code: 'TES-FS-001', q: 'Fungsi bcrypt.js dalam backend?', opts: ['Kompresi data', 'Enkripsi password*', 'Validasi email', 'Generate token'] },
    { code: 'TES-FS-001', q: 'Bagaimana cara mencegah SQL Injection?', type: 'ESSAY', ans: 'Menggunakan parameterized queries, ORM, atau prepared statements.' },
    { code: 'TES-FS-001', q: 'Menebak Output: `[1, 2, 3].map(x => x * 2)`', opts: ['[1,2,3]', '[2,4,6]*', '[2,3,4]', 'Error'] },
    { code: 'TES-FS-001', q: 'Melengkapi: Node package manager standar adalah ___', opts: ['npx', 'yarn', 'npm*', 'pnpm'] },

    // --- DB Admin (TES-DB-001) ---
    { code: 'TES-DB-001', q: 'Fungsi dari PRIMARY KEY?', opts: ['Mengenkripsi data', 'Identifikasi unik tiap baris*', 'Mempercepat update', 'Relasi antar tabel'] },
    { code: 'TES-DB-001', q: 'Perbedaan INNER JOIN dan LEFT JOIN?', type: 'ESSAY', ans: 'INNER JOIN mengembalikan baris yang cocok di kedua tabel. LEFT JOIN mengembalikan semua dari tabel kiri, dan yang cocok dari kanan.' },
    { code: 'TES-DB-001', q: 'Melengkapi: `SELECT count(*) ___ users`', opts: ['IN', 'FROM*', 'OF', 'WHERE'] },
    { code: 'TES-DB-001', q: 'Menebak Hasil: `SELECT 1 + NULL`', opts: ['1', '0', 'NULL*', 'Error'] },
    { code: 'TES-DB-001', q: 'Fungsi INDEX dalam database?', opts: ['Enkripsi', 'Mempercepat Read (SELECT)*', 'Mempercepat Write (INSERT)', 'Relasi'] },
    { code: 'TES-DB-001', q: 'Apa itu Normalisasi?', type: 'ESSAY', ans: 'Proses mengorganisasi data untuk meminimalkan redundansi.' },
    { code: 'TES-DB-001', q: 'Tipe data untuk menyimpan teks panjang di PostgreSQL?', opts: ['VARCHAR', 'TEXT*', 'CHAR', 'STRING'] },
    { code: 'TES-DB-001', q: 'Cara menghapus tabel sepenuhnya?', opts: ['DELETE TABLE', 'TRUNCATE TABLE', 'DROP TABLE*', 'REMOVE TABLE'] },
    { code: 'TES-DB-001', q: 'Melengkapi: `UPDATE users ___ age = 20 WHERE id = 1`', opts: ['LET', 'SET*', 'MAKE', 'PUT'] },

    // --- QA (TES-QA-001) ---
    { code: 'TES-QA-001', q: 'Apa itu Regression Testing?', opts: ['Tes performa', 'Tes ulang setelah ada perubahan kode*', 'Tes keamanan', 'Tes UI'] },
    { code: 'TES-QA-001', q: 'Perbedaan White Box dan Black Box testing?', type: 'ESSAY', ans: 'White box melihat struktur kode internal, Black box hanya melihat input dan output.' },
    { code: 'TES-QA-001', q: 'Tools yang populer untuk E2E testing?', opts: ['Jest', 'Cypress*', 'Mocha', 'Chai'] },
    { code: 'TES-QA-001', q: 'Melengkapi: Assert di Jest `expect(1 + 1).____(2)`', opts: ['toBe*', 'equals', 'is', 'match'] },
    { code: 'TES-QA-001', q: 'Apa itu Unit Testing?', opts: ['Test seluruh aplikasi', 'Test komponen/fungsi terkecil*', 'Test server', 'Test database'] },
    { code: 'TES-QA-001', q: 'Sebutkan jenis-jenis tipe testing HTTP API!', type: 'ESSAY', ans: 'Functional testing, Load testing, Security testing, dll.' },
    { code: 'TES-QA-001', q: 'Menebak Status: Login dengan password salah mengembalikan?', opts: ['200', '404', '401*', '500'] },
    { code: 'TES-QA-001', q: 'Siapa yang bertanggung jawab atas kualitas aplikasi?', opts: ['Hanya QA', 'Hanya Developer', 'Seluruh Tim (Dev, QA, PM)*', 'Hanya Client'] },
    { code: 'TES-QA-001', q: 'Melengkapi: BDD singkatan dari Behavior ___ Development', opts: ['Driven*', 'Data', 'Design', 'Direct'] },

    // --- DevOps (TES-DO-001) ---
    { code: 'TES-DO-001', q: 'Apa itu CI/CD?', type: 'ESSAY', ans: 'Continuous Integration / Continuous Deployment: Otomatisasi proses build, test, dan deploy.' },
    { code: 'TES-DO-001', q: 'Perintah membuat Docker image dari Dockerfile?', opts: ['docker create', 'docker build*', 'docker image', 'docker run'] },
    { code: 'TES-DO-001', q: 'Melengkapi: Di Kubernetes, unit terkecil disebut ___', opts: ['Container', 'Node', 'Pod*', 'Cluster'] },
    { code: 'TES-DO-001', q: 'Port default HTTP?', opts: ['443', '8080', '80*', '21'] },
    { code: 'TES-DO-001', q: 'Fungsi Nginx?', opts: ['Database', 'Web Server / Reverse Proxy*', 'Message Broker', 'OS'] },
    { code: 'TES-DO-001', q: 'Jelaskan apa itu Infrastructure as Code (IaC)!', type: 'ESSAY', ans: 'Pengelolaan infrastruktur komputasi melalui file definisi yang dapat dibaca mesin.' },
    { code: 'TES-DO-001', q: 'Platform IaC yang populer?', opts: ['Terraform*', 'React', 'MongoDB', 'Redis'] },
    { code: 'TES-DO-001', q: 'Menebak Output: `chmod 777 file.txt`', opts: ['Read only', 'Full access untuk semua*', 'Hidden file', 'Delete file'] },
    { code: 'TES-DO-001', q: 'Git perintah untuk melihat status file?', opts: ['git check', 'git status*', 'git log', 'git diff'] }
  ];

  for (const item of questionBank) {
    if (item.type === 'ESSAY') {
      await prisma.question.create({
        data: {
          content: item.q,
          type: QuestionType.ESSAY,
          correctAnswer: item.ans,
          point: 20,
          companyId: company.id,
          createdById: admin.id,
          questionCodeId: qCodes[item.code].id,
        }
      });
    } else {
      await prisma.question.create({
        data: {
          content: item.q,
          type: QuestionType.MULTIPLE_CHOICE,
          point: 10,
          companyId: company.id,
          createdById: admin.id,
          questionCodeId: qCodes[item.code].id,
          options: {
            create: (item.opts || []).map((opt, index) => {
              const isCorrect = opt.endsWith('*');
              const text = isCorrect ? opt.slice(0, -1) : opt;
              return { label: String.fromCharCode(65 + index), content: text, isCorrect };
            })
          }
        }
      });
    }
  }

  console.log('✅ 54 Bank Soal berhasil dibuat untuk 6 paket!');

  // 8. Buat Jadwal Tes (Otomatis untuk semua paket)
  const now = new Date();
  const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(now); dayAfter.setDate(dayAfter.getDate() + 3);

  let scheduleIndex = 0;
  for (const p of packages) {
    const start = scheduleIndex < 3 ? now : tomorrow;

    await prisma.testSchedule.upsert({
      where: { codeTest: `SDI-${p.code.split('-')[1]}-2026-001` },
      update: {},
      create: {
        title: `Tes Seleksi ${p.title.split(' ')[0]} - Batch 1`,
        codeTest: `SDI-${p.code.split('-')[1]}-2026-001`,
        questionCodeId: qCodes[p.code].id,
        companyId: company.id,
        startTime: start,
        endTime: dayAfter,
        duration: 90,
        active: true,
      }
    });
    scheduleIndex++;
  }
  console.log('✅ Jadwal tes dibuat untuk 6 paket');

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
  console.log('  User 1: user1@example.com           | password: user123')
  console.log('  User 2: user2@example.com           | password: user123')
  console.log('  User 3: user3@example.com           | password: user123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
