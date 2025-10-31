import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that require authentication
const protectedRoutes = ['/dashboard/admin', '/dashboard/client', '/dashboard']
const publicRoutes = ['/', '/login', '/signup', '/api/auth/login', '/api/auth/signup', '/api/auth/check-session', '/api/auth/refresh']

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
    // Redirect to home if no token
    return NextResponse.redirect(new URL('/', request.url))
  }

  // For now, just check if token exists (you can implement proper JWT verification in API routes)
  // Add user info to headers for server-side usage (this would come from decoded JWT in a real implementation)
  const response = NextResponse.next()
  response.headers.set('x-user-token', token)
  
  return response
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