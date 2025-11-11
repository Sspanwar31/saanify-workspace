import { NextRequest, NextResponse } from 'next/server'

// Mock secrets storage - in production, use encrypted storage
let mockSecrets = [
  {
    id: '1',
    name: 'DATABASE_URL',
    value: 'https://your-project.supabase.co',
    description: 'Database connection URL',
    lastRotated: new Date(Date.now() - 86400000).toISOString() // 1 day ago
  },
  {
    id: '2',
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlbiI6InNlcnZpY2Utcm9sZSIsImF1ZCI6Imh0dHBzOi8veW91ci1wcm9qZWN0LnN1cGFiYXNlLmNvIiwiaWF0IjoxNjE2MjM5MDIyLCJleHAiOjE5NzE4MDEwMjJ9.example',
    description: 'Service role key for server operations',
    lastRotated: new Date(Date.now() - 172800000).toISOString() // 2 days ago
  }
]

export async function GET() {
  try {
    // In production, fetch from secure encrypted storage
    return NextResponse.json({
      success: true,
      secrets: mockSecrets
    })
  } catch (error) {
    console.error('Failed to fetch secrets:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch secrets'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, value, description } = body

    if (!name || !value) {
      return NextResponse.json({
        success: false,
        error: 'Name and value are required'
      }, { status: 400 })
    }

    const newSecret = {
      id: Date.now().toString(),
      name,
      value,
      description: description || '',
      lastRotated: new Date().toISOString()
    }

    mockSecrets.push(newSecret)

    return NextResponse.json({
      success: true,
      secret: newSecret
    })
  } catch (error) {
    console.error('Failed to create secret:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create secret'
    }, { status: 500 })
  }
}