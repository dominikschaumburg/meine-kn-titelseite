import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { promises as fs } from 'fs'
import path from 'path'
import { loadConfig } from '@/lib/config'

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
  try {
    // Check if moderation is enabled in config
    const config = await loadConfig()

    if (!config.whiteLabel.moderationEnabled) {
      console.log('Moderation is disabled in config, skipping check')
      return NextResponse.json({
        flagged: false,
        categories: {},
        category_scores: {},
        skipped: true,
        message: 'Moderation disabled'
      })
    }

    // Initialize OpenAI-compatible client with litellm endpoint
    const apiKey = process.env.LITELLM_API_KEY

    if (!apiKey) {
      console.error('LITELLM_API_KEY environment variable is not set')
      return NextResponse.json(
        { error: 'Moderation service is not configured' },
        { status: 500 }
      )
    }

    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: 'https://litellm.ki.rndtech.de/v1'
    })

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

  } catch (error: any) {
    console.error('Moderation error:', error)

    // Check if it's a rate limit error
    if (error?.status === 429 || error?.message?.includes('rate limit') || error?.message?.includes('429')) {
      console.warn('Rate limit exceeded for moderation API - allowing content without moderation')
      // Return unflagged result to allow the application to continue
      return NextResponse.json({
        flagged: false,
        categories: {},
        category_scores: {},
        warning: 'Moderation temporarily unavailable'
      })
    }

    // For other errors, also fail gracefully
    console.warn('Moderation API error - allowing content without moderation')
    return NextResponse.json({
      flagged: false,
      categories: {},
      category_scores: {},
      warning: 'Moderation temporarily unavailable'
    })
  }
}