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

interface HealthCheckResult {
  component: string
  status: 'healthy' | 'unhealthy' | 'warning'
  latency_ms?: number
  details?: string
  error?: string
}

async function testDatabaseConnection(client: any): Promise<HealthCheckResult> {
  const startTime = Date.now()
  
  try {
    // Test with a simple query to check connection
    const { error, data } = await client
      .from('information_schema.tables')
      .select('COUNT(*) as count')
      .eq('table_schema', 'public')
      .single()

    const latency = Date.now() - startTime

    if (error && !error.message.includes('does not exist')) {
      return {
        component: 'Database Connection',
        status: 'unhealthy',
        latency_ms: latency,
        error: error.message
      }
    }

    return {
      component: 'Database Connection',
      status: 'healthy',
      latency_ms: latency,
      details: `Connected successfully. Found ${data?.count || 0} tables.`
    }
  } catch (error) {
    const latency = Date.now() - startTime
    return {
      component: 'Database Connection',
      status: 'unhealthy',
      latency_ms: latency,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function testTableAccess(client: any, tableName: string): Promise<HealthCheckResult> {
  const startTime = Date.now()
  
  try {
    const { error, data } = await client
      .from(tableName)
      .select('COUNT(*) as count')
      .limit(1)

    const latency = Date.now() - startTime

    if (error) {
      return {
        component: `Table: ${tableName}`,
        status: 'warning',
        latency_ms: latency,
        error: error.message,
        details: 'Table may not exist or access restricted'
      }
    }

    return {
      component: `Table: ${tableName}`,
      status: 'healthy',
      latency_ms: latency,
      details: `Accessible. Records: ${data?.[0]?.count || 0}`
    }
  } catch (error) {
    const latency = Date.now() - startTime
    return {
      component: `Table: ${tableName}`,
      status: 'unhealthy',
      latency_ms: latency,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function testStorageAccess(client: any): Promise<HealthCheckResult> {
  const startTime = Date.now()
  
  try {
    const bucketName = 'automated-backups'
    
    // Test bucket access
    const { error: listError } = await client.storage
      .from(bucketName)
      .list('', { limit: 1 })

    const latency = Date.now() - startTime

    if (listError) {
      return {
        component: 'Storage Access',
        status: 'warning',
        latency_ms: latency,
        error: listError.message,
        details: 'Storage bucket may not exist or access restricted'
      }
    }

    return {
      component: 'Storage Access',
      status: 'healthy',
      latency_ms: latency,
      details: 'Storage bucket accessible'
    }
  } catch (error) {
    const latency = Date.now() - startTime
    return {
      component: 'Storage Access',
      status: 'unhealthy',
      latency_ms: latency,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function testSecretsService(): Promise<HealthCheckResult> {
  const startTime = Date.now()
  
  try {
    const secrets = await db.secret.findMany({
      where: {
        key: {
          in: ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY']
        }
      }
    })

    const latency = Date.now() - startTime

    if (secrets.length < 2) {
      return {
        component: 'Secrets Service',
        status: 'warning',
        latency_ms: latency,
        details: `Found ${secrets.length}/2 required secrets`
      }
    }

    return {
      component: 'Secrets Service',
      status: 'healthy',
      latency_ms: latency,
      details: `All required secrets available (${secrets.length} total)`
    }
  } catch (error) {
    const latency = Date.now() - startTime
    return {
      component: 'Secrets Service',
      status: 'unhealthy',
      latency_ms: latency,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export const POST = withAdmin(async (req: AuthenticatedRequest) => {
  const startTime = Date.now()

  try {
    const supabaseService = SupabaseService.getInstance()
    const client = await supabaseService.getClient()

    if (!client) {
      const error = 'Failed to create Supabase client'
      await logAutomation('Health Checks', 'failed', Date.now() - startTime, undefined, error)
      return NextResponse.json({
        success: false,
        error,
        task: 'Health Checks',
        status: 'failed'
      }, { status: 500 })
    }

    // Run all health checks
    const healthChecks: HealthCheckResult[] = []

    // Test secrets service first
    const secretsResult = await testSecretsService()
    healthChecks.push(secretsResult)

    // Test database connection
    const dbResult = await testDatabaseConnection(client)
    healthChecks.push(dbResult)

    // Test access to critical tables
    const criticalTables = ['users', 'automation_logs']
    for (const table of criticalTables) {
      const tableResult = await testTableAccess(client, table)
      healthChecks.push(tableResult)
    }

    // Test storage access
    const storageResult = await testStorageAccess(client)
    healthChecks.push(storageResult)

    // Calculate overall health
    const healthyCount = healthChecks.filter(h => h.status === 'healthy').length
    const unhealthyCount = healthChecks.filter(h => h.status === 'unhealthy').length
    const warningCount = healthChecks.filter(h => h.status === 'warning').length

    let overallStatus: 'healthy' | 'unhealthy' | 'warning'
    if (unhealthyCount > 0) {
      overallStatus = 'unhealthy'
    } else if (warningCount > 0) {
      overallStatus = 'warning'
    } else {
      overallStatus = 'healthy'
    }

    const duration = Date.now() - startTime
    const avgLatency = healthChecks.reduce((sum, h) => sum + (h.latency_ms || 0), 0) / healthChecks.length

    const details = `Overall: ${overallStatus}. Healthy: ${healthyCount}, Warnings: ${warningCount}, Unhealthy: ${unhealthyCount}. Avg latency: ${avgLatency.toFixed(0)}ms`

    await logAutomation('Health Checks', overallStatus === 'healthy' ? 'completed' : 'completed_with_warnings', duration, details)

    return NextResponse.json({
      success: true,
      task: 'Health Checks',
      status: overallStatus === 'healthy' ? 'completed' : 'completed_with_warnings',
      duration: `${(duration / 1000).toFixed(1)}s`,
      details,
      overall_health: overallStatus,
      health_checks: healthChecks,
      summary: {
        total_checks: healthChecks.length,
        healthy: healthyCount,
        warnings: warningCount,
        unhealthy: unhealthyCount,
        average_latency_ms: Math.round(avgLatency)
      }
    })

  } catch (error) {
    const duration = Date.now() - startTime
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    
    await logAutomation('Health Checks', 'failed', duration, undefined, errorMsg)

    return NextResponse.json({
      success: false,
      error: errorMsg,
      task: 'Health Checks',
      status: 'failed',
      duration: `${(duration / 1000).toFixed(1)}s`
    }, { status: 500 })
  }
})

export const GET = withAdmin(async (req: AuthenticatedRequest) => {
  try {
    // Return last health check results from automation logs
    const { data: lastHealthCheck, error } = await db.automationLog.findMany({
      where: {
        task_name: 'Health Checks'
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
      last_health_check: lastHealthCheck?.[0] || null,
      status: lastHealthCheck?.length ? 'available' : 'no_data'
    })

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({
      success: false,
      error: errorMsg
    }, { status: 500 })
  }
})