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
      status: 'idle' as 'idle' | 'running' | 'completed' | 'error',
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
      status: 'idle' as 'idle' | 'running' | 'completed' | 'error',
      lastRun: new Date(Date.now() - 1800000).toISOString(),
      nextRun: new Date(Date.now() + 900000).toISOString(),
      enabled: true,
      progress: 0
    }
  ]
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params
    
    const taskIndex = mockAutomationStatus.tasks.findIndex(t => t.id === taskId)
    if (taskIndex === -1) {
      return NextResponse.json({
        success: false,
        error: 'Task not found'
      }, { status: 404 })
    }

    // Simulate task execution
    const task = mockAutomationStatus.tasks[taskIndex]
    
    // Update task status to running
    mockAutomationStatus.tasks[taskIndex] = {
      ...task,
      status: 'running',
      progress: 0
    }

    // Simulate task completion after 3 seconds
    setTimeout(() => {
      mockAutomationStatus.tasks[taskIndex] = {
        ...task,
        status: Math.random() > 0.2 ? 'completed' : 'error',
        progress: 100,
        lastRun: new Date().toISOString()
      }
    }, 3000)

    return NextResponse.json({
      success: true,
      task: mockAutomationStatus.tasks[taskIndex]
    })
  } catch (error) {
    console.error('Failed to run task:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to run task'
    }, { status: 500 })
  }
}