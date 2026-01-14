import { NextRequest, NextResponse } from 'next/server'
import { validateDOICode } from '@/lib/doiCodes'
import { loadConfig } from '@/lib/config'

/**
 * POST /api/doi-code/validate
 * Validate a DOI code
 *
 * Body: { code: string }
 * Returns: { valid: boolean, message?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const code = body.code?.trim()?.toUpperCase()

    if (!code) {
      return NextResponse.json({
        valid: false,
        message: 'Code is required'
      })
    }

    // Load config to get DOI secret
    const config = await loadConfig()
    const secret = config.security.doiSecret

    // Validate code format
    const isValid = validateDOICode(code, secret)

    if (!isValid) {
      return NextResponse.json({
        valid: false,
        message: 'Invalid code format'
      })
    }

    // Code is valid
    return NextResponse.json({
      valid: true,
      message: 'Code is valid'
    })
  } catch (error: any) {
    console.error('Failed to validate DOI code:', error)
    return NextResponse.json({
      valid: false,
      message: 'Validation error'
    }, { status: 500 })
  }
}
