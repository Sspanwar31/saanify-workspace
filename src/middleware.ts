import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getServiceClient } from './lib/supabase-service'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Protect SuperAdmin routes
  if (pathname.startsWith('/super-admin') || pathname.startsWith('/api/super-admin')) {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('auth-token')?.value

    if (!token) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      return NextResponse.redirect(new URL('/login', request.url))
    }

    try {
      // Verify token and check SUPERADMIN role
      const supabase = getServiceClient()
      
      // First try to get user from JWT
      const { data: { user }, error: authError } = await supabase.auth.getUser(token)
      
      if (authError || !user) {
        // Fallback: check if it's an automation admin token
        const automationToken = process.env.AUTOMATION_ADMIN_TOKEN
        if (automationToken && token === automationToken) {
          // Allow automation token access
          const response = NextResponse.next()
          response.headers.set('x-user-role', 'SUPERADMIN')
          response.headers.set('x-user-id', 'automation')
          return response
        }
        
        if (pathname.startsWith('/api/')) {
          return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
        }
        return NextResponse.redirect(new URL('/not-authorized', request.url))
      }

      // Check user role in database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (userError || !userData || userData.role !== 'SUPERADMIN') {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
        }
        return NextResponse.redirect(new URL('/not-authorized', request.url))
      }

      // Add user info to headers for downstream use
      const response = NextResponse.next()
      response.headers.set('x-user-id', user.id)
      response.headers.set('x-user-role', userData.role)
      response.headers.set('x-user-email', user.email || '')
      
      return response
      
    } catch (error) {
      console.error('Middleware auth error:', error)
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
      }
      return NextResponse.redirect(new URL('/not-authorized', request.url))
    }
  }
  
  // Check if setup mode is enabled and protect setup route
  if (pathname === '/setup') {
    const SETUP_MODE = process.env.SETUP_MODE === 'true'
    
    if (!SETUP_MODE) {
      // If setup mode is disabled, redirect to login
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    // If setup mode is completed, redirect to login
    if (SETUP_MODE === 'false') {
      return NextResponse.redirect(new URL('/login', request.url))
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