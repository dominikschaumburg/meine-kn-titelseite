import { NextRequest, NextResponse } from 'next/server'

// Simple password authentication
// In production, use environment variables and proper hashing
const ANALYTICS_PASSWORD = process.env.ANALYTICS_PASSWORD || 'kn2025analytics'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (password === ANALYTICS_PASSWORD) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}
