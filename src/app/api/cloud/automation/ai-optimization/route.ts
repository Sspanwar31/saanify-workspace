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

interface OptimizationInsight {
  category: string
  issue: string
  impact: 'low' | 'medium' | 'high'
  recommendation: string
  estimated_savings?: string
}

function analyzePerformanceData(logs: any[]): OptimizationInsight[] {
  const insights: OptimizationInsight[] = []

  if (!logs || logs.length === 0) {
    return insights
  }

  // Group logs by task name
  const taskGroups = logs.reduce((groups: any, log) => {
    if (!groups[log.task_name]) {
      groups[log.task_name] = []
    }
    groups[log.task_name].push(log)
    return groups
  }, {})

  // Analyze each task
  Object.entries(taskGroups).forEach(([taskName, taskLogs]: [string, any[]]) => {
    const durations = taskLogs.map(log => log.duration_ms).filter(d => d > 0)
    const failureRate = taskLogs.filter(log => log.status === 'failed').length / taskLogs.length
    const avgDuration = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0

    // Check for high failure rates
    if (failureRate > 0.1) {
      insights.push({
        category: 'Reliability',
        issue: `High failure rate for ${taskName}: ${(failureRate * 100).toFixed(1)}%`,
        impact: failureRate > 0.3 ? 'high' : 'medium',
        recommendation: 'Review error logs and implement retry mechanisms or improve error handling',
        estimated_savings: `Could improve success rate by ${((failureRate - 0.05) * 100).toFixed(1)}%`
      })
    }

    // Check for slow operations
    if (avgDuration > 30000) { // 30 seconds
      insights.push({
        category: 'Performance',
        issue: `Slow execution time for ${taskName}: ${(avgDuration / 1000).toFixed(1)}s average`,
        impact: avgDuration > 60000 ? 'high' : 'medium',
        recommendation: 'Optimize queries, add caching, or break down into smaller tasks',
        estimated_savings: `Could reduce execution time by ${((avgDuration - 15000) / 1000).toFixed(1)}s`
      })
    }

    // Check for inconsistent performance
    if (durations.length > 5) {
      const variance = calculateVariance(durations)
      const cv = Math.sqrt(variance) / avgDuration // Coefficient of variation
      
      if (cv > 0.5) {
        insights.push({
          category: 'Consistency',
          issue: `Inconsistent performance for ${taskName}: high variance in execution times`,
          impact: 'medium',
          recommendation: 'Investigate performance bottlenecks and standardize execution paths',
          estimated_savings: 'Could improve predictability and resource planning'
        })
      }
    }
  })

  // Analyze overall patterns
  const recentLogs = logs.filter(log => {
    const logDate = new Date(log.run_time)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    return logDate > weekAgo
  })

  // Check frequency optimization
  const tasksPerDay = recentLogs.length / 7
  if (tasksPerDay > 100) {
    insights.push({
      category: 'Frequency',
      issue: `High automation frequency: ${tasksPerDay.toFixed(1)} tasks per day`,
      impact: 'medium',
      recommendation: 'Consider consolidating tasks or adjusting schedules to reduce overhead',
      estimated_savings: 'Could reduce system load and improve efficiency'
    })
  }

  return insights
}

function calculateVariance(values: number[]): number {
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const squaredDiffs = values.map(value => Math.pow(value - mean, 2))
  return squaredDiffs.reduce((a, b) => a + b, 0) / values.length
}

function generateOptimizationReport(insights: OptimizationInsight[]): any {
  const highImpact = insights.filter(i => i.impact === 'high')
  const mediumImpact = insights.filter(i => i.impact === 'medium')
  const lowImpact = insights.filter(i => i.impact === 'low')

  const categories = [...new Set(insights.map(i => i.category))]
  
  return {
    summary: {
      total_insights: insights.length,
      high_priority: highImpact.length,
      medium_priority: mediumImpact.length,
      low_priority: lowImpact.length,
      categories_analyzed: categories.length
    },
    priority_breakdown: {
      high: highImpact,
      medium: mediumImpact,
      low: lowImpact
    },
    recommendations: insights
      .sort((a, b) => {
        const impactOrder = { high: 3, medium: 2, low: 1 }
        return impactOrder[b.impact] - impactOrder[a.impact]
      })
      .slice(0, 10), // Top 10 recommendations
    next_steps: [
      'Address high-priority issues first for maximum impact',
      'Implement monitoring for identified performance bottlenecks',
      'Schedule regular optimization reviews',
      'Consider automation scheduling adjustments'
    ]
  }
}

export const POST = withAdmin(async (req: AuthenticatedRequest) => {
  const startTime = Date.now()

  try {
    const supabaseService = SupabaseService.getInstance()
    const client = await supabaseService.getClient()

    if (!client) {
      const error = 'Failed to create Supabase client'
      await logAutomation('AI Optimization', 'failed', Date.now() - startTime, undefined, error)
      return NextResponse.json({
        success: false,
        error,
        task: 'AI Optimization',
        status: 'failed'
      }, { status: 500 })
    }

    // Fetch automation logs for analysis
    const { data: logs, error: fetchError } = await client
      .from('automation_logs')
      .select('*')
      .order('run_time', { ascending: false })
      .limit(1000) // Analyze last 1000 logs

    if (fetchError) {
      const error = `Failed to fetch automation logs: ${fetchError.message}`
      await logAutomation('AI Optimization', 'failed', Date.now() - startTime, undefined, error)
      return NextResponse.json({
        success: false,
        error,
        task: 'AI Optimization',
        status: 'failed'
      }, { status: 500 })
    }

    // Perform AI-powered analysis
    const insights = analyzePerformanceData(logs || [])
    const optimizationReport = generateOptimizationReport(insights)

    // Store optimization results
    const optimizationData = {
      analyzed_at: new Date().toISOString(),
      logs_analyzed: logs?.length || 0,
      insights_generated: insights.length,
      report: optimizationReport
    }

    // Save optimization report to storage
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const reportFileName = `ai-optimization-report-${timestamp}.json`
      
      await client.storage
        .from('automated-backups')
        .upload(reportFileName, JSON.stringify(optimizationData, null, 2), {
          contentType: 'application/json',
          upsert: true
        })
    } catch (storageError) {
      console.warn('Failed to save optimization report to storage:', storageError)
    }

    const duration = Date.now() - startTime
    const details = `Analyzed ${logs?.length || 0} automation logs, generated ${insights.length} insights. ${optimizationReport.summary.high_priority} high-priority issues found.`

    await logAutomation('AI Optimization', 'completed', duration, details)

    return NextResponse.json({
      success: true,
      task: 'AI Optimization',
      status: 'completed',
      duration: `${(duration / 1000).toFixed(1)}s`,
      details,
      optimization_report: optimizationReport,
      insights_generated: insights.length,
      logs_analyzed: logs?.length || 0
    })

  } catch (error) {
    const duration = Date.now() - startTime
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    
    await logAutomation('AI Optimization', 'failed', duration, undefined, errorMsg)

    return NextResponse.json({
      success: false,
      error: errorMsg,
      task: 'AI Optimization',
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

    // Get recent optimization reports from storage
    const { data: reportFiles, error: storageError } = await client.storage
      .from('automated-backups')
      .list('', {
        search: 'ai-optimization-report',
        limit: 5,
        sortBy: { column: 'created_at', order: 'desc' }
      })

    if (storageError) {
      console.warn('Could not fetch optimization reports:', storageError.message)
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
          console.warn(`Failed to parse report ${file.name}:`, parseError)
        }
      }
    }

    // Get current automation statistics
    const { data: recentLogs, error: logsError } = await client
      .from('automation_logs')
      .select('task_name, status, duration_ms, run_time')
      .order('run_time', { ascending: false })
      .limit(100)

    let currentStats = null
    if (!logsError && recentLogs) {
      const taskCounts = recentLogs.reduce((acc: any, log) => {
        acc[log.task_name] = (acc[log.task_name] || 0) + 1
        return acc
      }, {})

      const avgDurations = recentLogs.reduce((acc: any, log) => {
        if (!acc[log.task_name]) {
          acc[log.task_name] = { total: 0, count: 0 }
        }
        acc[log.task_name].total += log.duration_ms || 0
        acc[log.task_name].count += 1
        return acc
      }, {})

      Object.keys(avgDurations).forEach(task => {
        avgDurations[task] = avgDurations[task].total / avgDurations[task].count
      })

      currentStats = {
        recent_activity: taskCounts,
        average_durations: avgDurations,
        total_recent_tasks: recentLogs.length
      }
    }

    return NextResponse.json({
      success: true,
      recent_reports: recentReports,
      current_statistics: currentStats,
      last_analysis: recentReports[0]?.created_at || null,
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