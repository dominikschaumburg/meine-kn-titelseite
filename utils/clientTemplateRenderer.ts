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
 * @param croppedImageDataUrl - The user's cropped image as a data URL
 * @param templateConfig - The template configuration
 * @returns A Promise that resolves with the final image as a data URL
 */
export async function renderTemplate(
  croppedImageDataUrl: string,
  templateConfig: TemplateConfig
): Promise<string> {
  // Create canvas (1920x1920)
  const canvas = document.createElement('canvas')
  canvas.width = 1920
  canvas.height = 1920
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Could not get canvas context')
  }

  // 1. Draw background layer if it exists
  if (templateConfig.backgroundPath) {
    const backgroundImage = await loadImage(templateConfig.backgroundPath)
    ctx.drawImage(backgroundImage, 0, 0, 1920, 1920)
  } else {
    // Fill with white background if no background image
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, 1920, 1920)
  }

  // 2. Draw user image with template positioning
  const userImage = await loadImage(croppedImageDataUrl)
  const pos = templateConfig.userImagePosition

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
    userImage,
    pos.x,
    pos.y,
    pos.width,
    pos.height
  )

  // Restore canvas state
  ctx.restore()

  // 3. Draw foreground layer on top if it exists
  if (templateConfig.foregroundPath) {
    const foregroundImage = await loadImage(templateConfig.foregroundPath)
    ctx.drawImage(foregroundImage, 0, 0, 1920, 1920)
  }

  // Convert to JPEG data URL
  return canvas.toDataURL('image/jpeg', 0.9)
}
