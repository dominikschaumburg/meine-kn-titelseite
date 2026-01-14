import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

/**
 * POST /api/template-config/save
 * Save template configuration directly to disk
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
    const { templateId, config } = await request.json()

    if (!templateId || !config) {
      return NextResponse.json(
        { error: 'templateId and config are required' },
        { status: 400 }
      )
    }

    // Validate template ID (only alphanumeric)
    if (!/^[a-zA-Z0-9_-]+$/.test(templateId)) {
      return NextResponse.json(
        { error: 'Invalid template ID' },
        { status: 400 }
      )
    }

    // Construct template path
    const templatePath = path.join(process.cwd(), 'templates', templateId)
    const configPath = path.join(templatePath, 'config.json')

    // Ensure template directory exists
    try {
      await fs.access(templatePath)
    } catch {
      await fs.mkdir(templatePath, { recursive: true })
    }

    // Write config file
    await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8')

    return NextResponse.json({
      success: true,
      message: `Template ${templateId} configuration saved`,
      path: `templates/${templateId}/config.json`
    })
  } catch (error: any) {
    console.error('Failed to save template config:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to save configuration' },
      { status: 500 }
    )
  }
}
