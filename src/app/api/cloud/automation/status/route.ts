import { NextRequest, NextResponse } from 'next/server'

// Mock automation status
let mockAutomationStatus = {
  enabled: false,
  lastSync: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
  lastBackup: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
  errorCount: 1,
  tasks: [
    {
      id: 'schema-sync',
      name: 'Auto Schema Sync',
      status: 'idle' as const,
      lastRun: new Date(Date.now() - 3600000).toISOString(),
      nextRun: new Date(Date.now() + 1800000).toISOString(), // 30 minutes from now
      enabled: true,
      progress: 0
    },
    {
      id: 'logic-deploy',
      name: 'Auto Logic Deploy',
      status: 'completed' as const,
      lastRun: new Date(Date.now() - 7200000).toISOString(),
      nextRun: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
      enabled: true,
      progress: 100
    },
    {
      id: 'github-backup',
      name: 'Auto GitHub Backup',
      status: 'error' as const,
      lastRun: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
      nextRun: new Date(Date.now() + 5400000).toISOString(), // 90 minutes from now
      enabled: false,
      progress: 0
    },
    {
      id: 'health-check',
      name: 'Health Check',
      status: 'idle' as const,
      lastRun: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
      nextRun: new Date(Date.now() + 900000).toISOString(), // 15 minutes from now
      enabled: true,
      progress: 0
    }
  ]
}

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      status: mockAutomationStatus
    })
  } catch (error) {
    console.error('Failed to fetch automation status:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch automation status'
    }, { status: 500 })
  }
}