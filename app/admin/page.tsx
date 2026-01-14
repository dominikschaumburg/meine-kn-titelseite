'use client'

import { useState, useEffect } from 'react'

interface Analytics {
  pageViews: number
  photoUploads: number
  doiCompletions: number
  moderationPassed: number
  moderationFlagged: number
  interactions: number
  lastUpdated: string
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-2">
          Zuletzt aktualisiert: {new Date(analytics.lastUpdated).toLocaleString('de-DE')}
        </p>
      </div>

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
