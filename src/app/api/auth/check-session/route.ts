import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from '@/lib/tokens'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie or Authorization header
    const token = request.cookies.get('auth-token')?.value || 
                 request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { 
          authenticated: false,
          error: 'No authentication token found'
        },
        { status: 401 }
      )
    }

    // Verify token
    const decoded = verifyAccessToken(token)
    if (!decoded) {
      return NextResponse.json(
        { 
          authenticated: false,
          error: 'Invalid or expired token'
        },
        { status: 401 }
      )
    }

    // Get fresh user data from database
    const user = await db.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        societyAccount: {
          select: {
            id: true,
            name: true,
            status: true,
            subscriptionPlan: true
          }
        }
      }
    })

    if (!user || !user.isActive) {
      return NextResponse.json(
        { 
          authenticated: false,
          error: 'User not found or inactive'
        },
        { status: 401 }
      )
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        lastLoginAt: user.lastLoginAt,
        societyAccount: user.societyAccount
      }
    })

  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json(
      { 
        authenticated: false,
        error: 'Internal server error'
      },
      { status: 500 }
    )
  }
}