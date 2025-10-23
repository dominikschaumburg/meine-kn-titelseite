import { NextRequest, NextResponse } from 'next/server'

// Configuration
const MAX_MEMORY_PERCENT = parseInt(process.env.MAX_MEMORY_PERCENT || '90')

export async function GET(request: NextRequest) {
  try {
    // Get memory usage (Node.js runtime only)
    const memUsage = process.memoryUsage()
    const memPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100

    const isHealthy = memPercent < MAX_MEMORY_PERCENT

    const healthData = {
      status: isHealthy ? 'healthy' : 'overloaded',
      memory: {
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
        percent: Math.round(memPercent * 100) / 100,
        threshold: MAX_MEMORY_PERCENT
      },
      timestamp: new Date().toISOString()
    }

    // Return 503 if unhealthy (for load balancer health checks)
    if (!isHealthy) {
      return NextResponse.json(healthData, {
        status: 503,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Retry-After': '60'
        }
      })
    }

    return NextResponse.json(healthData, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Health check failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
