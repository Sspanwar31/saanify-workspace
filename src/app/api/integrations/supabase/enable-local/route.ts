import { NextResponse } from 'next/server'
import { writeFileSync, existsSync, readFileSync } from 'fs'
import { join } from 'path'

export async function POST() {
  try {
    // Update .env.local to enable local database
    const envPath = join(process.cwd(), '.env.local')
    
    let envContent = ''
    if (existsSync(envPath)) {
      envContent = readFileSync(envPath, 'utf8')
    }
    
    // Ensure LOCAL_DB_ENABLED is set to true
    const lines = envContent.split('\n')
    let localDbEnabled = false
    
    const updatedLines = lines.map(line => {
      if (line.startsWith('LOCAL_DB_ENABLED=')) {
        localDbEnabled = true
        return 'LOCAL_DB_ENABLED=true'
      }
      return line
    })
    
    // If LOCAL_DB_ENABLED wasn't found, add it
    if (!localDbEnabled) {
      updatedLines.push('LOCAL_DB_ENABLED=true')
    }
    
    // Write back to .env.local
    writeFileSync(envPath, updatedLines.join('\n'))
    
    // Update process.env for current request
    process.env.LOCAL_DB_ENABLED = 'true'
    
    return NextResponse.json({
      success: true,
      message: 'Local database enabled successfully',
      config: {
        type: 'local',
        status: 'active',
        message: 'SQLite local database is ready'
      }
    })
    
  } catch (error: any) {
    console.error('Error enabling local database:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to enable local database: ' + error.message
    }, { status: 500 })
  }
}