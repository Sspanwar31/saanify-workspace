import { NextRequest, NextResponse } from 'next/server'
import AutomationService from '@/lib/automation-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { enabled } = body

    const automationService = AutomationService.getInstance()
    const result = await automationService.toggleAutomation(enabled)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to toggle automation:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to toggle automation'
    }, { status: 500 })
  }
}