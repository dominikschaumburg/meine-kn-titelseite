import { NextRequest, NextResponse } from 'next/server'
import { createCanvas, loadImage } from 'canvas'
import { getRandomTemplate } from '@/lib/templates'
import { imageStorage } from '@/lib/storage'

async function cropAndFitImage(image: any, targetWidth: number, targetHeight: number) {
  const canvas = createCanvas(targetWidth, targetHeight)
  const ctx = canvas.getContext('2d')
  
  const sourceAspect = image.width / image.height
  const targetAspect = targetWidth / targetHeight
  
  let sourceX = 0
  let sourceY = 0
  let sourceWidth = image.width
  let sourceHeight = image.height
  
  // Crop to fit target aspect ratio
  if (sourceAspect > targetAspect) {
    // Source is wider, crop horizontally
    sourceWidth = image.height * targetAspect
    sourceX = (image.width - sourceWidth) / 2
  } else {
    // Source is taller, crop vertically
    sourceHeight = image.width / targetAspect
    sourceY = (image.height - sourceHeight) / 2
  }
  
  // Draw the cropped and scaled image
  ctx.drawImage(
    image, 
    sourceX, sourceY, sourceWidth, sourceHeight,
    0, 0, targetWidth, targetHeight
  )
  
  return canvas
}

export async function POST(request: NextRequest) {
  try {
    const { image, imageId } = await request.json()
    
    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    // If imageId is provided, try to load existing image
    if (imageId) {
      const existingImage = await imageStorage.getImage(imageId)
      if (existingImage) {
        return new NextResponse(new Uint8Array(existingImage), {
          headers: {
            'Content-Type': 'image/jpeg',
            'Content-Length': existingImage.length.toString(),
          },
        })
      }
    }

    // Get random template (force fresh read in development)
    const template = await getRandomTemplate()
    
    // Load images
    const userImage = await loadImage(image)
    const backgroundImage = template.backgroundPath ? await loadImage(template.backgroundPath) : null
    const foregroundImage = template.foregroundPath ? await loadImage(template.foregroundPath) : null

    // Create main canvas (1920x1920)
    const canvas = createCanvas(1920, 1920)
    const ctx = canvas.getContext('2d')

    // 1. Draw background layer (if exists)
    if (backgroundImage) {
      ctx.drawImage(backgroundImage, 0, 0, 1920, 1920)
    } else {
      // Fill with white background if no background image
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, 1920, 1920)
    }
    
    // 2. Draw user image with template-specific positioning and rotation
    const pos = template.config.userImagePosition
    const userImageCanvas = await cropAndFitImage(userImage, pos.width, pos.height)
    
    // Save canvas state for rotation
    ctx.save()
    
    // Move to center of user image position and rotate if needed
    if (pos.rotation && pos.rotation !== 0) {
      const centerX = pos.x + pos.width / 2
      const centerY = pos.y + pos.height / 2
      ctx.translate(centerX, centerY)
      ctx.rotate((pos.rotation * Math.PI) / 180)
      ctx.translate(-centerX, -centerY)
    }
    
    ctx.drawImage(
      userImageCanvas,
      pos.x, pos.y, pos.width, pos.height
    )
    
    // Restore canvas state
    ctx.restore()

    // 3. Draw foreground layer (if exists) - important: this comes AFTER user image
    if (foregroundImage) {
      ctx.drawImage(foregroundImage, 0, 0, 1920, 1920)
    }
    
    // Convert to buffer
    const buffer = canvas.toBuffer('image/jpeg', { quality: 0.9 })
    
    // Save the generated image
    const storedImage = await imageStorage.saveImage(buffer, template.id)
    
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Length': buffer.length.toString(),
        'X-Image-ID': storedImage.id,
      },
    })
    
  } catch (error) {
    console.error('Cover generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate cover' }, 
      { status: 500 }
    )
  }
}