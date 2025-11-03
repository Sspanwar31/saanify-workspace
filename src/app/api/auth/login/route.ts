import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { generateTokens } from '@/lib/tokens'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  userType: z.enum(['client', 'admin']).optional(),
  rememberMe: z.boolean().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Login attempt:', body)
    
    // Validate input
    const validatedData = loginSchema.parse(body)
    console.log('Validated data:', validatedData)

    // Find user by email
    const user = await db.user.findUnique({
      where: { email: validatedData.email }
    })
    
    console.log('Found user:', user ? { id: user.id, email: user.email, role: user.role, isActive: user.isActive } : null)

    if (!user) {
      console.log('User not found')
      return NextResponse.json(
        { error: 'Invalid credentials - User not found' },
        { status: 401 }
      )
    }

    // Check if user is active
    if (!user.isActive) {
      console.log('User not active')
      return NextResponse.json(
        { error: 'Account is deactivated' },
        { status: 401 }
      )
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(validatedData.password, user.password)
    console.log('Password valid:', isPasswordValid)
    
    if (!isPasswordValid) {
      console.log('Invalid password')
      return NextResponse.json(
        { error: 'Invalid credentials - Wrong password' },
        { status: 401 }
      )
    }

    // Check role compatibility with strict validation
    if (validatedData.userType) {
      console.log('Role check - user.role:', user.role, 'requested userType:', validatedData.userType)
      
      if (validatedData.userType === 'admin' && user.role !== 'SUPER_ADMIN') {
        console.log('Access denied - not admin')
        return NextResponse.json(
          { error: 'Access denied. Admin privileges required.' },
          { status: 403 }
        )
      }
      if (validatedData.userType === 'client' && user.role !== 'CLIENT') {
        console.log('Access denied - not client')
        return NextResponse.json(
          { error: 'Access denied. Client privileges required.' },
          { status: 403 }
        )
      }
    }

    // Update last login
    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })

    // Generate tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
      societyAccountId: user.societyAccountId
    })

    // Create response with cookies
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    })

    // Set access token cookie (short-lived)
    response.cookies.set('auth-token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 // 15 minutes
    })

    // Set refresh token cookie (long-lived)
    response.cookies.set('refresh-token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: validatedData.rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60 // 30 days or 7 days
    })

    return response

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      )
    }

    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}