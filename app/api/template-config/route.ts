import { NextResponse } from 'next/server'
import { getRandomTemplate } from '@/lib/templates'

export async function GET() {
  try {
    const template = await getRandomTemplate()

    // Use API endpoints to serve template assets
    let publicBackgroundPath: string | undefined
    if (template.backgroundPath) {
      publicBackgroundPath = `/api/template-assets?id=${template.id}&type=background`
    }

    let publicForegroundPath: string | undefined
    if (template.foregroundPath) {
      publicForegroundPath = `/api/template-assets?id=${template.id}&type=foreground`
    }

    return NextResponse.json({
      id: template.id,
      name: template.config.name,
      backgroundPath: publicBackgroundPath,
      foregroundPath: publicForegroundPath,
      userImagePosition: template.config.userImagePosition
    })
  } catch (error) {
    console.error('Template config error:', error)
    return NextResponse.json(
      { error: 'Failed to load template configuration' },
      { status: 500 }
    )
  }
}
