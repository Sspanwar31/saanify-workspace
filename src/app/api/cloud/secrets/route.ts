import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for secrets (in production, use encrypted database)
let secrets: any[] = [
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

export async function GET(request: NextRequest) {
  try {
    // Return secrets without exposing actual values
    const safeSecrets = secrets.map(secret => ({
      ...secret,
      value: '•'.repeat(20) // Mask the actual value
    }))

    return NextResponse.json({
      success: true,
      secrets: safeSecrets
    })
  } catch (error) {
    console.error('Error fetching secrets:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch secrets' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, value, description } = body

    if (!name || !value) {
      return NextResponse.json(
        { success: false, error: 'Name and value are required' },
        { status: 400 }
      )
    }

    const newSecret = {
      id: Date.now().toString(),
      name,
      value,
      description: description || '',
      lastRotated: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }

    secrets.push(newSecret)

    return NextResponse.json({
      success: true,
      secret: {
        ...newSecret,
        value: '•'.repeat(20) // Mask the value in response
      }
    })
  } catch (error) {
    console.error('Error creating secret:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create secret' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Secret ID is required' },
        { status: 400 }
      )
    }

    const initialLength = secrets.length
    secrets = secrets.filter(secret => secret.id !== id)

    if (secrets.length === initialLength) {
      return NextResponse.json(
        { success: false, error: 'Secret not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Secret deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting secret:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete secret' },
      { status: 500 }
    )
  }
}