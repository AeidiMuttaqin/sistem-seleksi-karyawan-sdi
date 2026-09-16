// src/app/layout.tsx
// Root layout - applies to all pages

import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: {
    default: 'Sistem Seleksi Karyawan - PT. Solusi Datamart Indonesia',
    template: '%s | PT. Solusi Datamart Indonesia',
  },
  description: 'Sistem Informasi Seleksi Calon Karyawan Berbasis Web pada PT. Solusi Datamart Indonesia',
  keywords: ['seleksi karyawan', 'recruitment', 'sistem informasi', 'HRD'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
