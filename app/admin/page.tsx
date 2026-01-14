'use client'

import { useState, useEffect } from 'react'

interface AnalyticsEvent {
  type: string
  timestamp: string
}

interface Analytics {
  pageViews: number
  photoUploads: number
  doiCompletions: number
  moderationPassed: number
  moderationFlagged: number
  interactions: number
  lastUpdated: string
  events: AnalyticsEvent[]
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [resetting, setResetting] = useState(false)

  useEffect(() => {
    fetchAnalytics()
    const interval = setInterval(fetchAnalytics, 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics')
      const data = await response.json()
      setAnalytics(data)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
      setLoading(false)
    }
  }

  const resetAnalytics = async () => {
    if (!confirm('Möchten Sie wirklich alle Analytics-Daten zurücksetzen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
      return
    }

    setResetting(true)
    try {
      const password = localStorage.getItem('admin_password')
      const response = await fetch('/api/analytics/reset', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${password}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        await fetchAnalytics()
        alert('Analytics erfolgreich zurückgesetzt!')
      } else {
        alert('Fehler beim Zurücksetzen der Analytics')
      }
    } catch (error) {
      console.error('Failed to reset analytics:', error)
      alert('Fehler beim Zurücksetzen der Analytics')
    } finally {
      setResetting(false)
    }
  }

  const getHourlyData = () => {
    if (!analytics || !analytics.events) return []

    const now = Date.now()
    const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000)

    // Filter last 7 days page views
    const pageViewEvents = analytics.events.filter(e =>
      e.type === 'pageView' && new Date(e.timestamp).getTime() > sevenDaysAgo
    )

    // Group by hour
    const hourlyMap: Record<string, number> = {}
    pageViewEvents.forEach(event => {
      const date = new Date(event.timestamp)
      const hourKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:00`
      hourlyMap[hourKey] = (hourlyMap[hourKey] || 0) + 1
    })

    return Object.entries(hourlyMap)
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => a.hour.localeCompare(b.hour))
  }

  const getDailyData = () => {
    if (!analytics || !analytics.events) return []

    const now = Date.now()
    const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000)

    // Filter last 7 days page views
    const pageViewEvents = analytics.events.filter(e =>
      e.type === 'pageView' && new Date(e.timestamp).getTime() > sevenDaysAgo
    )

    // Group by day
    const dailyMap: Record<string, number> = {}
    pageViewEvents.forEach(event => {
      const date = new Date(event.timestamp)
      const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      dailyMap[dayKey] = (dailyMap[dayKey] || 0) + 1
    })

    // Ensure all 7 days are present
    const result = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now - (i * 24 * 60 * 60 * 1000))
      const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      const dayLabel = date.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' })
      result.push({ day: dayLabel, count: dailyMap[dayKey] || 0 })
    }

    return result
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Lade Statistiken...</div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600">Fehler beim Laden der Statistiken</div>
      </div>
    )
  }

  const metrics = [
    { label: 'Seitenaufrufe', value: analytics.pageViews, color: 'blue' },
    { label: 'Foto-Uploads', value: analytics.photoUploads, color: 'green' },
    { label: 'DOI-Abschlüsse', value: analytics.doiCompletions, color: 'purple' },
    { label: 'Interaktionen', value: analytics.interactions, color: 'indigo', tooltip: 'Download oder Share des finalen Bildes' },
  ]

  const moderationMetrics = [
    { label: 'Moderation: Akzeptiert', value: analytics.moderationPassed, color: 'green' },
    { label: 'Moderation: Abgelehnt', value: analytics.moderationFlagged, color: 'red' },
  ]

  const hourlyData = getHourlyData()
  const dailyData = getDailyData()
  const maxDaily = Math.max(...dailyData.map(d => d.count), 1)

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-2">
            Zuletzt aktualisiert: {new Date(analytics.lastUpdated).toLocaleString('de-DE')}
          </p>
        </div>
        <button
          onClick={resetAnalytics}
          disabled={resetting}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          {resetting ? 'Zurücksetzen...' : 'Analytics zurücksetzen'}
        </button>
      </div>

      {/* Daily Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Seitenaufrufe (Letzte 7 Tage)</h2>
        <div className="flex items-end gap-2 h-48">
          {dailyData.map((day, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div className="flex-1 flex items-end w-full">
                <div
                  className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                  style={{ height: `${(day.count / maxDaily) * 100}%` }}
                  title={`${day.day}: ${day.count} Aufrufe`}
                />
              </div>
              <div className="mt-2 text-xs text-gray-600 text-center">{day.day}</div>
              <div className="text-xs font-semibold text-gray-900">{day.count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Hourly Stats */}
      {hourlyData.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Stündliche Aufrufe (Letzte 7 Tage)</h2>
          <div className="max-h-64 overflow-y-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Zeitpunkt</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Aufrufe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {hourlyData.slice(-24).map((data, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2 text-sm text-gray-900">{data.hour}</td>
                    <td className="px-4 py-2 text-sm text-gray-900 text-right font-medium">{data.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric) => (
          <div key={metric.label} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-sm text-gray-600">{metric.label}</p>
              {metric.tooltip && (
                <button
                  type="button"
                  className="inline-flex items-center justify-center w-4 h-4 text-xs text-gray-500 border border-gray-300 rounded-full cursor-help hover:bg-gray-100"
                  title={metric.tooltip}
                  aria-label={metric.tooltip}
                >
                  ?
                </button>
              )}
            </div>
            <p className="text-3xl font-semibold text-gray-900">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Content-Moderation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {moderationMetrics.map((metric) => (
            <div key={metric.label}>
              <p className="text-sm text-gray-600 mb-2">{metric.label}</p>
              <p className="text-2xl font-semibold text-gray-900">{metric.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Conversion-Funnel</h2>
        <div className="space-y-3">
          {analytics.pageViews > 0 && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Seitenaufrufe</span>
                <span className="font-semibold">{analytics.pageViews}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700 ml-4">→ Foto-Uploads</span>
                <span className="font-semibold">
                  {analytics.photoUploads} ({Math.round((analytics.photoUploads / analytics.pageViews) * 100)}%)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700 ml-8">→ DOI-Abschlüsse</span>
                <span className="font-semibold">
                  {analytics.doiCompletions} ({analytics.photoUploads > 0 ? Math.round((analytics.doiCompletions / analytics.photoUploads) * 100) : 0}%)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700 ml-12">→ Interaktionen</span>
                <span className="font-semibold">
                  {analytics.interactions} ({analytics.doiCompletions > 0 ? Math.round((analytics.interactions / analytics.doiCompletions) * 100) : 0}%)
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
