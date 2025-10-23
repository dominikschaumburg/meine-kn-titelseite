import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const ANALYTICS_FILE = path.join(process.cwd(), 'analytics.json')
const ANALYTICS_PASSWORD = process.env.ANALYTICS_PASSWORD || 'kn2025analytics'

export async function POST(request: NextRequest) {
  try {
    // Require authentication to reset analytics
    const { password } = await request.json()

    if (!password || password !== ANALYTICS_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resetData = {
      pageViews: 0,
      photoUploads: 0,
      doiCompletions: 0,
      moderationPassed: 0,
      moderationFlagged: 0,
      lastUpdated: new Date().toISOString()
    }

    await fs.writeFile(ANALYTICS_FILE, JSON.stringify(resetData, null, 2))

    return NextResponse.json({ success: true, data: resetData })
  } catch (error) {
    console.error('Reset error:', error)
    return NextResponse.json({ error: 'Failed to reset analytics' }, { status: 500 })
  }
}
