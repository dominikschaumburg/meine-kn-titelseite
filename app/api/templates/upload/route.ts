import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const expectedPassword = process.env.ANALYTICS_PASSWORD || 'kn2025analytics'

    if (token !== expectedPassword) {
      return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 })
    }

    const formData = await request.formData()
    const templateId = formData.get('templateId') as string
    const backgroundFile = formData.get('background') as File | null
    const foregroundFile = formData.get('foreground') as File | null

    if (!templateId) {
      return NextResponse.json({ error: 'Template ID required' }, { status: 400 })
    }

    // Validate template ID (alphanumeric + dash/underscore only)
    if (!/^[a-zA-Z0-9_-]+$/.test(templateId)) {
      return NextResponse.json({ error: 'Invalid template ID' }, { status: 400 })
    }

    // Create template directory
    const templatePath = path.join(process.cwd(), 'templates', templateId)
    await fs.mkdir(templatePath, { recursive: true })

    // Save background if provided
    if (backgroundFile) {
      const backgroundBuffer = Buffer.from(await backgroundFile.arrayBuffer())
      const backgroundPath = path.join(templatePath, 'background.png')
      await fs.writeFile(backgroundPath, backgroundBuffer)
    }

    // Save foreground if provided
    if (foregroundFile) {
      const foregroundBuffer = Buffer.from(await foregroundFile.arrayBuffer())
      const foregroundPath = path.join(templatePath, 'foreground.png')
      await fs.writeFile(foregroundPath, foregroundBuffer)
    }

    // Create default config if none exists
    const configPath = path.join(templatePath, 'config.json')
    try {
      await fs.access(configPath)
    } catch {
      // Config doesn't exist, create default
      const defaultConfig = {
        id: templateId,
        name: `Template ${templateId}`,
        userImagePosition: {
          x: 100,
          y: 100,
          width: 400,
          height: 300,
          rotation: 0
        },
        description: `Hochgeladenes Template ${templateId}`
      }
      await fs.writeFile(configPath, JSON.stringify(defaultConfig, null, 2))
    }

    return NextResponse.json({
      success: true,
      message: `Template ${templateId} erfolgreich hochgeladen`,
      templateId
    })
  } catch (error) {
    console.error('Template upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload template' },
      { status: 500 }
    )
  }
}
