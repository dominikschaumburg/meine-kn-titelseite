import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const type = searchParams.get('type')
    
    if (!id || !type) {
      return NextResponse.json({ error: 'Missing id or type parameter' }, { status: 400 })
    }

    const templatesDir = path.join(process.cwd(), 'templates')
    const templateDir = path.join(templatesDir, id)
    
    let filePath: string
    let contentType: string
    
    switch (type) {
      case 'background':
        filePath = path.join(templateDir, 'background.jpg')
        contentType = 'image/jpeg'
        break
      case 'foreground':
        filePath = path.join(templateDir, 'foreground.png')
        contentType = 'image/png'
        break
      case 'config':
        filePath = path.join(templateDir, 'config.json')
        contentType = 'application/json'
        break
      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
    
    // Check if file exists
    try {
      await fs.access(filePath)
    } catch {
      return NextResponse.json({ error: 'Template file not found' }, { status: 404 })
    }
    
    // Read and return file
    const fileBuffer = await fs.readFile(filePath)
    
    if (type === 'config') {
      // For JSON, parse and return as JSON
      const configData = JSON.parse(fileBuffer.toString())
      return NextResponse.json(configData)
    } else {
      // For images, return as binary
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Content-Length': fileBuffer.length.toString(),
          'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
        }
      })
    }
    
  } catch (error) {
    console.error('Template asset error:', error)
    return NextResponse.json(
      { error: 'Failed to load template asset' }, 
      { status: 500 }
    )
  }
}