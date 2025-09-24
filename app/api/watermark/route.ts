import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    const logoPath = path.join(process.cwd(), 'assets', 'logos', 'KN_Logo_Farbig.svg')
    const logoBuffer = await readFile(logoPath)
    
    return new NextResponse(new Uint8Array(logoBuffer), {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000',
      },
    })
    
  } catch (error) {
    console.error('Watermark error:', error)
    return NextResponse.json(
      { error: 'Failed to load watermark' }, 
      { status: 500 }
    )
  }
}