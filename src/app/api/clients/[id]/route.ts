import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PATCH /api/clients/[id] - Update client status or other properties
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { action } = await request.json()
    const clientId = params.id

    // Find the client
    const client = await db.societyAccount.findUnique({
      where: { id: clientId }
    })

    if (!client) {
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
          subscriptionEndsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
          trialEndsAt: null
        }
        break
      
      case 'expire':
        updateData = { status: 'EXPIRED' }
        break
      
      case 'extend_trial':
        const { days } = await request.json()
        const newTrialEnd = new Date()
        newTrialEnd.setDate(newTrialEnd.getDate() + days)
        updateData = {
          status: 'TRIAL',
          trialEndsAt: newTrialEnd
        }
        break
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    const updatedClient = await db.societyAccount.update({
      where: { id: clientId },
      data: updateData
    })

    return NextResponse.json({
      message: `Client ${action} successfully`,
      client: {
        id: updatedClient.id,
        name: updatedClient.name,
        status: updatedClient.status,
        subscriptionPlan: updatedClient.subscriptionPlan,
        trialEndsAt: updatedClient.trialEndsAt?.toISOString(),
        subscriptionEndsAt: updatedClient.subscriptionEndsAt?.toISOString()
      }
    })
  } catch (error) {
    console.error('Error updating client:', error)
    return NextResponse.json(
      { error: 'Failed to update client' },
      { status: 500 }
    )
  }
}

// DELETE /api/clients/[id] - Delete a client
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clientId = params.id

    // Find the client
    const client = await db.societyAccount.findUnique({
      where: { id: clientId },
      include: {
        users: true,
        societies: true
      }
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    // Delete all related users
    await db.user.deleteMany({
      where: { societyAccountId: clientId }
    })

    // Delete all related societies
    await db.society.deleteMany({
      where: { societyAccountId: clientId }
    })

    // Delete the society account
    await db.societyAccount.delete({
      where: { id: clientId }
    })

    return NextResponse.json({
      message: 'Client deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting client:', error)
    return NextResponse.json(
      { error: 'Failed to delete client' },
      { status: 500 }
    )
  }
}