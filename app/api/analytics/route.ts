import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

// Simple file-based analytics without cookies
// Tracks: page views, photo uploads, DOI completions

const ANALYTICS_FILE = path.join(process.cwd(), 'analytics.json')

interface AnalyticsEvent {
  type: string
  timestamp: string
}

interface AnalyticsData {
  pageViews: number
  photoUploads: number
  doiCompletions: number
  moderationPassed: number
  moderationFlagged: number
  howItWorksClicks: number
  directContestClicks: number
  imageDownloads: number
  imageShares: number
  interactions: number
  lastUpdated: string
  events: AnalyticsEvent[]
}

async function readAnalytics(): Promise<AnalyticsData> {
  try {
    const data = await fs.readFile(ANALYTICS_FILE, 'utf-8')
    const parsed = JSON.parse(data)

    // Ensure events array exists (migration)
    if (!parsed.events) {
      parsed.events = []
    }

    // Ensure interactions field exists (migration)
    if (parsed.interactions === undefined) {
      parsed.interactions = (parsed.imageDownloads || 0) + (parsed.imageShares || 0)
    }

    return parsed
  } catch {
    // File doesn't exist yet, return default values
    return {
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
  }
}

async function writeAnalytics(data: AnalyticsData): Promise<void> {
  // Prune old events (keep last 30 days)
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000)
  data.events = data.events.filter(event => {
    const eventTime = new Date(event.timestamp).getTime()
    return eventTime > thirtyDaysAgo
  })

  // Atomic write (write to temp, then rename)
  const tempFile = `${ANALYTICS_FILE}.tmp`
  await fs.writeFile(tempFile, JSON.stringify(data, null, 2))
  await fs.rename(tempFile, ANALYTICS_FILE)
}

export async function POST(request: NextRequest) {
  try {
    const { event } = await request.json()

    const validEvents = [
      'pageView',
      'photoUpload',
      'doiCompletion',
      'moderationPassed',
      'moderationFlagged',
      'howItWorksClick',
      'directContestClick',
      'imageDownload',
      'imageShare',
      'interaction' // New: combined download+share
    ]

    if (!event || !validEvents.includes(event)) {
      return NextResponse.json({ error: 'Invalid event type' }, { status: 400 })
    }

    const analytics = await readAnalytics()
    const timestamp = new Date().toISOString()

    // Update the appropriate counter
    if (event === 'pageView') {
      analytics.pageViews += 1
    } else if (event === 'photoUpload') {
      analytics.photoUploads += 1
    } else if (event === 'doiCompletion') {
      analytics.doiCompletions += 1
    } else if (event === 'moderationPassed') {
      analytics.moderationPassed += 1
    } else if (event === 'moderationFlagged') {
      analytics.moderationFlagged += 1
    } else if (event === 'howItWorksClick') {
      analytics.howItWorksClicks += 1
    } else if (event === 'directContestClick') {
      analytics.directContestClicks += 1
    } else if (event === 'imageDownload') {
      analytics.imageDownloads += 1
    } else if (event === 'imageShare') {
      analytics.imageShares += 1
    } else if (event === 'interaction') {
      analytics.interactions += 1
    }

    // Add event to time-series array
    analytics.events.push({
      type: event,
      timestamp
    })

    analytics.lastUpdated = timestamp

    await writeAnalytics(analytics)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Failed to track event' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const analytics = await readAnalytics()
    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Failed to get analytics' }, { status: 500 })
  }
}
