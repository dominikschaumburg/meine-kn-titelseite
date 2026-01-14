import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET() {
  try {
    const templatesDir = path.join(process.cwd(), 'templates')

    // Read templates directory
    const entries = await fs.readdir(templatesDir, { withFileTypes: true })

    // Filter for directories only
    const templates = entries
      .filter(entry => entry.isDirectory() && !entry.name.startsWith('.'))
      .map(entry => entry.name)
      .sort()

    return NextResponse.json({ templates })
  } catch (error) {
    console.error('Error listing templates:', error)
    return NextResponse.json({ templates: [] })
  }
}
