import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    // Get all society accounts
    const societies = await db.societyAccount.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate stats
    const stats = {
      totalClients: societies.length,
      activeClients: societies.filter(s => s.status === 'ACTIVE').length,
      trialClients: societies.filter(s => s.status === 'TRIAL').length,
      expiredClients: societies.filter(s => s.status === 'EXPIRED').length,
      lockedClients: societies.filter(s => s.status === 'LOCKED').length
    }

    return NextResponse.json({
      success: true,
      clients: societies,
      stats
    })

  } catch (error) {
    console.error('Failed to fetch clients:', error)
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      societyName,
      adminName,
      adminEmail,
      adminPhone,
      subscriptionType,
      trialPeriod,
      address,
      city,
      state,
      postalCode,
      totalMembers
    } = await request.json()

    // Validate required fields
    if (!societyName || !adminName || !adminEmail || !totalMembers) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if society with same email already exists
    const existingSociety = await db.societyAccount.findFirst({
      where: { adminEmail }
    })

    if (existingSociety) {
      return NextResponse.json(
        { error: 'A society with this admin email already exists' },
        { status: 400 }
      )
    }

    // Check if user with same email already exists
    const existingUser = await db.user.findFirst({
      where: { email: adminEmail }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 400 }
      )
    }

    // Get current user (super admin) from headers
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Create society account
    const societyData: any = {
      name: societyName,
      adminEmail,
      adminPhone: adminPhone || null,
      status: subscriptionType === 'TRIAL' ? 'TRIAL' : 'ACTIVE',
      subscriptionPlan: subscriptionType,
      totalMembers: parseInt(totalMembers),
      address: address || null,
      city: city || null,
      state: state || null,
      postalCode: postalCode || null,
      createdBy: userId
    }

    if (subscriptionType === 'TRIAL') {
      societyData.trialEndsAt = new Date(Date.now() + trialPeriod * 24 * 60 * 60 * 1000)
    } else {
      societyData.subscriptionEndsAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
    }

    const society = await db.societyAccount.create({
      data: societyData
    })

    // Generate temporary password for admin
    const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
    const hashedPassword = await bcrypt.hash(tempPassword, 10)

    // Create admin user
    const user = await db.user.create({
      data: {
        name: adminName,
        email: adminEmail,
        phone: adminPhone || null,
        password: hashedPassword,
        role: 'CLIENT',
        societyAccountId: society.id,
        isActive: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Client created successfully',
      society,
      user,
      tempPassword // In production, send this via email
    })

  } catch (error) {
    console.error('Failed to create client:', error)
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    )
  }
}