// src/lib/utils.ts
// Utility functions

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string, fmt: string = 'dd MMMM yyyy'): string {
  return format(new Date(date), fmt, { locale: id })
}

export function formatDateTime(date: Date | string): string {
  return format(new Date(date), 'dd MMM yyyy, HH:mm', { locale: id })
}

export function formatTime(date: Date | string): string {
  return format(new Date(date), 'HH:mm')
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: 'Menunggu',
    REVIEWING: 'Sedang Diproses',
    ACCEPTED: 'Diterima',
    REJECTED: 'Ditolak',
    NOT_STARTED: 'Belum Mulai',
    IN_PROGRESS: 'Sedang Mengerjakan',
    SUBMITTED: 'Sudah Dikumpulkan',
    GRADED: 'Sudah Dinilai',
    LULUS: 'Lulus',
    TIDAK_LULUS: 'Tidak Lulus',
    MENUNGGU_PENILAIAN: 'Menunggu Penilaian',
    MULTIPLE_CHOICE: 'Pilihan Ganda',
    ESSAY: 'Essay',
    GENERAL: 'Umum',
    TEST_INVITATION: 'Undangan Tes',
    TEST_RESULT: 'Hasil Tes',
    SELECTION_UPDATE: 'Update Seleksi',
    SYSTEM: 'Sistem',
  }
  return labels[status] || status
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    REVIEWING: 'bg-blue-100 text-blue-800',
    ACCEPTED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    NOT_STARTED: 'bg-gray-100 text-gray-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    SUBMITTED: 'bg-purple-100 text-purple-800',
    GRADED: 'bg-green-100 text-green-800',
    LULUS: 'bg-green-100 text-green-800',
    TIDAK_LULUS: 'bg-red-100 text-red-800',
    MENUNGGU_PENILAIAN: 'bg-yellow-100 text-yellow-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export function generateCode(prefix: string = 'SDI'): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}
