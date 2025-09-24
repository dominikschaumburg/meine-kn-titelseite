import { NextRequest, NextResponse } from 'next/server'
import { imageStorage } from '@/lib/storage'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params
    const { searchParams } = new URL(request.url)
    const withoutWatermark = searchParams.get('doi') === 'true'
    
    const imageBuffer = await imageStorage.getImage(id)
    
    if (!imageBuffer) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }
    
    const headers: Record<string, string> = {
      'Content-Type': 'image/jpeg',
      'Content-Length': imageBuffer.length.toString(),
      'Cache-Control': 'public, max-age=3600',
    }
    
    if (withoutWatermark) {
      headers['X-Watermark'] = 'removed'
    }
    
    return new NextResponse(imageBuffer, { headers })
    
  } catch (error) {
    console.error('Image retrieval error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve image' }, 
      { status: 500 }
    )
  }
}