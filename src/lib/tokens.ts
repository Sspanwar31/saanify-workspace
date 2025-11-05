import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { db } from '@/lib/db'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret-key'

export function generateTokens(payload: any) {
  // Access token (short-lived - 15 minutes)
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' })
  
  // Refresh token (long-lived - 7 days)
  const refreshToken = jwt.sign(
    { userId: payload.userId, tokenVersion: 1 },
    REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  )

  return { accessToken, refreshToken }
}

export function verifyAccessToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

export function verifyRefreshToken(token: string) {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET)
  } catch (error) {
    return null
  }
}

export async function refreshAccessToken(refreshToken: string) {
  try {
    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken)
    if (!decoded || !decoded.userId) {
      throw new Error('Invalid refresh token')
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, societyAccountId: true, isActive: true }
    })

    if (!user || !user.isActive) {
      throw new Error('User not found or inactive')
    }

    // Generate new tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
      societyAccountId: user.societyAccountId
    })

    return tokens
  } catch (error) {
    throw new Error('Failed to refresh token')
  }
}
