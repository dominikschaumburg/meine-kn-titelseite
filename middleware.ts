import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Configuration for overload protection
// Note: Memory monitoring is done in API routes, not in Edge Runtime middleware
const MAX_REQUESTS_PER_MINUTE = parseInt(process.env.MAX_REQUESTS_PER_MINUTE || '1000')

// Simple in-memory request counter (resets on server restart)
let requestCounts: { [key: string]: number } = {}
let lastReset = Date.now()

function checkServerLoad(): { isOverloaded: boolean; reason?: string } {
  // Check request rate (Edge Runtime compatible)
  const now = Date.now()
  const minuteKey = Math.floor(now / 60000).toString()

  // Reset counter every minute
  if (now - lastReset > 60000) {
    requestCounts = {}
    lastReset = now
  }

  requestCounts[minuteKey] = (requestCounts[minuteKey] || 0) + 1

  if (requestCounts[minuteKey] > MAX_REQUESTS_PER_MINUTE) {
    return { isOverloaded: true, reason: 'High request rate' }
  }

  return { isOverloaded: false }
}

export function middleware(request: NextRequest) {
  // Skip checks for static files and API routes that don't need protection
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/assets') ||
    request.nextUrl.pathname === '/favicon.ico' ||
    request.nextUrl.pathname.startsWith('/api/analytics') // Allow analytics even during overload
  ) {
    return NextResponse.next()
  }

  // Check if server is overloaded
  const loadCheck = checkServerLoad()

  if (loadCheck.isOverloaded) {
    console.error(`Server overload detected: ${loadCheck.reason}`)

    // For API routes, return 503 Service Unavailable
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Server temporarily overloaded. Please try again later.' },
        { status: 503, headers: { 'Retry-After': '60' } }
      )
    }

    // For page requests, redirect to overload page
    const url = request.nextUrl.clone()
    url.pathname = '/overload'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
