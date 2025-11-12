import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
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