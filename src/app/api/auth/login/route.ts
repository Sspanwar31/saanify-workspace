import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  userType: z.enum(['client', 'admin']),
  rememberMe: z.boolean().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = loginSchema.parse(body)

    // Authenticate user (in a real app, you'd check your database)
    const user = await authenticateUser(validatedData.email, validatedData.password, validatedData.userType)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = generateToken(user, validatedData.userType)

    // Set HTTP-only cookie for better security
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        company: user.company,
        role: user.role,
        userType: validatedData.userType,
        lastLogin: new Date().toISOString()
      },
      token
    })

    // Set secure cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: validatedData.rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60 // 30 days or 1 day
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

// Helper functions (in a real app, these would interact with your database)
async function authenticateUser(email: string, password: string, userType: string) {
  // Simulate authentication
  // In a real app, you'd:
  // 1. Find user by email in your database
  // 2. Compare hashed passwords
  // 3. Check if user type matches
  // 4. Return user data if valid

  // Demo credentials for testing
  const demoUsers = {
    client: {
      email: 'client@demo.com',
      password: 'Demo123!',
      userData: {
        id: 'client-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'client@demo.com',
        company: 'Demo Corp',
        role: 'developer'
      }
    },
    admin: {
      email: 'admin@saanify.com',
      password: 'Admin123!',
      userData: {
        id: 'admin-123',
        firstName: 'Super',
        lastName: 'Admin',
        email: 'admin@saanify.com',
        company: 'Saanify',
        role: 'administrator'
      }
    }
  }

  const demoUser = demoUsers[userType as keyof typeof demoUsers]
  if (demoUser && demoUser.email === email && demoUser.password === password) {
    return demoUser.userData
  }

  return null
}

function generateToken(user: any, userType: string): string {
  // Simulate JWT generation
  // In a real app, you'd use a proper JWT library with proper signing
  const payload = {
    userId: user.id,
    email: user.email,
    userType: userType,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  }
  
  return Buffer.from(JSON.stringify(payload)).toString('base64')
}