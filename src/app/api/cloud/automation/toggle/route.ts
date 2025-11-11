import { NextRequest, NextResponse } from 'next/server'

// Mock automation status
let mockAutomationStatus = {
  enabled: false,
  lastSync: new Date(Date.now() - 3600000).toISOString(),
  lastBackup: new Date(Date.now() - 7200000).toISOString(),
  errorCount: 1,
  tasks: [
    {
      id: 'schema-sync',
      name: 'Auto Schema Sync',
      status: 'idle' as const,
      lastRun: new Date(Date.now() - 3600000).toISOString(),
      nextRun: new Date(Date.now() + 1800000).toISOString(),
      enabled: true,
      progress: 0
    },
    {
      id: 'logic-deploy',
      name: 'Auto Logic Deploy',
      status: 'completed' as const,
      lastRun: new Date(Date.now() - 7200000).toISOString(),
      nextRun: new Date(Date.now() + 3600000).toISOString(),
      enabled: true,
      progress: 100
    },
    {
      id: 'github-backup',
      name: 'Auto GitHub Backup',
      status: 'error' as const,
      lastRun: new Date(Date.now() - 10800000).toISOString(),
      nextRun: new Date(Date.now() + 5400000).toISOString(),
      enabled: false,
      progress: 0
    },
    {
      id: 'health-check',
      name: 'Health Check',
      status: 'idle' as const,
      lastRun: new Date(Date.now() - 1800000).toISOString(),
      nextRun: new Date(Date.now() + 900000).toISOString(),
      enabled: true,
      progress: 0
    }
  ]
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { enabled } = body

    mockAutomationStatus.enabled = enabled

    return NextResponse.json({
      success: true,
      message: `Automation ${enabled ? 'enabled' : 'disabled'} successfully`
    })
  } catch (error) {
    console.error('Failed to toggle automation:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to toggle automation'
    }, { status: 500 })
  }
}