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
      await logAutomation('Auto-Sync', 'failed', Date.now() - startTime, undefined, error)
      return NextResponse.json({
        success: false,
        error,
        task: 'Auto-Sync',
        status: 'failed'
      }, { status: 500 })
    }

    // Get local data to sync
    const localUsers = await db.user.findMany()
    const localClients = await db.client.findMany()
    const localSocieties = await db.society.findMany()

    let syncedUsers = 0
    let syncedClients = 0
    let syncedSocieties = 0
    const errors = []

    // Sync users to Supabase
    for (const user of localUsers) {
      try {
        const { error } = await client
          .from('users')
          .upsert({
            id: user.id,
            email: user.email,
            name: user.name,
            password_hash: user.password,
            role: user.role,
            society_account_id: user.societyAccountId,
            created_at: user.createdAt,
            updated_at: user.updatedAt
          })

        if (error) {
          errors.push(`User ${user.email}: ${error.message}`)
        } else {
          syncedUsers++
        }
      } catch (error) {
        errors.push(`User ${user.email}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    // Sync clients to Supabase
    for (const clientData of localClients) {
      try {
        const { error } = await client
          .from('clients')
          .upsert({
            id: clientData.id,
            name: clientData.name,
            email: clientData.email,
            phone: clientData.phone,
            society_name: clientData.societyName,
            created_at: clientData.createdAt,
            updated_at: clientData.updatedAt
          })

        if (error) {
          errors.push(`Client ${clientData.name}: ${error.message}`)
        } else {
          syncedClients++
        }
      } catch (error) {
        errors.push(`Client ${clientData.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    // Sync societies to Supabase
    for (const society of localSocieties) {
      try {
        const { error } = await client
          .from('societies')
          .upsert({
            id: society.id,
            name: society.name,
            description: society.description,
            address: society.address,
            phone: society.phone,
            email: society.email,
            society_account_id: society.societyAccountId,
            created_by_user_id: society.createdByUserId,
            created_at: society.createdAt,
            updated_at: society.updatedAt
          })

        if (error) {
          errors.push(`Society ${society.name}: ${error.message}`)
        } else {
          syncedSocieties++
        }
      } catch (error) {
        errors.push(`Society ${society.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    const duration = Date.now() - startTime
    const totalRecords = syncedUsers + syncedClients + syncedSocieties
    const details = `Synced ${syncedUsers} users, ${syncedClients} clients, ${syncedSocieties} societies${errors.length > 0 ? `. Errors: ${errors.join('; ')}` : ''}`

    await logAutomation('Auto-Sync', 'completed', duration, details)

    return NextResponse.json({
      success: true,
      task: 'Auto-Sync',
      status: 'completed',
      duration: `${(duration / 1000).toFixed(1)}s`,
      details,
      synced_records: {
        users: syncedUsers,
        clients: syncedClients,
        societies: syncedSocieties,
        total: totalRecords
      },
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    const duration = Date.now() - startTime
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    
    await logAutomation('Auto-Sync', 'failed', duration, undefined, errorMsg)

    return NextResponse.json({
      success: false,
      error: errorMsg,
      task: 'Auto-Sync',
      status: 'failed',
      duration: `${(duration / 1000).toFixed(1)}s`
    }, { status: 500 })
  }
})

export const GET = withAdmin(async (req: AuthenticatedRequest) => {
  try {
    // Get last sync status
    const { data: lastSync, error } = await db.automationLog.findMany({
      where: {
        task_name: 'Auto-Sync'
      },
      orderBy: {
        run_time: 'desc'
      },
      take: 1,
      select: {
        status: true,
        duration_ms: true,
        details: true,
        run_time: true
      }
    })

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      last_sync: lastSync?.[0] || null,
      status: lastSync?.length ? 'available' : 'no_data'
    })

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({
      success: false,
      error: errorMsg
    }, { status: 500 })
  }
})