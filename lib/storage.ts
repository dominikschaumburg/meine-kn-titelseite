import { promises as fs } from 'fs'
import path from 'path'
import crypto from 'crypto'

export interface StoredImage {
  id: string
  templateId: string
  filename: string
  createdAt: Date
}

export class ImageStorage {
  private storagePath: string
  
  constructor() {
    this.storagePath = path.join(process.cwd(), 'storage', 'generated-images')
  }
  
  async ensureStorageDir(): Promise<void> {
    try {
      await fs.access(this.storagePath)
    } catch {
      await fs.mkdir(this.storagePath, { recursive: true })
    }
  }
  
  generateImageId(): string {
    return crypto.randomBytes(16).toString('hex')
  }
  
  async saveImage(buffer: Buffer, templateId: string): Promise<StoredImage> {
    await this.ensureStorageDir()
    
    const imageId = this.generateImageId()
    const filename = `${imageId}.jpg`
    const filepath = path.join(this.storagePath, filename)
    
    await fs.writeFile(filepath, buffer)
    
    const storedImage: StoredImage = {
      id: imageId,
      templateId,
      filename,
      createdAt: new Date()
    }
    
    // Save metadata
    const metaPath = path.join(this.storagePath, `${imageId}.json`)
    await fs.writeFile(metaPath, JSON.stringify(storedImage, null, 2))
    
    return storedImage
  }
  
  async getImage(imageId: string): Promise<Buffer | null> {
    try {
      const filepath = path.join(this.storagePath, `${imageId}.jpg`)
      return await fs.readFile(filepath)
    } catch {
      return null
    }
  }
  
  async getImageMetadata(imageId: string): Promise<StoredImage | null> {
    try {
      const metaPath = path.join(this.storagePath, `${imageId}.json`)
      const data = await fs.readFile(metaPath, 'utf-8')
      return JSON.parse(data)
    } catch {
      return null
    }
  }
  
  async deleteImage(imageId: string): Promise<boolean> {
    try {
      const filepath = path.join(this.storagePath, `${imageId}.jpg`)
      const metaPath = path.join(this.storagePath, `${imageId}.json`)
      
      await fs.unlink(filepath)
      await fs.unlink(metaPath)
      
      return true
    } catch {
      return false
    }
  }
  
  async cleanupOldImages(maxAgeHours: number = 24): Promise<number> {
    await this.ensureStorageDir()
    
    const files = await fs.readdir(this.storagePath)
    const jsonFiles = files.filter(f => f.endsWith('.json'))
    
    let deletedCount = 0
    const maxAge = maxAgeHours * 60 * 60 * 1000
    
    for (const jsonFile of jsonFiles) {
      try {
        const metaPath = path.join(this.storagePath, jsonFile)
        const data = await fs.readFile(metaPath, 'utf-8')
        const metadata: StoredImage = JSON.parse(data)
        
        const age = Date.now() - new Date(metadata.createdAt).getTime()
        
        if (age > maxAge) {
          const imageId = metadata.id
          if (await this.deleteImage(imageId)) {
            deletedCount++
          }
        }
      } catch {
        // Skip invalid metadata files
      }
    }
    
    return deletedCount
  }
}

export const imageStorage = new ImageStorage()