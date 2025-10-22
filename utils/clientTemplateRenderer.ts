// Client-side template rendering using Canvas API
// This eliminates server load by processing images in the browser

export interface TemplateConfig {
  id: string
  name: string
  backgroundPath?: string
  foregroundPath?: string
  userImagePosition: {
    x: number
    y: number
    width: number
    height: number
    rotation: number
  }
}

/**
 * Load an image and return a Promise that resolves with the image
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/**
 * Render the template with the user's cropped image client-side
 * @param croppedImageDataUrl - The user's cropped image as a data URL (must be 1920x1080)
 * @param templateConfig - The template configuration
 * @returns A Promise that resolves with the final image as a data URL
 */
export async function renderTemplate(
  croppedImageDataUrl: string,
  templateConfig: TemplateConfig
): Promise<string> {
  // Create canvas with FIXED size (1920x1920) - independent of viewport
  const canvas = document.createElement('canvas')
  canvas.width = 1920
  canvas.height = 1920

  const ctx = canvas.getContext('2d', {
    alpha: false, // No alpha channel for better performance
    desynchronized: true
  })

  if (!ctx) {
    throw new Error('Could not get canvas context')
  }

  // Disable image smoothing for pixel-perfect rendering
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  // 1. Draw background layer (ALWAYS 1920x1920)
  if (templateConfig.backgroundPath) {
    const backgroundImage = await loadImage(templateConfig.backgroundPath)
    // Force exact dimensions regardless of image natural size
    ctx.drawImage(backgroundImage, 0, 0, 1920, 1920)
  } else {
    // Fill with white background if no background image
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, 1920, 1920)
  }

  // 2. Draw user image at template-defined position
  const userImage = await loadImage(croppedImageDataUrl)
  const pos = templateConfig.userImagePosition

  console.log('Template Render Debug:', {
    userImageDimensions: { width: userImage.width, height: userImage.height },
    userImageNatural: { width: userImage.naturalWidth, height: userImage.naturalHeight },
    positionConfig: pos,
    canvasDimensions: { width: canvas.width, height: canvas.height }
  })

  // CRITICAL: Verify that the user image is exactly 1920x1080
  if (userImage.width !== 1920 || userImage.height !== 1080) {
    console.warn('⚠️ User image is not 1920x1080! This will cause rendering issues.', {
      actual: { width: userImage.width, height: userImage.height },
      expected: { width: 1920, height: 1080 }
    })
  }

  // Save canvas state for rotation
  ctx.save()

  // Apply rotation if specified
  if (pos.rotation && pos.rotation !== 0) {
    const centerX = pos.x + pos.width / 2
    const centerY = pos.y + pos.height / 2
    ctx.translate(centerX, centerY)
    ctx.rotate((pos.rotation * Math.PI) / 180)
    ctx.translate(-centerX, -centerY)
  }

  // Draw user image at exact position with exact dimensions
  // CRITICAL: Always use the ENTIRE user image (which should be 1920x1080)
  ctx.drawImage(
    userImage,
    0, 0, userImage.width, userImage.height, // Source: entire user image
    pos.x, pos.y, pos.width, pos.height      // Destination: template position
  )

  // Restore canvas state
  ctx.restore()

  // 3. Draw foreground layer on top (ALWAYS 1920x1920)
  if (templateConfig.foregroundPath) {
    const foregroundImage = await loadImage(templateConfig.foregroundPath)
    // Force exact dimensions regardless of image natural size
    ctx.drawImage(foregroundImage, 0, 0, 1920, 1920)
  }

  // Convert to JPEG with high quality
  return canvas.toDataURL('image/jpeg', 0.95)
}
