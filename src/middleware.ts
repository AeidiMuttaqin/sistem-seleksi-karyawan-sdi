// src/middleware.ts
// Route protection middleware - redirect based on role

import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // If authenticated user tries to access login/register, redirect to their dashboard
    if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
      if (token) {
        if (token.role === 'ADMIN') {
          return NextResponse.redirect(new URL('/admin', req.url))
        }
        return NextResponse.redirect(new URL('/user', req.url))
      }
    }

    // Admin tries to access user routes
    if (pathname.startsWith('/user') && token?.role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin', req.url))
    }

    // User tries to access admin routes
    if (pathname.startsWith('/admin') && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/user', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized({ token, req }) {
        const pathname = req.nextUrl.pathname
        // Allow login and register without auth
        if (pathname === '/login' || pathname === '/register' || pathname === '/') {
          return true
        }
        // Require auth for everything else
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/admin/:path*',
    '/user/:path*',
    '/login',
    '/register',
  ],
}
