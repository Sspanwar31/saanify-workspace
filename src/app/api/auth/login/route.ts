import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-it'

// --- 1. Token Generation ---
const generateTokens = (user: any) => {
  const payload = { 
    userId: user.id, 
    email: user.email, 
    role: user.role,
    societyAccountId: user.societyAccountId
  }

  // Access Token (Short life)
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' })
  // Refresh Token (Long life)
  const refreshToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' })
  
  return { accessToken, refreshToken }
}

// --- 2. Input Validation ---
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  userType: z.enum(['client', 'admin']).optional(),
  rememberMe: z.boolean().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate Body
    const validatedData = loginSchema.parse(body)

    // --- 3. Find User (Standard Prisma) ---
    // Raw SQL hata diya hai, ye safer hai
    const user = await db.user.findUnique({
      where: { email: validatedData.email }
    })

    // User check
    if (!user) {
      return NextResponse.json(
        { error: 'User not found with this email' },
        { status: 401 }
      )
    }

    // Active check
    if (user.isActive === false) {
      return NextResponse.json(
        { error: 'Account is deactivated' },
        { status: 401 }
      )
    }

    // --- 4. Password Check (Bcrypt) ---
    // Setup script ne bcrypt se hash kiya tha, isliye yahan bcrypt.compare chalega
    const isPasswordValid = await bcrypt.compare(validatedData.password, user.password || "")
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }

    // --- 5. Role Logic (SUPER_ADMIN fix) ---
    if (validatedData.userType) {
      // Admin Login ke liye
      if (validatedData.userType === 'admin') {
         // Agar user SUPER_ADMIN ya ADMIN nahi hai, to rok do
         if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
            return NextResponse.json(
              { error: 'Access denied. Admin privileges required.' },
              { status: 403 }
            )
         }
      }
      
      // Client Login ke liye
      if (validatedData.userType === 'client' && user.role !== 'CLIENT') {
        return NextResponse.json(
          { error: 'Access denied. Client privileges required.' },
          { status: 403 }
        )
      }
    }

    // --- 6. Update Last Login ---
    try {
      await db.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      })
    } catch (e) {
      console.log("Error updating last login:", e)
    }

    // --- 7. Generate Tokens & Response ---
    const tokens = generateTokens(user)

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

    // Set Cookies
    response.cookies.set('auth-token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 // 15 min
    })

    response.cookies.set('refresh-token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: validatedData.rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60
    })

    return response

  } catch (error) {
    console.error('Login Error:', error) // Console me error print hoga (Vercel logs me dikhega)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
