import { NextRequest, NextResponse } from 'next/server'

interface AIModel {
  name: string
  provider: string
  type: 'text' | 'image' | 'embedding'
  calls: number
  tokens: number
  cost: number
  avgLatency: number
  lastUsed: string
}

export async function GET(request: NextRequest) {
  try {
    // Mock data for AI models
    const models: AIModel[] = [
      {
        name: 'gpt-4',
        provider: 'OpenAI',
        type: 'text',
        calls: 5846,
        tokens: 1169000,
        cost: 116.90,
        avgLatency: 1250,
        lastUsed: new Date().toISOString()
      },
      {
        name: 'gpt-3.5-turbo',
        provider: 'OpenAI',
        type: 'text',
        calls: 4023,
        tokens: 803000,
        cost: 16.06,
        avgLatency: 905,
        lastUsed: new Date().toISOString()
      },
      {
        name: 'claude-3-sonnet',
        provider: 'Anthropic',
        type: 'text',
        calls: 892,
        tokens: 178000,
        cost: 9.82,
        avgLatency: 1450,
        lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        name: 'dall-e-3',
        provider: 'OpenAI',
        type: 'image',
        calls: 147,
        tokens: 0,
        cost: 44.10,
        avgLatency: 3200,
        lastUsed: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      }
    ]

    return NextResponse.json({
      success: true,
      models
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch AI models'
    }, { status: 500 })
  }
}