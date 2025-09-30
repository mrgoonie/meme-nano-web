import { NextRequest, NextResponse } from 'next/server'
import { generateMemeImage } from '@/lib/api/gemini'
import type { MemeTemplate, GeneratedMeme } from '@/lib/types'
import { checkRateLimit } from '@/lib/utils/rate-limit'

interface CaptionSet {
  top: string
  bottom: string
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const rateLimit = checkRateLimit(ip, { interval: 60000, maxRequests: 5 })

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

    // Get data from body
    const body = await request.json()
    const { templates, captions, prompt } = body

    if (!Array.isArray(templates) || !Array.isArray(captions)) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }

    // Generate memes (up to 4)
    const memes: GeneratedMeme[] = []
    const maxMemes = Math.min(templates.length, captions.length, 4)

    for (let i = 0; i < maxMemes; i++) {
      try {
        const template: MemeTemplate = templates[i]
        const caption: CaptionSet = captions[i]

        // Generate meme image using Gemini
        const imageBase64 = await generateMemeImage(
          apiKey,
          template.url,
          caption.top,
          caption.bottom,
          prompt
        )

        memes.push({
          id: `${template.id}-${Date.now()}-${i}`,
          imageUrl: `data:image/jpeg;base64,${imageBase64}`,
          template,
          captions: [
            { text: caption.top, box_index: 0 },
            { text: caption.bottom, box_index: 1 },
          ],
        })
      } catch (error) {
        console.error(`Error generating meme ${i}:`, error)
        // Continue with other memes even if one fails
      }
    }

    if (memes.length === 0) {
      return NextResponse.json(
        { error: 'Failed to generate any memes' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      memes,
    })
  } catch (error) {
    // Redact sensitive information in error logs
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error in generate API:', errorMessage)

    if (error instanceof Error) {
      if (error.message.includes('API key') || errorMessage.includes('401')) {
        return NextResponse.json(
          { error: 'Invalid API key' },
          { status: 401 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to generate memes' },
      { status: 500 }
    )
  }
}