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
    // Try to create the log entry, but don't fail if the table doesn't exist yet
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
    // If the table doesn't exist, just log to console and continue
    console.log('Automation log:', { taskName, status, durationMs, details, error })
    console.warn('Failed to log to database (table may not exist):', logError)
  }
}

export const POST = withAdmin(async (req: AuthenticatedRequest) => {
  const startTime = Date.now()

  try {
    const body = await req.json()
    const { backupId, targetPath } = body

    if (!backupId) {
      return NextResponse.json({
        success: false,
        error: 'Backup ID is required'
      }, { status: 400 })
    }

    const supabaseService = SupabaseService.getInstance()
    const client = await supabaseService.getClient()

    if (!client) {
      const error = 'Failed to create Supabase client'
      await logAutomation('Backup & Restore', 'failed', Date.now() - startTime, undefined, error)
      return NextResponse.json({
        success: false,
        error,
        task: 'Backup & Restore',
        status: 'failed'
      }, { status: 500 })
    }

    // Download backup from storage
    const { data: backupFile, error: downloadError } = await client.storage
      .from('automated-backups')
      .download(backupId)

    if (downloadError) {
      const error = `Failed to download backup: ${downloadError.message}`
      await logAutomation('Backup & Restore', 'failed', Date.now() - startTime, undefined, error)
      return NextResponse.json({
        success: false,
        error,
        task: 'Backup & Restore',
        status: 'failed'
      }, { status: 500 })
    }

    // Parse backup data
    const backupData = JSON.parse(await backupFile.text())
    const { metadata, data } = backupData

    // Validate backup structure
    if (!metadata || !data) {
      const error = 'Invalid backup file structure'
      await logAutomation('Backup & Restore', 'failed', Date.now() - startTime, undefined, error)
      return NextResponse.json({
        success: false,
        error,
        task: 'Backup & Restore',
        status: 'failed'
      }, { status: 500 })
    }

    let restoredUsers = 0
    let restoredClients = 0
    let restoredSocieties = 0
    let restoredPosts = 0
    let restoredSecrets = 0
    const errors = []

    // Restore users
    if (data.users && Array.isArray(data.users)) {
      for (const user of data.users) {
        try {
          await db.user.upsert({
            where: { id: user.id },
            update: {
              email: user.email,
              name: user.name,
              password: user.password_hash || user.password,
              role: user.role || 'CLIENT',
              societyAccountId: user.society_account_id || user.societyAccountId,
              isActive: user.isActive || true,
              lastLoginAt: user.lastLoginAt,
              createdAt: user.created_at || user.createdAt,
              updatedAt: new Date()
            },
            create: {
              id: user.id,
              email: user.email,
              name: user.name,
              password: user.password_hash || user.password,
              role: user.role || 'CLIENT',
              societyAccountId: user.society_account_id || user.societyAccountId,
              isActive: user.isActive || true,
              lastLoginAt: user.lastLoginAt,
              createdAt: user.created_at || user.createdAt
            }
          })
          restoredUsers++
        } catch (error) {
          errors.push(`User ${user.email}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }
    }

    // Restore clients
    if (data.clients && Array.isArray(data.clients)) {
      for (const clientData of data.clients) {
        try {
          await db.client.upsert({
            where: { id: clientData.id },
            update: {
              name: clientData.name,
              email: clientData.email,
              phone: clientData.phone,
              societyName: clientData.society_name || clientData.societyName,
              createdAt: clientData.created_at || clientData.createdAt,
              updatedAt: new Date()
            },
            create: {
              id: clientData.id,
              name: clientData.name,
              email: clientData.email,
              phone: clientData.phone,
              societyName: clientData.society_name || clientData.societyName,
              createdAt: clientData.created_at || clientData.createdAt
            }
          })
          restoredClients++
        } catch (error) {
          errors.push(`Client ${clientData.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }
    }

    // Restore societies
    if (data.societies && Array.isArray(data.societies)) {
      for (const society of data.societies) {
        try {
          await db.society.upsert({
            where: { id: society.id },
            update: {
              name: society.name,
              description: society.description,
              address: society.address,
              phone: society.phone,
              email: society.email,
              societyAccountId: society.society_account_id || society.societyAccountId,
              createdByUserId: society.created_by_user_id || society.createdByUserId,
              isActive: society.isActive || true,
              createdAt: society.created_at || society.createdAt,
              updatedAt: new Date()
            },
            create: {
              id: society.id,
              name: society.name,
              description: society.description,
              address: society.address,
              phone: society.phone,
              email: society.email,
              societyAccountId: society.society_account_id || society.societyAccountId,
              createdByUserId: society.created_by_user_id || society.createdByUserId,
              isActive: society.isActive || true,
              createdAt: society.created_at || society.createdAt
            }
          })
          restoredSocieties++
        } catch (error) {
          errors.push(`Society ${society.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }
    }

    // Restore posts
    if (data.posts && Array.isArray(data.posts)) {
      for (const post of data.posts) {
        try {
          await db.post.upsert({
            where: { id: post.id },
            update: {
              title: post.title,
              content: post.content,
              published: post.published || false,
              authorId: post.authorId || post.author_id,
              createdAt: post.created_at || post.createdAt,
              updatedAt: new Date()
            },
            create: {
              id: post.id,
              title: post.title,
              content: post.content,
              published: post.published || false,
              authorId: post.authorId || post.author_id,
              createdAt: post.created_at || post.createdAt
            }
          })
          restoredPosts++
        } catch (error) {
          errors.push(`Post ${post.title}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }
    }

    // Restore secrets (metadata only for security)
    if (data.secrets && Array.isArray(data.secrets)) {
      for (const secret of data.secrets) {
        try {
          await db.secret.upsert({
            where: { key: secret.key },
            update: {
              description: secret.description,
              lastRotated: secret.lastRotated || secret.last_rotated,
              updatedAt: new Date()
            },
            create: {
              key: secret.key,
              description: secret.description,
              lastRotated: secret.lastRotated || secret.last_rotated,
              createdAt: new Date()
            }
          })
          restoredSecrets++
        } catch (error) {
          errors.push(`Secret ${secret.key}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }
    }

    const duration = Date.now() - startTime
    const totalRestored = restoredUsers + restoredClients + restoredSocieties + restoredPosts + restoredSecrets
    const details = `Restored ${totalRestored} records from backup ${backupId}: ${restoredUsers} users, ${restoredClients} clients, ${restoredSocieties} societies, ${restoredPosts} posts, ${restoredSecrets} secrets. Backup timestamp: ${metadata.backup_timestamp}${errors.length > 0 ? `. Errors: ${errors.join('; ')}` : ''}`

    await logAutomation('Backup & Restore', 'completed', duration, details)

    return NextResponse.json({
      success: true,
      task: 'Backup & Restore',
      status: 'completed',
      duration: `${(duration / 1000).toFixed(1)}s`,
      details,
      backup_id: backupId,
      backup_metadata: metadata,
      restored_records: {
        users: restoredUsers,
        clients: restoredClients,
        societies: restoredSocieties,
        posts: restoredPosts,
        secrets: restoredSecrets,
        total: totalRestored
      },
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    const duration = Date.now() - startTime
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    
    await logAutomation('Backup & Restore', 'failed', duration, undefined, errorMsg)

    return NextResponse.json({
      success: false,
      error: errorMsg,
      task: 'Backup & Restore',
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

    // List available backups for restore
    const { data: files, error } = await client.storage
      .from('automated-backups')
      .list('', {
        limit: 20,
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
      last_modified: file.updated_at || file.created_at,
      type: file.name.includes('manual-backup') ? 'manual' : 
             file.name.includes('auto-backup') ? 'scheduled' : 'unknown'
    })) || []

    return NextResponse.json({
      success: true,
      available_backups: backups,
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