import { NextRequest, NextResponse } from 'next/server'
import { withAdmin, AuthenticatedRequest } from '@/lib/auth-middleware'
import SupabaseService from '@/lib/supabase-service'
import { db } from '@/lib/db'

interface AutomationLog {
  task_name: string
  status: string
  duration_ms: number
  details?: string
  error?: string
}

async function logAutomation(taskName: string, status: string, durationMs: number, details?: string, error?: string) {
  try {
    await db.automationLog.create({
      data: {
        task_name: taskName,
        status,
        duration_ms: durationMs,
        details,
        error,
        run_time: new Date()
      }
    })
  } catch (logError) {
    console.error('Failed to log automation:', logError)
  }
}

export const POST = withAdmin(async (req: AuthenticatedRequest) => {
  const startTime = Date.now()

  try {
    const supabaseService = SupabaseService.getInstance()
    const client = await supabaseService.getClient()

    if (!client) {
      const error = 'Failed to create Supabase client'
      await logAutomation('Auto-Backup', 'failed', Date.now() - startTime, undefined, error)
      return NextResponse.json({
        success: false,
        error,
        task: 'Auto-Backup',
        status: 'failed'
      }, { status: 500 })
    }

    // Get all local data to backup
    const users = await db.user.findMany()
    const clients = await db.client.findMany()
    const societies = await db.society.findMany()
    const posts = await db.post.findMany()
    const secrets = await db.secret.findMany({ 
      select: { key: true, description: true, lastRotated: true } // Exclude values for security
    })

    // Create backup data
    const backupData = {
      metadata: {
        backup_timestamp: new Date().toISOString(),
        backup_type: 'scheduled',
        version: '1.0',
        source: 'saanify_local_db',
        schedule: 'automatic',
        record_counts: {
          users: users.length,
          clients: clients.length,
          societies: societies.length,
          posts: posts.length,
          secrets: secrets.length
        }
      },
      data: {
        users,
        clients,
        societies,
        posts,
        secrets
      }
    }

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const fileName = `auto-backup-${timestamp}.json`

    // Upload to Supabase Storage
    const { error: uploadError } = await client.storage
      .from('automated-backups')
      .upload(fileName, JSON.stringify(backupData, null, 2), {
        contentType: 'application/json',
        upsert: true
      })

    if (uploadError) {
      const error = `Failed to upload backup to storage: ${uploadError.message}`
      await logAutomation('Auto-Backup', 'failed', Date.now() - startTime, undefined, error)
      return NextResponse.json({
        success: false,
        error,
        task: 'Auto-Backup',
        status: 'failed'
      }, { status: 500 })
    }

    const duration = Date.now() - startTime
    const totalRecords = users.length + clients.length + societies.length + posts.length + secrets.length
    const details = `Scheduled backup completed. Backed up ${totalRecords} records: ${users.length} users, ${clients.length} clients, ${societies.length} societies, ${posts.length} posts, ${secrets.length} secrets. File: ${fileName}`

    await logAutomation('Auto-Backup', 'completed', duration, details)

    return NextResponse.json({
      success: true,
      task: 'Auto-Backup',
      status: 'completed',
      duration: `${(duration / 1000).toFixed(1)}s`,
      details,
      backup_file: fileName,
      backup_bucket: 'automated-backups',
      total_records: totalRecords,
      record_counts: {
        users: users.length,
        clients: clients.length,
        societies: societies.length,
        posts: posts.length,
        secrets: secrets.length
      }
    })

  } catch (error) {
    const duration = Date.now() - startTime
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    
    await logAutomation('Auto-Backup', 'failed', duration, undefined, errorMsg)

    return NextResponse.json({
      success: false,
      error: errorMsg,
      task: 'Auto-Backup',
      status: 'failed',
      duration: `${(duration / 1000).toFixed(1)}s`
    }, { status: 500 })
  }
})

export const GET = withAdmin(async (req: AuthenticatedRequest) => {
  try {
    const supabaseService = SupabaseService.getInstance()
    const client = await supabaseService.getClient()

    if (!client) {
      return NextResponse.json({
        success: false,
        error: 'Failed to create Supabase client'
      }, { status: 500 })
    }

    // List recent auto backups
    const { data: files, error } = await client.storage
      .from('automated-backups')
      .list('', {
        search: 'auto-backup',
        limit: 10,
        sortBy: { column: 'created_at', order: 'desc' }
      })

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 })
    }

    const backups = files?.map(file => ({
      name: file.name,
      size: file.metadata?.size || 0,
      created_at: file.created_at,
      last_modified: file.updated_at || file.created_at
    })) || []

    return NextResponse.json({
      success: true,
      backups,
      total_backups: backups.length,
      backup_bucket: 'automated-backups'
    })

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({
      success: false,
      error: errorMsg
    }, { status: 500 })
  }
})