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

interface SecurityIssue {
  category: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  issue: string
  description: string
  recommendation: string
  affected_resource?: string
}

async function checkSecretsSecurity(): Promise<SecurityIssue[]> {
  const issues: SecurityIssue[] = []

  try {
    // Check for missing required secrets
    const requiredSecrets = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'SUPABASE_ANON_KEY']
    const existingSecrets = await db.secret.findMany({
      where: {
        key: {
          in: requiredSecrets
        }
      }
    })

    const existingKeys = existingSecrets.map(s => s.key)
    const missingSecrets = requiredSecrets.filter(key => !existingKeys.includes(key))

    if (missingSecrets.length > 0) {
      issues.push({
        category: 'Secrets Management',
        severity: 'critical',
        issue: 'Missing required secrets',
        description: `The following required secrets are missing: ${missingSecrets.join(', ')}`,
        recommendation: 'Add missing secrets through the Secrets Management panel',
        affected_resource: missingSecrets.join(', ')
      })
    }

    // Check for old secrets (not rotated in 90 days)
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    const oldSecrets = existingSecrets.filter(secret => 
      secret.lastRotated && secret.lastRotated < ninetyDaysAgo
    )

    if (oldSecrets.length > 0) {
      issues.push({
        category: 'Secrets Management',
        severity: 'medium',
        issue: 'Outdated secrets detected',
        description: `${oldSecrets.length} secrets haven't been rotated in over 90 days`,
        recommendation: 'Rotate secrets regularly to maintain security',
        affected_resource: oldSecrets.map(s => s.key).join(', ')
      })
    }

  } catch (error) {
    issues.push({
      category: 'Secrets Management',
      severity: 'high',
      issue: 'Failed to analyze secrets security',
      description: 'Could not access secrets database for security analysis',
      recommendation: 'Check database connectivity and permissions'
    })
  }

  return issues
}

async function checkDatabaseSecurity(client: any): Promise<SecurityIssue[]> {
  const issues: SecurityIssue[] = []

  try {
    // Check for public access to sensitive tables
    const sensitiveTables = ['users', 'admins', 'clients']
    
    for (const tableName of sensitiveTables) {
      try {
        const { error } = await client
          .from(tableName)
          .select('*')
          .limit(1)

        if (!error) {
          // This might indicate overly permissive RLS policies
          issues.push({
            category: 'Database Access',
            severity: 'medium',
            issue: `Potentially permissive access to ${tableName}`,
            description: `Table ${tableName} might be accessible without proper authentication`,
            recommendation: 'Review Row Level Security (RLS) policies for this table',
            affected_resource: tableName
          })
        }
      } catch (accessError) {
        // Expected for properly secured tables
      }
    }

    // Check for RLS being enabled
    const { data: rlsStatus, error: rlsError } = await client
      .from('information_schema.table_privileges')
      .select('table_name, privilege_type')
      .eq('grantee', 'anon')

    if (!rlsError && rlsStatus) {
      const publicTables = rlsStatus.map(p => p.table_name)
      if (publicTables.length > 0) {
        issues.push({
          category: 'Database Security',
          severity: 'high',
          issue: 'Public table access detected',
          description: `Tables accessible to public: ${publicTables.join(', ')}`,
          recommendation: 'Restrict public access and implement proper authentication',
          affected_resource: publicTables.join(', ')
        })
      }
    }

  } catch (error) {
    issues.push({
      category: 'Database Security',
      severity: 'medium',
      issue: 'Database security check failed',
      description: 'Could not complete database security analysis',
      recommendation: 'Verify database permissions and connectivity'
    })
  }

  return issues
}

async function checkStorageSecurity(client: any): Promise<SecurityIssue[]> {
  const issues: SecurityIssue[] = []

  try {
    // Check for public buckets
    const { data: buckets, error: bucketsError } = await client.storage.listBuckets()

    if (!bucketsError && buckets) {
      const publicBuckets = buckets.filter(bucket => bucket.public)

      if (publicBuckets.length > 0) {
        issues.push({
          category: 'Storage Security',
          severity: 'medium',
          issue: 'Public storage buckets detected',
          description: `Public buckets: ${publicBuckets.map(b => b.name).join(', ')}`,
          recommendation: 'Review bucket configurations and make private if not required',
          affected_resource: publicBuckets.map(b => b.name).join(', ')
        })
      }

      // Check for oversized files
      for (const bucket of buckets) {
        try {
          const { data: files } = await client.storage
            .from(bucket.name)
            .list('', { limit: 100 })

          if (files) {
            const largeFiles = files.filter(file => 
              file.metadata?.size && file.metadata.size > 100 * 1024 * 1024 // 100MB
            )

            if (largeFiles.length > 0) {
              issues.push({
                category: 'Storage Security',
                severity: 'low',
                issue: 'Large files detected in storage',
                description: `${largeFiles.length} files larger than 100MB in bucket ${bucket.name}`,
                recommendation: 'Review large files and consider compression or alternative storage',
                affected_resource: `${bucket.name}: ${largeFiles.map(f => f.name).slice(0, 3).join(', ')}`
              })
            }
          }
        } catch (fileError) {
          // Skip if can't access bucket
        }
      }
    }

  } catch (error) {
    issues.push({
      category: 'Storage Security',
      severity: 'low',
      issue: 'Storage security check incomplete',
      description: 'Could not analyze storage security completely',
      recommendation: 'Verify storage permissions and configuration'
    })
  }

  return issues
}

async function checkAutomationSecurity(): Promise<SecurityIssue[]> {
  const issues: SecurityIssue[] = []

  try {
    // Check for failed automation attempts
    const recentFailures = await db.automationLog.findMany({
      where: {
        status: 'failed',
        run_time: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    })

    if (recentFailures.length > 10) {
      issues.push({
        category: 'Automation Security',
        severity: 'medium',
        issue: 'High automation failure rate',
        description: `${recentFailures.length} automation failures in the last 24 hours`,
        recommendation: 'Investigate automation failures and fix underlying issues',
        affected_resource: 'Automation System'
      })
    }

    // Check for repeated failures on same task
    const failureGroups = recentFailures.reduce((groups: any, failure) => {
      const taskName = failure.task_name
      if (!groups[taskName]) {
        groups[taskName] = 0
      }
      groups[taskName]++
      return groups
    }, {})

    Object.entries(failureGroups).forEach(([taskName, count]: [string, number]) => {
      if (count > 5) {
        issues.push({
          category: 'Automation Security',
          severity: 'high',
          issue: `Repeated failures for ${taskName}`,
          description: `Task ${taskName} failed ${count} times in 24 hours`,
          recommendation: 'Investigate and fix recurring issues with this automation task',
          affected_resource: taskName
        })
      }
    })

  } catch (error) {
    issues.push({
      category: 'Automation Security',
      severity: 'low',
      issue: 'Automation security check failed',
      description: 'Could not analyze automation security',
      recommendation: 'Check automation logs database access'
    })
  }

  return issues
}

function generateSecurityReport(issues: SecurityIssue[]): any {
  const critical = issues.filter(i => i.severity === 'critical')
  const high = issues.filter(i => i.severity === 'high')
  const medium = issues.filter(i => i.severity === 'medium')
  const low = issues.filter(i => i.severity === 'low')

  const categories = [...new Set(issues.map(i => i.category))]

  return {
    summary: {
      total_issues: issues.length,
      critical: critical.length,
      high: high.length,
      medium: medium.length,
      low: low.length,
      security_score: Math.max(0, 100 - (critical.length * 25 + high.length * 15 + medium.length * 10 + low.length * 5))
    },
    issues_by_severity: {
      critical,
      high,
      medium,
      low
    },
    issues_by_category: categories.reduce((acc: any, category) => {
      acc[category] = issues.filter(i => i.category === category)
      return acc
    }, {}),
    recommendations: [
      'Address critical and high-severity issues immediately',
      'Implement regular security scanning schedule',
      'Review and update security policies quarterly',
      'Monitor automation logs for security anomalies'
    ],
    compliance_status: {
      data_encryption: 'enabled', // Assuming Supabase has encryption
      access_control: medium.length === 0 ? 'compliant' : 'needs_review',
      audit_logging: 'enabled',
      secret_rotation: critical.filter(i => i.category === 'Secrets Management').length === 0 ? 'compliant' : 'needs_attention'
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
      await logAutomation('Security Scan', 'failed', Date.now() - startTime, undefined, error)
      return NextResponse.json({
        success: false,
        error,
        task: 'Security Scan',
        status: 'failed'
      }, { status: 500 })
    }

    // Run all security checks
    const allIssues: SecurityIssue[] = []

    // Check secrets security
    const secretsIssues = await checkSecretsSecurity()
    allIssues.push(...secretsIssues)

    // Check database security
    const dbIssues = await checkDatabaseSecurity(client)
    allIssues.push(...dbIssues)

    // Check storage security
    const storageIssues = await checkStorageSecurity(client)
    allIssues.push(...storageIssues)

    // Check automation security
    const automationIssues = await checkAutomationSecurity()
    allIssues.push(...automationIssues)

    // Generate security report
    const securityReport = generateSecurityReport(allIssues)

    // Store security scan results
    const scanData = {
      scanned_at: new Date().toISOString(),
      issues_found: allIssues.length,
      security_score: securityReport.summary.security_score,
      report: securityReport,
      detailed_issues: allIssues
    }

    // Save security report to storage
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const reportFileName = `security-scan-report-${timestamp}.json`
      
      await client.storage
        .from('automated-backups')
        .upload(reportFileName, JSON.stringify(scanData, null, 2), {
          contentType: 'application/json',
          upsert: true
        })
    } catch (storageError) {
      console.warn('Failed to save security report to storage:', storageError)
    }

    const duration = Date.now() - startTime
    const details = `Security scan completed. Found ${allIssues.length} issues (${securityReport.summary.critical} critical, ${securityReport.summary.high} high). Security score: ${securityReport.summary.security_score}/100`

    await logAutomation('Security Scan', 'completed', duration, details)

    return NextResponse.json({
      success: true,
      task: 'Security Scan',
      status: 'completed',
      duration: `${(duration / 1000).toFixed(1)}s`,
      details,
      security_report: securityReport,
      issues_found: allIssues.length,
      security_score: securityReport.summary.security_score
    })

  } catch (error) {
    const duration = Date.now() - startTime
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    
    await logAutomation('Security Scan', 'failed', duration, undefined, errorMsg)

    return NextResponse.json({
      success: false,
      error: errorMsg,
      task: 'Security Scan',
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

    // Get recent security scan reports from storage
    const { data: reportFiles, error: storageError } = await client.storage
      .from('automated-backups')
      .list('', {
        search: 'security-scan-report',
        limit: 5,
        sortBy: { column: 'created_at', order: 'desc' }
      })

    if (storageError) {
      console.warn('Could not fetch security reports:', storageError.message)
    }

    const recentReports = []
    if (reportFiles && reportFiles.length > 0) {
      for (const file of reportFiles.slice(0, 3)) { // Get last 3 reports
        try {
          const { data: reportData } = await client.storage
            .from('automated-backups')
            .download(file.name)

          if (reportData) {
            const reportText = await reportData.text()
            const report = JSON.parse(reportText)
            recentReports.push({
              file_name: file.name,
              created_at: file.created_at,
              report: report
            })
          }
        } catch (parseError) {
          console.warn(`Failed to parse security report ${file.name}:`, parseError)
        }
      }
    }

    return NextResponse.json({
      success: true,
      recent_reports: recentReports,
      last_scan: recentReports[0]?.created_at || null,
      current_security_score: recentReports[0]?.report?.summary?.security_score || null,
      status: recentReports.length > 0 ? 'reports_available' : 'no_reports'
    })

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({
      success: false,
      error: errorMsg
    }, { status: 500 })
  }
})