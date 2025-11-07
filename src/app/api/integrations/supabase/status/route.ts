import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

// Load configuration from local file
function loadConfig() {
  try {
    const configPath = join(process.cwd(), '.saanify-restore.json')
    const configData = readFileSync(configPath, 'utf8')
    return JSON.parse(configData)
  } catch (error) {
    console.log('No existing configuration found')
    return {}
  }
}

export async function GET() {
  try {
    const config = loadConfig()
    const isConfigured = config.supabase?.enabled || false
    
    if (!isConfigured) {
      return NextResponse.json({
        configured: false,
        message: 'Not connected to Supabase',
        action: 'connect'
      })
    }

    // Test connection with stored access token
    try {
      const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env
      const access_token = config.supabase?.tokens?.access_token
      
      if (!access_token) {
        return NextResponse.json({
          configured: true,
          message: 'Connected but access token missing',
          action: 'reconnect'
        })
      }

      const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'apikey': SUPABASE_ANON_KEY
        }
      })

      if (!response.ok) {
        return NextResponse.json({
          configured: true,
          message: 'Connected but token invalid',
          action: 'reconnect'
        })
      }

      const data = await response.json()
      
      return NextResponse.json({
        configured: true,
        message: '✅ Supabase connected via OAuth',
        status: 'connected',
        config: {
          organization: config.supabase.organization,
          project: config.supabase.project,
          autoOAuth: config.supabase.autoOAuth
        },
        database: {
          tables: data.length,
          status: 'accessible'
        }
      })

    } catch (error) {
      return NextResponse.json({
        configured: true,
        message: 'Connected but connection test failed',
        action: 'reconnect'
      })
    }

  } catch (error: any) {
    return NextResponse.json({
      configured: false,
      message: 'Configuration error',
      error: error.message
    })
  }
}