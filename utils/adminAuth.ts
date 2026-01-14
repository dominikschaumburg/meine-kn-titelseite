/**
 * Server-side admin authentication utilities
 */

export function validateAdminPassword(password: string): boolean {
  const expectedPassword = process.env.ANALYTICS_PASSWORD || 'kn2025analytics'
  return password === expectedPassword
}

export function getAdminPassword(): string {
  return process.env.ANALYTICS_PASSWORD || 'kn2025analytics'
}
