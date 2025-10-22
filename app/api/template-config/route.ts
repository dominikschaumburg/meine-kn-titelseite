import { NextResponse } from 'next/server'
import { getRandomTemplate } from '@/lib/templates'

export async function GET() {
  try {
    const template = await getRandomTemplate()

    // Convert filesystem path to public URL path
    let publicForegroundPath: string | undefined
    if (template.foregroundPath) {
      // foregroundPath is like: /path/to/project/templates/1/foreground.png
      // We need to convert it to: /templates/1/foreground.png (public URL)
      publicForegroundPath = `/templates/${template.id}/foreground.png`
    }

    return NextResponse.json({
      id: template.id,
      name: template.config.name,
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
