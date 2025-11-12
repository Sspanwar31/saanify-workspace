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

export async function POST(
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

    // Generate new secret value (in production, use proper cryptographic methods)
    const newValue = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' + Math.random().toString(36).substring(2, 15) + '.' + Math.random().toString(36).substring(2, 15)
    
    // Update the secret with new value and rotation timestamp
    mockSecrets[secretIndex] = {
      ...mockSecrets[secretIndex],
      value: newValue,
      lastRotated: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      secret: mockSecrets[secretIndex]
    })
  } catch (error) {
    console.error('Error rotating secret:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to rotate secret' },
      { status: 500 }
    )
  }
}