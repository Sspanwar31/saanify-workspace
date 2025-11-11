import { NextRequest, NextResponse } from 'next/server'

interface EdgeFunction {
  id: string
  name: string
  status: 'active' | 'inactive' | 'deploying'
  url: string
  runtime: string
  region: string
  createdAt: string
  lastInvoked?: string
  invocations: number
  errors: number
  avgLatency: number
  code?: string
}

export async function GET(request: NextRequest) {
  try {
    // Mock data for deployed functions
    const functions: EdgeFunction[] = [
      {
        id: '1',
        name: 'generate-monthly-interest',
        status: 'active',
        url: 'https://your-project.supabase.co/functions/v1/generate-monthly-interest',
        runtime: 'deno',
        region: 'us-east-1',
        createdAt: new Date().toISOString(),
        lastInvoked: new Date().toISOString(),
        invocations: 1247,
        errors: 3,
        avgLatency: 145
      },
      {
        id: '2',
        name: 'process-maintenance-request',
        status: 'active',
        url: 'https://your-project.supabase.co/functions/v1/process-maintenance-request',
        runtime: 'deno',
        region: 'us-east-1',
        createdAt: new Date().toISOString(),
        lastInvoked: new Date().toISOString(),
        invocations: 892,
        errors: 12,
        avgLatency: 234
      },
      {
        id: '3',
        name: 'send-notifications',
        status: 'inactive',
        url: 'https://your-project.supabase.co/functions/v1/send-notifications',
        runtime: 'nodejs',
        region: 'us-west-1',
        createdAt: new Date().toISOString(),
        invocations: 0,
        errors: 0,
        avgLatency: 0
      }
    ]

    return NextResponse.json({
      success: true,
      functions
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch functions'
    }, { status: 500 })
  }
}