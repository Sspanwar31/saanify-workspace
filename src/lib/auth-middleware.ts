import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string
    email: string
    role: 'SUPER_ADMIN' | 'CLIENT'
    societyAccountId?: string
  }
}

export function withAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    try {
      // Get token from cookie or Authorization header
      const token = req.cookies.get('auth-token')?.value || 
                   req.headers.get('authorization')?.replace('Bearer ', '')

      if (!token) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }

      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET) as any
      
      // Add user info to request
      const authenticatedReq = req as AuthenticatedRequest
      authenticatedReq.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        societyAccountId: decoded.societyAccountId
      }

      return await handler(authenticatedReq)
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }
  }
}

export function withRole(allowedRoles: ('SUPER_ADMIN' | 'CLIENT')[]) {
  return function(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
    return withAuth(async (req: AuthenticatedRequest) => {
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        )
      }

      return await handler(req)
    })
  }
}

export function withAdmin(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return withRole(['SUPER_ADMIN'])(handler)
}

export function withClient(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return withRole(['CLIENT'])(handler)
}

export function withAnyRole(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return withRole(['SUPER_ADMIN', 'CLIENT'])(handler)
}