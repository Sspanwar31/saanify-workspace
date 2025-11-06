import { NextRequest, NextResponse } from 'next/server'
import { isSupabaseConfigured } from '@/lib/supabaseClient'

export async function GET() {
  try {
    const isConfigured = isSupabaseConfigured()
    
    if (!isConfigured) {
      return NextResponse.json({
        status: 'Not Configured',
        message: 'Please update .env.local with Supabase credentials',
        configured: false
      })
    }

    // Test connection
    const { supabase } = await import('@/lib/supabaseClient')
    const { data, error } = await supabase.from('users').select('count').limit(1)
    
    return NextResponse.json({
      status: error ? 'Error' : 'Connected',
      configured: true,
      tables: error ? 'Not created' : 'Available',
      rls: error ? 'Not applied' : 'Active'
    })

  } catch (error: any) {
    return NextResponse.json({
      status: 'Error',
      message: 'Failed to check Supabase status',
      configured: false,
      error: error.message
    }, { status: 500 })
  }
}