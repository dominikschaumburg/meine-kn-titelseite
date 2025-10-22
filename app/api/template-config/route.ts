import { NextResponse } from 'next/server'
import { getRandomTemplate } from '@/lib/templates'

export async function GET() {
  try {
    const template = await getRandomTemplate()

    // Convert filesystem paths to public URL paths
    let publicBackgroundPath: string | undefined
    if (template.backgroundPath) {
      publicBackgroundPath = `/templates/${template.id}/background.png`
    }

    let publicForegroundPath: string | undefined
    if (template.foregroundPath) {
      publicForegroundPath = `/templates/${template.id}/foreground.png`
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
