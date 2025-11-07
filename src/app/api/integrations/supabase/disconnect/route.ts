import { NextResponse } from 'next/server'
import { readFileSync, writeFileSync } from 'fs'
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
    console.log('✅ Supabase configuration updated')
    return updatedConfig
  } catch (error) {
    console.error('Failed to update configuration:', error)
    throw error
  }
}

export async function POST() {
  try {
    // Clear Supabase configuration
    const updatedConfig = saveConfig({
      enabled: false,
      autoOAuth: false,
      organization: null,
      project: null,
      tokens: null
    })

    return NextResponse.json({
      message: '🔌 Supabase disconnected',
      success: true,
      config: {
        enabled: false
      }
    })

  } catch (error: any) {
    return NextResponse.json({
      error: 'Failed to disconnect',
      details: error.message
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const config = loadConfig()
    const isConfigured = config.supabase?.enabled || false
    
    return NextResponse.json({
      message: 'Supabase disconnect endpoint',
      configured: isConfigured,
      action: isConfigured ? 'disconnect' : 'connect'
    })
  } catch (error: any) {
    return NextResponse.json({
      error: 'Configuration error',
      details: error.message
    })
  }
}