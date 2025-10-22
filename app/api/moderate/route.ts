import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { promises as fs } from 'fs'
import path from 'path'

const ANALYTICS_FILE = path.join(process.cwd(), 'analytics.json')

async function trackModeration(flagged: boolean) {
  try {
    const data = await fs.readFile(ANALYTICS_FILE, 'utf-8')
    const analytics = JSON.parse(data)

    if (flagged) {
      analytics.moderationFlagged = (analytics.moderationFlagged || 0) + 1
    } else {
      analytics.moderationPassed = (analytics.moderationPassed || 0) + 1
    }

    analytics.lastUpdated = new Date().toISOString()
    await fs.writeFile(ANALYTICS_FILE, JSON.stringify(analytics, null, 2))
  } catch (error) {
    console.error('Failed to track moderation:', error)
    // Don't fail the request if analytics fails
  }
}

export async function POST(request: NextRequest) {
  // Initialize OpenAI-compatible client with litellm endpoint
  const openai = new OpenAI({
    apiKey: 'sk-9cRZIcMm7X8GhiMzsnidEQ',
    baseURL: 'https://litellm.ki.rndtech.de/v1'
  })

  try {
    const { image } = await request.json()

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    // Extract base64 data and format properly
    const base64Data = image.replace(/^data:image\/[a-z]+;base64,/, '')

    const response = await openai.moderations.create({
      model: 'openai/omni-moderation-latest',
      input: [
        {
          type: 'image_url',
          image_url: {
            url: `data:image/jpeg;base64,${base64Data}`
          }
        }
      ]
    })

    const result = response.results[0]

    // Track moderation result in analytics
    await trackModeration(result.flagged)

    return NextResponse.json({
      flagged: result.flagged,
      categories: result.categories,
      category_scores: result.category_scores
    })

  } catch (error) {
    console.error('Moderation error:', error)
    return NextResponse.json(
      { error: 'Moderation failed' },
      { status: 500 }
    )
  }
}