import { NextRequest, NextResponse } from 'next/server'
import { withAdmin, AuthenticatedRequest } from '@/lib/auth-middleware'

// Task endpoint mapping
const TASK_ENDPOINTS: { [key: string]: string } = {
  'schema-sync': '/api/cloud/automation/schema-sync',
  'auto-sync': '/api/cloud/automation/auto-sync',
  'backup-now': '/api/cloud/automation/backup-now',
  'auto-backup': '/api/cloud/automation/auto-backup',
  'health-check': '/api/cloud/automation/health-check',
  'log-rotation': '/api/cloud/automation/log-rotation',
  'ai-optimization': '/api/cloud/automation/ai-optimization',
  'security-scan': '/api/cloud/automation/security-scan',
  'backup-restore': '/api/cloud/automation/backup-restore'
}

export const POST = withAdmin(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json()
    const { taskId } = body

    if (!taskId) {
      return NextResponse.json({
        success: false,
        error: 'Task ID is required'
      }, { status: 400 })
    }

    const taskEndpoint = TASK_ENDPOINTS[taskId]
    if (!taskEndpoint) {
      return NextResponse.json({
        success: false,
        error: 'Unknown task ID'
      }, { status: 404 })
    }

    // Execute the specific automation task
    const baseUrl = req.nextUrl.origin
    const authToken = req.cookies.get('auth-token')?.value || req.headers.get('authorization')?.replace('Bearer ', '')

    try {
      const response = await fetch(`${baseUrl}${taskEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        }
      })

      const result = await response.json()

      if (response.ok && result.success) {
        return NextResponse.json({
          success: true,
          message: result.message || 'Task completed successfully',
          task: {
            id: taskId,
            status: result.status || 'completed',
            result: result,
            duration: result.duration,
            details: result.details
          }
        })
      } else {
        return NextResponse.json({
          success: false,
          error: result.error || 'Task execution failed'
        }, { status: response.status || 500 })
      }
    } catch (executionError) {
      return NextResponse.json({
        success: false,
        error: `Failed to execute task: ${executionError instanceof Error ? executionError.message : 'Unknown error'}`
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Failed to run automation:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to start automation'
    }, { status: 500 })
  }
})