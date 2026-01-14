import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const ANALYTICS_FILE = path.join(process.cwd(), 'analytics.json')

/**
 * POST /api/analytics/reset
 * Reset all analytics data (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const expectedPassword = process.env.ANALYTICS_PASSWORD || 'kn2025analytics'

    if (token !== expectedPassword) {
      return NextResponse.json(
        { error: 'Invalid authentication' },
        { status: 401 }
      )
    }

    // Reset analytics to default
    const defaultAnalytics = {
      pageViews: 0,
      photoUploads: 0,
      doiCompletions: 0,
      moderationPassed: 0,
      moderationFlagged: 0,
      howItWorksClicks: 0,
      directContestClicks: 0,
      imageDownloads: 0,
      imageShares: 0,
      interactions: 0,
      lastUpdated: new Date().toISOString(),
      events: []
    }

    await fs.writeFile(ANALYTICS_FILE, JSON.stringify(defaultAnalytics, null, 2))

    return NextResponse.json({
      success: true,
      message: 'Analytics reset successfully'
    })
  } catch (error: any) {
    console.error('Failed to reset analytics:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to reset analytics' },
      { status: 500 }
    )
  }
}
