import { NextRequest, NextResponse } from 'next/server'
import { refreshAccessToken } from '@/lib/tokens'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { refreshToken } = body

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token required' },
        { status: 400 }
      )
    }

    const tokens = await refreshAccessToken(refreshToken)

    // Create response with new access token
    const response = NextResponse.json({
      success: true,
      accessToken: tokens.accessToken
    })

    // Update the access token cookie
    response.cookies.set('auth-token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 // 15 minutes
    })

    return response

  } catch (error) {
    console.error('Token refresh error:', error)
    return NextResponse.json(
      { error: 'Failed to refresh token' },
      { status: 401 }
    )
  }
}
