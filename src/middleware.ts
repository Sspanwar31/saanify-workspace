import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAccessToken } from '@/lib/tokens'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Protect SuperAdmin routes
  if (pathname.startsWith('/super-admin')) {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      // Redirect to login if no token
      return NextResponse.redirect(new URL('/login', request.url))
    }

    try {
      // Verify token
      const decoded = verifyAccessToken(token)
      if (!decoded || typeof decoded !== 'object' || !('userId' in decoded)) {
        return NextResponse.redirect(new URL('/not-authorized', request.url))
      }

      // For now, we'll rely on client-side checks for role verification
      // In a real implementation, you'd want to verify the role here too
      // by checking the database or including role in the JWT
      
    } catch (error) {
      return NextResponse.redirect(new URL('/not-authorized', request.url))
    }
  }
  
  // Check if setup mode is enabled and protect setup route
  if (pathname === '/setup') {
    const SETUP_MODE = process.env.SETUP_MODE === 'true'
    
    if (!SETUP_MODE) {
      // If setup mode is disabled, redirect to login
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
    
    // If setup mode is completed, redirect to login
    if (SETUP_MODE === 'false') {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}