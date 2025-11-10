import { NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { createClient } from '@supabase/supabase-js'

// Load Supabase configuration from local file
function loadSupabaseConfig() {
  try {
    const configPath = join(process.cwd(), 'config', 'supabase-config.json')
    if (!existsSync(configPath)) {
      return {}
    }
    const configData = readFileSync(configPath, 'utf8')
    return JSON.parse(configData)
  } catch (error) {
    console.log('No existing Supabase configuration found')
    return {}
  }
}

// Load environment configuration
function loadEnvConfig() {
  try {
    // First try to get from process.env (runtime)
    const envConfig = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
    }
    
    // If runtime env vars are available, use them
    if (envConfig.NEXT_PUBLIC_SUPABASE_URL && envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return envConfig
    }
    
    // Fallback to .env.local file
    const configPath = join(process.cwd(), '.env.local')
    if (!existsSync(configPath)) {
      return {}
    }
    const configData = readFileSync(configPath, 'utf8')
    const fallbackEnvConfig: Record<string, string> = {}
    configData.split('\n').forEach(line => {
      const [key, ...values] = line.split('=')
      if (key && values.length > 0) {
        fallbackEnvConfig[key.trim()] = values.join('=').trim()
      }
    })
    return fallbackEnvConfig
  } catch (error) {
    console.log('No environment configuration found')
    return {}
  }
}

export async function GET() {
  try {
    const envConfig = loadEnvConfig()
    const supabaseConfig = loadSupabaseConfig()
    const isConfigured = !!(envConfig.NEXT_PUBLIC_SUPABASE_URL && envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    
    // Check if local database is enabled and exists
    const localDbEnabled = process.env.LOCAL_DB_ENABLED === 'true'
    const localDbExists = existsSync(join(process.cwd(), 'prisma', 'dev.db'))
    
    if (!isConfigured && localDbEnabled && localDbExists) {
      return NextResponse.json({
        connected: true,
        configured: true,
        message: '✅ Local SQLite database active',
        action: 'configure',
        connectionType: 'local',
        config: {
          type: 'local',
          status: 'active',
          message: 'Local database is ready for use',
          location: 'prisma/dev.db'
        }
      })
    }
    
    if (!isConfigured && localDbEnabled && !localDbExists) {
      return NextResponse.json({
        connected: false,
        configured: false,
        message: 'Local database enabled but file not found',
        action: 'setup',
        connectionType: 'local',
        config: {
          type: 'local',
          status: 'needs_setup',
          message: 'Run database setup to create local SQLite file'
        }
      })
    }
    
    if (!isConfigured) {
      return NextResponse.json({
        connected: false,
        configured: false,
        message: 'Not connected to Supabase',
        action: 'connect',
        connectionType: 'none',
        config: null
      })
    }

    // Check OAuth connection first
    if (supabaseConfig.tokens?.access_token) {
      try {
        const supabase = createClient(
          envConfig.NEXT_PUBLIC_SUPABASE_URL,
          supabaseConfig.tokens.access_token
        )
        
        // Test connection with a simple query
        const { data, error } = await supabase.from('_test_connection').select('1').limit(1)
        
        if (!error || error.code === 'PGRST116') {
          return NextResponse.json({
            connected: true,
            configured: true,
            message: '✅ Supabase connected via OAuth',
            status: 'connected',
            connectionType: 'oauth',
            config: {
              user: supabaseConfig.user,
              project: supabaseConfig.project,
              organization: supabaseConfig.organization,
              connected_at: supabaseConfig.connected_at
            }
          })
        }
      } catch (error) {
        console.log('OAuth connection failed:', error.message)
      }
    }

    // Fallback to manual setup with anon key
    try {
      const supabase = createClient(
        envConfig.NEXT_PUBLIC_SUPABASE_URL,
        envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )
      
      // Test basic connectivity
      const { data, error } = await supabase.from("profiles").select("*").limit(1)
      
      if (error) {
        if (error.code === 'PGRST116') {
          return NextResponse.json({
            connected: true,
            configured: true,
            message: '✅ Valid credentials - Tables not created yet',
            status: 'connected',
            connectionType: 'manual',
            needsSetup: true,
            config: {
              url: envConfig.NEXT_PUBLIC_SUPABASE_URL,
              connection: 'successful',
              tables: 'not_created'
            }
          })
        }
        
        return NextResponse.json({
          connected: false,
          configured: true,
          message: '❌ Connection failed - Check credentials',
          status: 'error',
          connectionType: 'manual',
          error: error.message,
          config: {
            url: envConfig.NEXT_PUBLIC_SUPABASE_URL,
            error: error.code
          }
        })
      }

      // If we get here, connection is successful and tables exist
      return NextResponse.json({
        connected: true,
        configured: true,
        message: '✅ Supabase connected successfully',
        status: 'connected',
        connectionType: 'manual',
        config: {
          url: envConfig.NEXT_PUBLIC_SUPABASE_URL,
          connection: 'successful',
          tables: 'exist'
        }
      })

    } catch (error: any) {
      console.error('Supabase status check error:', error)
      return NextResponse.json({
        connected: false,
        configured: false,
        message: 'Connection test failed',
        status: 'error',
        error: error.message,
        config: null
      })
    }

  } catch (error: any) {
    return NextResponse.json({
      connected: false,
      configured: false,
      message: 'Configuration error',
      error: error.message,
      config: null
    })
  }
}