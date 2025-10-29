import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Routes that require authentication
const protectedRoutes = ['/admin/dashboard', '/client/dashboard', '/dashboard']
const publicRoutes = ['/', '/login', '/signup', '/api/auth/login', '/api/auth/signup', '/api/auth/check-session']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  
  if (!isProtectedRoute) {
    return NextResponse.next()
  }

  // Get token from cookie
  const token = request.cookies.get('auth-token')?.value

  if (!token) {
    // Redirect to login if no token
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any
    
    // Check role-based access
    if (pathname.startsWith('/admin') && decoded.role !== 'SUPER_ADMIN') {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('error', 'admin_required')
      return NextResponse.redirect(loginUrl)
    }

    if (pathname.startsWith('/client') && decoded.role !== 'CLIENT') {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('error', 'client_required')
      return NextResponse.redirect(loginUrl)
    }

    // Add user info to headers for server-side usage
    const response = NextResponse.next()
    response.headers.set('x-user-id', decoded.userId)
    response.headers.set('x-user-role', decoded.role)
    response.headers.set('x-user-email', decoded.email)
    
    return response

  } catch (error) {
    // Invalid token - redirect to login
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('error', 'invalid_token')
    return NextResponse.redirect(loginUrl)
  }
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