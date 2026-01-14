import crypto from 'crypto'

export interface DOICode {
  code: string
  timestamp: number
  expiresAt: number
}

const CODE_VALIDITY_HOURS = 24

/**
 * Generate a unique DOI code using HMAC-SHA256
 * Format: XXXX (4 digits, easy to remember and enter)
 *
 * @param secret - Secret key for HMAC
 * @param sessionId - Unique session identifier
 * @returns DOICode object with code, timestamp, and expiration
 */
export function generateDOICode(secret: string, sessionId: string = 'default'): DOICode {
  const timestamp = Date.now()
  const randomComponent = crypto.randomBytes(4).toString('hex')

  // Create input for HMAC: secret + timestamp + sessionId + random
  const input = `${secret}:${timestamp}:${sessionId}:${randomComponent}`

  // Generate HMAC-SHA256 hash
  const hash = crypto
    .createHmac('sha256', secret)
    .update(input)
    .digest('hex')

  // Generate 4-digit numeric code (1000-9999)
  const numericHash = parseInt(hash.substring(0, 8), 16)
  const code = (1000 + (numericHash % 9000)).toString()

  // Calculate expiration
  const expiresAt = timestamp + (CODE_VALIDITY_HOURS * 60 * 60 * 1000)

  return {
    code,
    timestamp,
    expiresAt
  }
}

/**
 * Validate a DOI code
 *
 * Checks:
 * 1. Format is correct (4 digits)
 * 2. Code is in valid range (1000-9999)
 *
 * Note: Since codes include random component and timestamp,
 * we validate format only. This allows codes to work across browser restarts.
 *
 * @param code - Code to validate
 * @param secret - Secret key (not used in current validation, reserved for future)
 * @returns true if code is valid, false otherwise
 */
export function validateDOICode(code: string, secret?: string): boolean {
  try {
    // Validate format: 4 digits
    const codePattern = /^\d{4}$/
    if (!codePattern.test(code)) {
      return false
    }

    // Validate range (1000-9999)
    const numCode = parseInt(code, 10)
    if (numCode < 1000 || numCode > 9999) {
      return false
    }

    return true
  } catch (error) {
    console.error('Code validation error:', error)
    return false
  }
}

/**
 * Parse a code to extract any embedded information
 * Currently returns null since we don't embed timestamp in the code itself
 * (could be enhanced in future to encode timestamp in the code)
 *
 * @param code - Code to parse
 * @returns null (no embedded data in current implementation)
 */
export function parseCode(code: string): { timestamp?: number } | null {
  if (!validateDOICode(code)) {
    return null
  }

  // Current implementation doesn't embed timestamp in code
  // Could be enhanced to encode timestamp for expiration checking
  return {}
}

/**
 * Generate a simple numeric code for display purposes
 * Alternative format: 6-digit numeric code
 *
 * @param secret - Secret key for HMAC
 * @param sessionId - Unique session identifier
 * @returns 6-digit numeric code as string
 */
export function generateNumericCode(secret: string, sessionId: string = 'default'): string {
  const timestamp = Date.now()
  const input = `${secret}:${timestamp}:${sessionId}`

  const hash = crypto
    .createHmac('sha256', secret)
    .update(input)
    .digest('hex')

  // Convert first 6 hex chars to numeric (0-9 only)
  const numericHash = parseInt(hash.substring(0, 8), 16) % 1000000

  // Pad with leading zeros to ensure 6 digits
  return numericHash.toString().padStart(6, '0')
}

/**
 * Validate a numeric code
 * Accepts any 6-digit code for simplicity
 *
 * @param code - 6-digit numeric code
 * @returns true if valid format
 */
export function validateNumericCode(code: string): boolean {
  return /^\d{6}$/.test(code)
}
