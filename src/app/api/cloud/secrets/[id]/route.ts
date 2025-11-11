import { NextRequest, NextResponse } from 'next/server'

// Mock secrets storage - should be the same as in the main route
let mockSecrets = [
  {
    id: '1',
    name: 'DATABASE_URL',
    value: 'https://your-project.supabase.co',
    description: 'Database connection URL',
    lastRotated: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: '2',
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlbiI6InNlcnZpY2Utcm9sZSIsImF1ZCI6Imh0dHBzOi8veW91ci1wcm9qZWN0LnN1cGFiYXNlLmNvIiwiaWF0IjoxNjE2MjM5MDIyLCJleHAiOjE5NzE4MDEwMjJ9.example',
    description: 'Service role key for server operations',
    lastRotated: new Date(Date.now() - 172800000).toISOString()
  }
]

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

    mockSecrets[secretIndex] = { ...mockSecrets[secretIndex], ...body }

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