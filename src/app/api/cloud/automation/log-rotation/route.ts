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
    const body = await req.json()
    const { 
      retentionDays = 30, 
      maxRecords = 10000,
      archiveOldLogs = true 
    } = body

    const supabaseService = SupabaseService.getInstance()
    const client = await supabaseService.getClient()

    if (!client) {
      const error = 'Failed to create Supabase client'
      await logAutomation('Log Rotation', 'failed', Date.now() - startTime, undefined, error)
      return NextResponse.json({
        success: false,
        error,
        task: 'Log Rotation',
        status: 'failed'
      }, { status: 500 })
    }

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

    let archivedCount = 0
    let deletedCount = 0
    const rotationResults = []

    // Archive old logs if requested
    if (archiveOldLogs) {
      try {
        const { data: oldLogs, error: fetchError } = await client
          .from('automation_logs')
          .select('*')
          .lt('run_time', cutoffDate.toISOString())
          .order('run_time', { ascending: false })

        if (fetchError) {
          console.error('Error fetching old logs for archival:', fetchError)
        } else if (oldLogs && oldLogs.length > 0) {
          // Create archive data
          const archiveData = {
            metadata: {
              archived_at: new Date().toISOString(),
              cutoff_date: cutoffDate.toISOString(),
              total_records: oldLogs.length,
              retention_days: retentionDays
            },
            logs: oldLogs
          }

          // Upload to storage
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
          const archiveFileName = `automation-logs-archive-${timestamp}.json`
          
          const { error: uploadError } = await client.storage
            .from('automated-backups')
            .upload(archiveFileName, JSON.stringify(archiveData, null, 2), {
              contentType: 'application/json',
              upsert: true
            })

          if (!uploadError) {
            archivedCount = oldLogs.length
            rotationResults.push(`Archived ${oldLogs.length} old logs to ${archiveFileName}`)
          } else {
            rotationResults.push(`Failed to archive logs: ${uploadError.message}`)
          }
        }
      } catch (error) {
        rotationResults.push(`Archive error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    // Delete old logs from database
    try {
      const { data: deletedLogs, error: deleteError } = await client
        .from('automation_logs')
        .delete()
        .lt('run_time', cutoffDate.toISOString())
        .select('id')

      if (deleteError) {
        rotationResults.push(`Delete error: ${deleteError.message}`)
      } else {
        deletedCount = deletedLogs?.length || 0
        if (deletedCount > 0) {
          rotationResults.push(`Deleted ${deletedCount} old log records from database`)
        } else {
          rotationResults.push('No old logs found to delete')
        }
      }
    } catch (error) {
      rotationResults.push(`Delete operation error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    // Check if we need to limit total records
    if (maxRecords > 0) {
      try {
        // Get total count
        const { data: countData, error: countError } = await client
          .from('automation_logs')
          .select('id', { count: 'exact', head: true })

        if (!countError && countData !== null) {
          const totalCount = Array.isArray(countData) ? countData.length : (countData as any)?.length || 0
          
          if (totalCount > maxRecords) {
            const excessCount = totalCount - maxRecords
            
            // Delete oldest records beyond the limit
            const { data: excessLogs, error: limitError } = await client
              .from('automation_logs')
              .select('id')
              .order('run_time', { ascending: true })
              .limit(excessCount)

            if (!limitError && excessLogs) {
              const idsToDelete = excessLogs.map(log => log.id)
              
              const { error: bulkDeleteError } = await client
                .from('automation_logs')
                .delete()
                .in('id', idsToDelete)

              if (!bulkDeleteError) {
                rotationResults.push(`Deleted ${excessCount} excess records to maintain ${maxRecords} limit`)
                deletedCount += excessCount
              } else {
                rotationResults.push(`Failed to delete excess records: ${bulkDeleteError.message}`)
              }
            }
          }
        }
      } catch (error) {
        rotationResults.push(`Record limiting error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    // Get final statistics
    try {
      const { data: finalStats, error: statsError } = await client
        .from('automation_logs')
        .select('id', { count: 'exact', head: true })

      if (!statsError) {
        const finalCount = Array.isArray(finalStats) ? finalStats.length : (finalStats as any)?.length || 0
        rotationResults.push(`Final log count: ${finalCount} records`)
      }
    } catch (error) {
      console.error('Error getting final stats:', error)
    }

    const duration = Date.now() - startTime
    const details = rotationResults.join('. ')
    
    await logAutomation('Log Rotation', 'completed', duration, details)

    return NextResponse.json({
      success: true,
      task: 'Log Rotation',
      status: 'completed',
      duration: `${(duration / 1000).toFixed(1)}s`,
      details,
      archived_count: archivedCount,
      deleted_count: deletedCount,
      retention_days: retentionDays,
      max_records: maxRecords,
      rotation_results: rotationResults
    })

  } catch (error) {
    const duration = Date.now() - startTime
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    
    await logAutomation('Log Rotation', 'failed', duration, undefined, errorMsg)

    return NextResponse.json({
      success: false,
      error: errorMsg,
      task: 'Log Rotation',
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

    // Get log statistics
    const { data: logStats, error: statsError } = await client
      .from('automation_logs')
      .select('task_name, status, run_time')
      .order('run_time', { ascending: false })

    if (statsError) {
      return NextResponse.json({
        success: false,
        error: statsError.message
      }, { status: 500 })
    }

    // Analyze log data
    const totalLogs = logStats?.length || 0
    const oldestLog = logStats?.[logStats.length - 1]?.run_time
    const newestLog = logStats?.[0]?.run_time

    // Group by task name
    const taskCounts = logStats?.reduce((acc: any, log) => {
      acc[log.task_name] = (acc[log.task_name] || 0) + 1
      return acc
    }, {}) || {}

    // Group by status
    const statusCounts = logStats?.reduce((acc: any, log) => {
      acc[log.status] = (acc[log.status] || 0) + 1
      return acc
    }, {}) || {}

    // Calculate average logs per day
    let avgLogsPerDay = 0
    if (oldestLog && totalLogs > 0) {
      const daysDiff = Math.max(1, Math.ceil((new Date().getTime() - new Date(oldestLog).getTime()) / (1000 * 60 * 60 * 24)))
      avgLogsPerDay = Math.round(totalLogs / daysDiff)
    }

    return NextResponse.json({
      success: true,
      statistics: {
        total_logs: totalLogs,
        oldest_log: oldestLog,
        newest_log: newestLog,
        average_logs_per_day: avgLogsPerDay,
        task_distribution: taskCounts,
        status_distribution: statusCounts
      },
      recommendations: {
        retention_days: totalLogs > 50000 ? 30 : totalLogs > 10000 ? 60 : 90,
        needs_rotation: totalLogs > 10000,
        archive_suggested: totalLogs > 5000
      }
    })

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({
      success: false,
      error: errorMsg
    }, { status: 500 })
  }
})