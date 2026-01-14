import { promises as fs } from 'fs'
import path from 'path'
import crypto from 'crypto'

export interface WhiteLabelConfig {
  contestPrize: string
  doiUrl: string
  actionStart: string
  actionEnd: string
  moderationEnabled: boolean
  formalAddress: boolean
  metaTitle: string
  metaDescription: string
  socialShareImage: string
}

export interface SecurityConfig {
  doiSecret: string
  adminPassword: string
}

export interface AppConfig {
  version: string
  whiteLabel: WhiteLabelConfig
  security: SecurityConfig
}

const CONFIG_FILE = path.join(process.cwd(), 'config.json')

/**
 * Load configuration from config.json
 * Always reads fresh from disk (no caching)
 */
export async function loadConfig(): Promise<AppConfig> {
  try {
    const data = await fs.readFile(CONFIG_FILE, 'utf-8')
    const config: AppConfig = JSON.parse(data)

    // Resolve env variables in adminPassword
    if (config.security.adminPassword.startsWith('env:')) {
      const envVar = config.security.adminPassword.replace('env:', '')
      config.security.adminPassword = process.env[envVar] || 'kn2025analytics'
    }

    return config
  } catch (error) {
    console.error('Failed to load config, using defaults:', error)
    return getDefaultConfig()
  }
}

/**
 * Save configuration to config.json
 * Performs atomic write (temp file + rename)
 */
export async function saveConfig(config: AppConfig): Promise<void> {
  const tempFile = `${CONFIG_FILE}.tmp`

  try {
    // Validate config before saving
    validateConfig(config)

    // Write to temp file
    await fs.writeFile(tempFile, JSON.stringify(config, null, 2), 'utf-8')

    // Atomic rename
    await fs.rename(tempFile, CONFIG_FILE)
  } catch (error) {
    // Clean up temp file if it exists
    try {
      await fs.unlink(tempFile)
    } catch {}

    throw error
  }
}

/**
 * Get default configuration
 */
export function getDefaultConfig(): AppConfig {
  return {
    version: '1.0',
    whiteLabel: {
      contestPrize: '',
      doiUrl: '',
      actionStart: new Date().toISOString(),
      actionEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      moderationEnabled: true,
      formalAddress: false,
      metaTitle: 'Meine KN-Titelseite - Bring dein Selfie auf die Titelseite',
      metaDescription: 'Erstelle deine personalisierte Kieler Nachrichten Titelseite! Lade ein Selfie hoch und werde Teil der KN.',
      socialShareImage: '/assets/share-image.jpg'
    },
    security: {
      doiSecret: crypto.randomBytes(32).toString('hex'),
      adminPassword: 'env:ANALYTICS_PASSWORD'
    }
  }
}

/**
 * Ensure config.json exists, create with defaults if not
 */
export async function ensureConfigExists(): Promise<void> {
  try {
    await fs.access(CONFIG_FILE)
  } catch {
    console.log('Creating default config.json')
    const defaultConfig = getDefaultConfig()
    await saveConfig(defaultConfig)
  }
}

/**
 * Validate configuration schema
 */
export function validateConfig(config: AppConfig): void {
  if (!config.version) {
    throw new Error('Config version is required')
  }

  if (!config.whiteLabel) {
    throw new Error('whiteLabel section is required')
  }

  if (!config.security) {
    throw new Error('security section is required')
  }

  // Validate date strings
  const start = new Date(config.whiteLabel.actionStart)
  const end = new Date(config.whiteLabel.actionEnd)

  if (isNaN(start.getTime())) {
    throw new Error('Invalid actionStart date')
  }

  if (isNaN(end.getTime())) {
    throw new Error('Invalid actionEnd date')
  }

  if (start >= end) {
    throw new Error('actionStart must be before actionEnd')
  }

  // Validate DOI secret
  if (!config.security.doiSecret || config.security.doiSecret.length < 16) {
    throw new Error('doiSecret must be at least 16 characters')
  }
}

/**
 * Get public-facing configuration (without secrets)
 */
export function getPublicConfig(config: AppConfig): Omit<AppConfig, 'security'> {
  return {
    version: config.version,
    whiteLabel: config.whiteLabel
  }
}

/**
 * Check if action is currently active based on dates
 */
export function isActionActive(config: AppConfig): boolean {
  const now = Date.now()
  const start = new Date(config.whiteLabel.actionStart).getTime()
  const end = new Date(config.whiteLabel.actionEnd).getTime()

  return now >= start && now <= end
}
