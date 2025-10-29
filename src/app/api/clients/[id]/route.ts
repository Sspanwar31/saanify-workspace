import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { action } = await request.json()
    const clientId = params.id

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      )
    }

    // Find the society account
    const society = await db.societyAccount.findUnique({
      where: { id: clientId }
    })

    if (!society) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    let updateData: any = {}

    switch (action) {
      case 'lock':
        updateData = { status: 'LOCKED' }
        break
      case 'unlock':
        updateData = { status: 'ACTIVE' }
        break
      case 'activate':
        updateData = { 
          status: 'ACTIVE',
          subscriptionEndsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
        }
        break
      case 'extend_trial':
        updateData = {
          status: 'TRIAL',
          trialEndsAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) // 15 days
        }
        break
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    const updatedSociety = await db.societyAccount.update({
      where: { id: clientId },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      message: `Client ${action} successfully`,
      society: updatedSociety
    })

  } catch (error) {
    console.error('Failed to update client:', error)
    return NextResponse.json(
      { error: 'Failed to update client' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clientId = params.id

    // Find the society account
    const society = await db.societyAccount.findUnique({
      where: { id: clientId },
      include: { users: true }
    })

    if (!society) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    // Soft delete by setting isActive to false
    await db.societyAccount.update({
      where: { id: clientId },
      data: { isActive: false }
    })

    // Also deactivate all users associated with this society
    await db.user.updateMany({
      where: { societyAccountId: clientId },
      data: { isActive: false }
    })

    return NextResponse.json({
      success: true,
      message: 'Client deleted successfully'
    })

  } catch (error) {
    console.error('Failed to delete client:', error)
    return NextResponse.json(
      { error: 'Failed to delete client' },
      { status: 500 }
    )
  }
}