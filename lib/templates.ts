import { promises as fs } from 'fs'
import path from 'path'

export interface UserImagePosition {
  x: number
  y: number
  width: number
  height: number
  rotation?: number // Rotation in degrees
}

export interface TemplateConfig {
  id: string
  name: string
  userImagePosition: UserImagePosition
  description?: string
}

export interface Template {
  id: string
  backgroundPath?: string
  foregroundPath?: string
  config: TemplateConfig
}

export async function getRandomTemplate(): Promise<Template> {
  const templatesDir = path.join(process.cwd(), 'templates')
  
  try {
    const templateDirs = await fs.readdir(templatesDir)
    const validTemplates = []
    
    for (const dir of templateDirs) {
      const templatePath = path.join(templatesDir, dir)
      const stat = await fs.stat(templatePath)
      
      if (stat.isDirectory()) {
        const backgroundJpgPath = path.join(templatePath, 'background.jpg')
        const backgroundPngPath = path.join(templatePath, 'background.png')
        const foregroundPath = path.join(templatePath, 'foreground.png')
        const configPath = path.join(templatePath, 'config.json')

        try {
          // Config is required
          await fs.access(configPath)

          // Read config file fresh every time (no caching for development)
          const configData = await fs.readFile(configPath, 'utf-8')
          const config: TemplateConfig = JSON.parse(configData)
          console.log(`Loaded config for template ${dir}:`, JSON.stringify(config.userImagePosition))

          // Try to find background file (.jpg or .png) - optional
          let backgroundPath: string | undefined
          try {
            await fs.access(backgroundJpgPath)
            backgroundPath = backgroundJpgPath
          } catch {
            try {
              await fs.access(backgroundPngPath)
              backgroundPath = backgroundPngPath
            } catch {
              // Background is optional
              backgroundPath = undefined
            }
          }

          // Try to find foreground file - optional
          let foregroundPathFinal: string | undefined
          try {
            await fs.access(foregroundPath)
            foregroundPathFinal = foregroundPath
          } catch {
            // Foreground is optional
            foregroundPathFinal = undefined
          }

          validTemplates.push({
            id: dir,
            backgroundPath,
            foregroundPath: foregroundPathFinal,
            config
          })
        } catch (error) {
          // Skip invalid templates
          console.log(`Skipping template ${dir}:`, error)
        }
      }
    }
    
    if (validTemplates.length === 0) {
      throw new Error('No valid templates found')
    }
    
    const randomIndex = Math.floor(Math.random() * validTemplates.length)
    return validTemplates[randomIndex]
  } catch (error) {
    throw new Error(`Error loading templates: ${error}`)
  }
}

export async function getTemplateById(id: string): Promise<Template | null> {
  const templatesDir = path.join(process.cwd(), 'templates')
  const templatePath = path.join(templatesDir, id)

  try {
    const backgroundJpgPath = path.join(templatePath, 'background.jpg')
    const backgroundPngPath = path.join(templatePath, 'background.png')
    const foregroundPath = path.join(templatePath, 'foreground.png')
    const configPath = path.join(templatePath, 'config.json')

    // Config is required
    await fs.access(configPath)

    const configData = await fs.readFile(configPath, 'utf-8')
    const config: TemplateConfig = JSON.parse(configData)
    console.log(`getTemplateById(${id}):`, JSON.stringify(config.userImagePosition))

    // Try to find background file (.jpg or .png) - optional
    let backgroundPath: string | undefined
    try {
      await fs.access(backgroundJpgPath)
      backgroundPath = backgroundJpgPath
    } catch {
      try {
        await fs.access(backgroundPngPath)
        backgroundPath = backgroundPngPath
      } catch {
        // Background is optional
        backgroundPath = undefined
      }
    }

    // Try to find foreground file - optional
    let foregroundPathFinal: string | undefined
    try {
      await fs.access(foregroundPath)
      foregroundPathFinal = foregroundPath
    } catch {
      // Foreground is optional
      foregroundPathFinal = undefined
    }

    return {
      id,
      backgroundPath,
      foregroundPath: foregroundPathFinal,
      config
    }
  } catch {
    return null
  }
}