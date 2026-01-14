import { NextRequest, NextResponse } from 'next/server'
import { loadConfig, saveConfig, getPublicConfig, validateConfig, ensureConfigExists } from '@/lib/config'

// Ensure config exists on startup
ensureConfigExists().catch(console.error)

/**
 * GET /api/config
 * Returns public configuration (without secrets)
 * No authentication required
 */
export async function GET(request: NextRequest) {
  try {
    const config = await loadConfig()
    const publicConfig = getPublicConfig(config)

    return NextResponse.json(publicConfig, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
        'X-Config-Version': config.version
      }
    })
  } catch (error: any) {
    console.error('Failed to load config:', error)
    return NextResponse.json(
      { error: 'Failed to load configuration' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/config
 * Update configuration
 * Requires admin authentication
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

    // Parse request body
    const updates = await request.json()

    // Load current config
    const currentConfig = await loadConfig()

    // Merge updates (only whiteLabel section can be updated via API)
    const newConfig = {
      ...currentConfig,
      whiteLabel: {
        ...currentConfig.whiteLabel,
        ...updates.whiteLabel
      }
    }

    // Validate before saving
    validateConfig(newConfig)

    // Save to disk
    await saveConfig(newConfig)

    // Return updated public config
    const publicConfig = getPublicConfig(newConfig)

    return NextResponse.json({
      success: true,
      config: publicConfig
    })
  } catch (error: any) {
    console.error('Failed to save config:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to save configuration' },
      { status: 400 }
    )
  }
}
