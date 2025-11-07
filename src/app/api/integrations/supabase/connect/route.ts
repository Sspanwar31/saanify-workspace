import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { handleApiError } from '@/lib/error-handling'
import { writeFileSync, readFileSync } from 'fs'
import { join } from 'path'
import crypto from 'crypto'

// Supabase OAuth configuration
const SUPABASE_CLIENT_ID = process.env.SUPABASE_CLIENT_ID || 'your-client-id'
const SUPABASE_REDIRECT_URI = process.env.NEXTAUTH_URL 
  ? `${process.env.NEXTAUTH_URL}/api/integrations/supabase/callback`
  : 'http://localhost:3000/api/integrations/supabase/callback'

// Encrypt sensitive data
function encrypt(text: string): string {
  const algorithm = 'aes-256-gcm'
  const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'fallback-key-32-chars-long', 'salt', 100000)
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipher(algorithm, key, iv)
  
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted = cipher.final('hex')
  
  return iv.toString('hex') + ':' + encrypted
}

function decrypt(encryptedData: string): string {
  const algorithm = 'aes-256-gcm'
  const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'fallback-key-32-chars-long', 'salt', 100000)
  const textParts = encryptedData.split(':')
  const iv = Buffer.from(textParts[0], 'hex')
  const encryptedText = Buffer.from(textParts[1], 'hex')
  const decipher = crypto.createDecipher(algorithm, key, iv)
  
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
  decrypted = decipher.final('utf8')
  
  return decrypted
}

// Store configuration in local file
function saveConfig(config: any) {
  try {
    const configPath = join(process.cwd(), '.saanify-restore.json')
    const existingConfig = readFileSync(configPath, 'utf8')
    const parsedConfig = existingConfig ? JSON.parse(existingConfig) : {}
    
    const updatedConfig = {
      ...parsedConfig,
      supabase: {
        ...parsedConfig.supabase,
        ...config
      }
    }
    
    writeFileSync(configPath, JSON.stringify(updatedConfig, null, 2))
    console.log('✅ Supabase configuration saved')
    return updatedConfig
  } catch (error) {
    console.error('Failed to save configuration:', error)
    throw error
  }
}

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
    
    return NextResponse.json({
      message: 'Supabase OAuth integration endpoint',
      configured: isConfigured,
      config: isConfigured ? {
        organization: config.supabase.organization,
        project: config.supabase.project,
        autoOAuth: config.supabase.autoOAuth
      } : null,
      usage: 'POST with { action: "connect" } to start OAuth flow'
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()
    
    if (action !== 'connect') {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }

    // Generate OAuth state for security
    const state = crypto.randomBytes(32).toString('hex')
    
    // Store state in session for verification
    const stateData = {
      state,
      timestamp: Date.now()
    }
    
    // Create OAuth authorization URL
    const authUrl = new URL('https://supabase.com/dashboard/oauth/authorize')
    authUrl.searchParams.set('client_id', SUPABASE_CLIENT_ID)
    authUrl.searchParams.set('redirect_uri', SUPABASE_REDIRECT_URI)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('state', state)
    authUrl.searchParams.set('scope', 'openid profile email')
    authUrl.searchParams.set('access_type', 'offline')
    authUrl.searchParams.set('prompt', 'consent')

    return NextResponse.json({
      message: '🔗 Redirecting to Supabase OAuth...',
      authUrl: authUrl.toString(),
      state: state,
      redirect: true
    })

  } catch (error: any) {
    console.error('Supabase OAuth error:', error)
    return handleApiError(error)
  }
}