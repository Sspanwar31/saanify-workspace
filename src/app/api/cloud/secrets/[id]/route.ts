import { NextRequest, NextResponse } from 'next/server'

// Use the same mock data as the main route for consistency
let mockSecrets = [
  {
    id: '1',
    name: 'SUPABASE_URL',
    value: 'https://your-project.supabase.co',
    description: 'Your Supabase project URL',
    lastRotated: new Date('2024-01-15').toISOString(),
    createdAt: new Date('2024-01-15').toISOString()
  },
  {
    id: '2', 
    name: 'SUPABASE_ANON_KEY',
    value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdXItcHJvamVjdCIsImlhdCI6MTY0NjQ3MjAwMCwiZXhwIjoxOTYyMDQ4MDAwfQ.placeholder',
    description: 'Anonymous key for public access',
    lastRotated: new Date('2024-01-10').toISOString(),
    createdAt: new Date('2024-01-10').toISOString()
  },
  {
    id: '3',
    name: 'SUPABASE_SERVICE_KEY',
    value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdXItcHJvamVjdCIsImlhdCI6MTY0NjQ3MjAwMCwiZXhwIjoxOTYyMDQ4MDAwfQ.service-placeholder',
    description: 'Service role key for admin access',
    lastRotated: new Date('2024-01-05').toISOString(),
    createdAt: new Date('2024-01-05').toISOString()
  }
]

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const secret = mockSecrets.find(s => s.id === id)
    if (!secret) {
      return NextResponse.json({
        success: false,
        error: 'Secret not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      secret: secret // Return actual value for edit operations
    })
  } catch (error) {
    console.error('Error fetching secret:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch secret' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const secretIndex = mockSecrets.findIndex(s => s.id === id)
    if (secretIndex === -1) {
      return NextResponse.json({
        success: false,
        error: 'Secret not found'
      }, { status: 404 })
    }

    // Update the secret, preserving lastRotated date unless explicitly changed
    mockSecrets[secretIndex] = { 
      ...mockSecrets[secretIndex], 
      ...body,
      // Only update lastRotated if value changed (rotation)
      lastRotated: body.value !== mockSecrets[secretIndex].value 
        ? new Date().toISOString() 
        : mockSecrets[secretIndex].lastRotated
    }

    return NextResponse.json({
      success: true,
      secret: mockSecrets[secretIndex]
    })
  } catch (error) {
    console.error('Failed to update secret:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update secret'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const secretIndex = mockSecrets.findIndex(s => s.id === id)
    if (secretIndex === -1) {
      return NextResponse.json({
        success: false,
        error: 'Secret not found'
      }, { status: 404 })
    }

    const deletedSecret = mockSecrets[secretIndex]
    mockSecrets.splice(secretIndex, 1)

    return NextResponse.json({
      success: true,
      secret: deletedSecret
    })
  } catch (error) {
    console.error('Failed to delete secret:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to delete secret'
    }, { status: 500 })
  }
}