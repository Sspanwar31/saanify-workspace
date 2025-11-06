import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { handleApiError } from '@/lib/error-handling'

export async function POST(request: NextRequest) {
  try {
    const { supabaseUrl, anonKey } = await request.json()
    
    if (!supabaseUrl || !anonKey) {
      return NextResponse.json(
        { error: 'Missing Supabase URL or Anon Key' },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(supabaseUrl)
    } catch {
      return NextResponse.json(
        { error: 'Invalid Supabase URL format' },
        { status: 400 }
      )
    }

    // Test connection with provided credentials
    const supabase = createClient(supabaseUrl, anonKey)
    
    // Test basic connectivity with a simple query
    const { data, error } = await supabase.from('users').select('*').limit(1)
    
    if (error) {
      // If table doesn't exist, that's actually okay for validation
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          message: '✅ Valid Supabase credentials - Tables not created yet',
          status: 'valid',
          needsSetup: true,
          details: {
            url: supabaseUrl,
            connection: 'successful',
            tables: 'not_created'
          }
        })
      }
      
      // Other errors mean invalid credentials
      return NextResponse.json(
        { 
          error: 'Invalid Supabase credentials',
          details: error.message,
          code: error.code
        },
        { status: 401 }
      )
    }

    // If we get here, connection is successful and tables exist
    return NextResponse.json({
      message: '✅ Valid Supabase credentials - Tables already exist',
      status: 'valid',
      needsSetup: false,
      details: {
        url: supabaseUrl,
        connection: 'successful',
        tables: 'exist'
      }
    })

  } catch (error: any) {
    console.error('Supabase validation error:', error)
    return handleApiError(error)
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Supabase validation endpoint',
    usage: 'POST with { supabaseUrl, anonKey }'
  })
}