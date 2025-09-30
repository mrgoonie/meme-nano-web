import { NextRequest, NextResponse } from 'next/server'
import { searchMemeTemplates } from '@/lib/api/imgflip'
import { checkRateLimit } from '@/lib/utils/rate-limit'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const rateLimit = checkRateLimit(ip, { interval: 60000, maxRequests: 20 })

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { keywords } = body

    if (!Array.isArray(keywords)) {
      return NextResponse.json(
        { error: 'Invalid keywords' },
        { status: 400 }
      )
    }

    // Search for meme templates
    const templates = await searchMemeTemplates(keywords)

    return NextResponse.json({
      templates,
    })
  } catch (error) {
    console.error('Error in templates API:', error)

    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}