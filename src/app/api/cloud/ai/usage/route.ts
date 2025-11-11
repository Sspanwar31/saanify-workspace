import { NextRequest, NextResponse } from 'next/server'

interface AIUsage {
  id: string
  date: string
  model: string
  calls: number
  tokens: number
  cost: number
  avgResponseTime: number
  successRate: number
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('range') || '7d'
    const selectedModel = searchParams.get('model') || 'all'

    // Mock data based on time range
    let days = 7
    if (timeRange === '24h') days = 1
    if (timeRange === '7d') days = 7
    if (timeRange === '30d') days = 30
    if (timeRange === '90d') days = 90

    const generateMockUsage = (model: string, baseCalls: number): AIUsage[] => {
      const usage: AIUsage[] = []
      for (let i = 0; i < days; i++) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString()
        const calls = Math.floor(baseCalls * (1 - (i * 0.1)))
        const tokens = calls * 200
        const cost = tokens * 0.00001
        const responseTime = 1000 + Math.random() * 500
        const successRate = 95 + Math.random() * 5

        usage.push({
          id: `usage_${i}`,
          date,
          model,
          calls,
          tokens,
          cost,
          avgResponseTime: responseTime,
          successRate
        })
      }
      return usage
    }

    let usage: AIUsage[] = []

    if (selectedModel === 'all' || selectedModel === 'gpt-4') {
      usage.push(...generateMockUsage('gpt-4', 200))
    }
    if (selectedModel === 'all' || selectedModel === 'gpt-3.5-turbo') {
      usage.push(...generateMockUsage('gpt-3.5-turbo', 150))
    }
    if (selectedModel === 'all' || selectedModel === 'claude-3-sonnet') {
      usage.push(...generateMockUsage('claude-3-sonnet', 100))
    }

    return NextResponse.json({
      success: true,
      usage: usage.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch AI usage'
    }, { status: 500 })
  }
}