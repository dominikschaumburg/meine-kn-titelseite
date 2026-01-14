import { NextRequest, NextResponse } from 'next/server'
import { generateDOICode } from '@/lib/doiCodes'
import { loadConfig } from '@/lib/config'

/**
 * POST /api/doi-code/generate
 * Generate a unique DOI code for session verification
 *
 * Body: { sessionId?: string }
 * Returns: { code: string, expiresAt: number }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const sessionId = body.sessionId || `session-${Date.now()}`

    // Load config to get DOI secret
    const config = await loadConfig()
    const secret = config.security.doiSecret

    // Generate code
    const doiCode = generateDOICode(secret, sessionId)

    return NextResponse.json({
      code: doiCode.code,
      expiresAt: doiCode.expiresAt,
      timestamp: doiCode.timestamp
    })
  } catch (error: any) {
    console.error('Failed to generate DOI code:', error)
    return NextResponse.json(
      { error: 'Failed to generate code' },
      { status: 500 }
    )
  }
}
