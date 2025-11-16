import { NextRequest, NextResponse } from 'next/server'
import { supabaseService } from '@/lib/supabase-service'
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

    // For now, just check if token exists and has reasonable length
    // In production, you'd want to verify JWT structure with Supabase
    if (token.length < 10) {
      return NextResponse.json(
        { 
          authenticated: false,
          error: 'Invalid token format'
        },
        { status: 401 }
      )
    }

    // Try to get user from database using a simple approach
    // This is a temporary solution - in production, verify with Supabase
    try {
      // For demo purposes, we'll return a mock authenticated user
      // In production, you'd verify the JWT and get user from Supabase
      return NextResponse.json({
        authenticated: true,
        user: {
          id: 'demo-user-id',
          email: 'demo@saanify.com',
          name: 'Demo User',
          role: 'user',
          lastLoginAt: new Date().toISOString()
        }
      })
    } catch (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { 
          authenticated: false,
          error: 'Database error'
        },
        { status: 500 }
      )
    }
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