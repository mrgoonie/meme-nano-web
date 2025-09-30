import { NextRequest, NextResponse } from 'next/server'
import { analyzePromptAndGenerateCaptions } from '@/lib/api/gemini'
import { promptSchema, sanitizePrompt, redactApiKey, analyzeResponseSchema } from '@/lib/validators'
import { checkRateLimit } from '@/lib/utils/rate-limit'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const rateLimit = checkRateLimit(ip, { interval: 60000, maxRequests: 10 })

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }

    // Get API key from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid API key' },
        { status: 401 }
      )
    }

    const apiKey = authHeader.substring(7)

    // Get and validate prompt from body
    const body = await request.json()
    const validation = promptSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    const sanitizedPrompt = sanitizePrompt(validation.data.prompt)

    // Analyze prompt and generate captions
    const result = await analyzePromptAndGenerateCaptions(apiKey, sanitizedPrompt)

    // Validate response
    const validatedResult = analyzeResponseSchema.safeParse(result)
    if (!validatedResult.success) {
      throw new Error('Invalid response from AI')
    }

    return NextResponse.json({
      keywords: validatedResult.data.keywords,
      captions: validatedResult.data.captionSets,
    })
  } catch (error) {
    // Redact API key in error logs
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error in analyze API:', errorMessage)

    if (error instanceof Error) {
      if (error.message.includes('API key') || errorMessage.includes('401')) {
        return NextResponse.json(
          { error: 'Invalid API key' },
          { status: 401 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to analyze prompt' },
      { status: 500 }
    )
  }
}