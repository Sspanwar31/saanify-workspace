import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

// Schema for creating a new client
const createClientSchema = z.object({
  societyName: z.string().min(1, 'Society name is required'),
  adminName: z.string().min(1, 'Admin name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  subscriptionType: z.enum(['TRIAL', 'BASIC', 'PRO', 'ENTERPRISE']),
  trialPeriod: z.string().optional()
})

// GET /api/clients - Fetch all clients
export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and is super admin
    const authHeader = request.headers.get('authorization')
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // For now, we'll skip token verification and just fetch clients
    // In production, you should verify the JWT token here

    const clients = await db.societyAccount.findMany({
      include: {
        users: {
          where: {
            role: 'CLIENT'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const formattedClients = clients.map(client => ({
      id: client.id,
      name: client.name,
      adminName: client.adminName,
      email: client.email,
      phone: client.phone,
      status: client.status,
      subscriptionPlan: client.subscriptionPlan,
      trialEndsAt: client.trialEndsAt?.toISOString(),
      subscriptionEndsAt: client.subscriptionEndsAt?.toISOString(),
      createdAt: client.createdAt.toISOString(),
      usersCount: client.users.length
    }))

    return NextResponse.json({ clients: formattedClients })
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    )
  }
}

// POST /api/clients - Create a new client
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createClientSchema.parse(body)

    // Check if society account with this email already exists
    const existingSociety = await db.societyAccount.findUnique({
      where: { email: validatedData.email }
    })

    if (existingSociety) {
      return NextResponse.json(
        { error: 'A society with this email already exists' },
        { status: 400 }
      )
    }

    // Calculate trial end date if it's a trial subscription
    let trialEndsAt = null
    if (validatedData.subscriptionType === 'TRIAL' && validatedData.trialPeriod) {
      const trialDays = parseInt(validatedData.trialPeriod)
      trialEndsAt = new Date()
      trialEndsAt.setDate(trialEndsAt.getDate() + trialDays)
    }

    // Create society account
    const societyAccount = await db.societyAccount.create({
      data: {
        name: validatedData.societyName,
        adminName: validatedData.adminName,
        email: validatedData.email,
        phone: validatedData.phone || null,
        subscriptionPlan: validatedData.subscriptionType,
        status: validatedData.subscriptionType === 'TRIAL' ? 'TRIAL' : 'ACTIVE',
        trialEndsAt: trialEndsAt,
        subscriptionEndsAt: validatedData.subscriptionType !== 'TRIAL' ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : null // 1 year for paid plans
      }
    })

    // Generate a default password for the admin
    const defaultPassword = 'Saanify@123'
    const hashedPassword = await bcrypt.hash(defaultPassword, 10)

    // Create admin user for the society
    const adminUser = await db.user.create({
      data: {
        name: validatedData.adminName,
        email: validatedData.email,
        password: hashedPassword,
        role: 'CLIENT',
        societyAccountId: societyAccount.id,
        isActive: true
      }
    })

    return NextResponse.json({
      message: 'Client created successfully',
      client: {
        id: societyAccount.id,
        name: societyAccount.name,
        adminName: societyAccount.adminName,
        email: societyAccount.email,
        phone: societyAccount.phone,
        status: societyAccount.status,
        subscriptionPlan: societyAccount.subscriptionPlan,
        trialEndsAt: societyAccount.trialEndsAt?.toISOString(),
        subscriptionEndsAt: societyAccount.subscriptionEndsAt?.toISOString(),
        createdAt: societyAccount.createdAt.toISOString(),
        defaultPassword // Return default password for first login
      }
    })
  } catch (error) {
    console.error('Error creating client:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    )
  }
}