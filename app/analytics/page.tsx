'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface AnalyticsData {
  pageViews: number
  photoUploads: number
  doiCompletions: number
  moderationPassed: number
  moderationFlagged: number
  lastUpdated: string
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    // Check if already authenticated
    const auth = sessionStorage.getItem('analytics_auth')
    if (auth === 'true') {
      setIsAuthenticated(true)
      fetchAnalytics()
      const interval = setInterval(fetchAnalytics, 10000)
      return () => clearInterval(interval)
    } else {
      setLoading(false)
    }
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Simple password check (in production, this should be server-side)
    const response = await fetch('/api/analytics/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    })

    if (response.ok) {
      sessionStorage.setItem('analytics_auth', 'true')
      setIsAuthenticated(true)
      setError('')
      fetchAnalytics()
      const interval = setInterval(fetchAnalytics, 10000)
    } else {
      setError('Falsches Passwort')
    }
  }

  const handleReset = async () => {
    if (!confirm('Möchten Sie wirklich alle Analytics-Daten zurücksetzen?')) {
      return
    }

    try {
      const response = await fetch('/api/analytics/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })

      if (response.ok) {
        fetchAnalytics()
      }
    } catch (error) {
      console.error('Failed to reset analytics:', error)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="max-w-md w-full p-8">
          <h1 className="text-3xl font-bold text-kn-dark mb-6 text-center">Analytics Dashboard</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-kn-dark mb-2">
                Passwort:
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-kn focus:outline-none focus:ring-2 focus:ring-kn-blue"
                placeholder="Passwort eingeben"
                required
              />
            </div>
            {error && (
              <div className="bg-kn-red/10 border border-kn-red text-kn-red p-3 rounded-kn text-sm">
                {error}
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-kn-blue text-white py-3 px-6 rounded-kn font-medium transition-colors"
            >
              Anmelden
            </button>
          </form>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-kn-dark">Lädt Analytics...</p>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-kn-red">Fehler beim Laden der Analytics</p>
      </div>
    )
  }

  const conversionRate = analytics.pageViews > 0
    ? ((analytics.photoUploads / analytics.pageViews) * 100).toFixed(2)
    : '0.00'

  const completionRate = analytics.photoUploads > 0
    ? ((analytics.doiCompletions / analytics.photoUploads) * 100).toFixed(2)
    : '0.00'

  const moderationPassed = analytics.moderationPassed || 0
  const moderationFlagged = analytics.moderationFlagged || 0
  const totalModerated = moderationPassed + moderationFlagged
  const moderationPassRate = totalModerated > 0
    ? ((moderationPassed / totalModerated) * 100).toFixed(2)
    : '0.00'

  const moderationFlagRate = totalModerated > 0
    ? ((moderationFlagged / totalModerated) * 100).toFixed(2)
    : '0.00'

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <Link href="/" className="text-kn-blue hover:underline">
              ← Zurück zur Hauptseite
            </Link>
            <button
              onClick={handleReset}
              className="bg-kn-red text-white py-2 px-4 rounded-kn font-medium text-sm transition-colors"
            >
              Statistiken zurücksetzen
            </button>
          </div>

          <h1 className="text-3xl font-bold text-kn-dark mb-8">Analytics Dashboard</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 rounded-lg p-6 border-2 border-kn-blue">
              <h2 className="text-sm font-semibold text-kn-dark mb-2 uppercase">Seitenaufrufe</h2>
              <p className="text-4xl font-bold text-kn-blue">{analytics.pageViews.toLocaleString()}</p>
            </div>

            <div className="bg-green-50 rounded-lg p-6 border-2 border-kn-green">
              <h2 className="text-sm font-semibold text-kn-dark mb-2 uppercase">Foto Uploads</h2>
              <p className="text-4xl font-bold text-kn-green">{analytics.photoUploads.toLocaleString()}</p>
              <p className="text-sm text-gray-600 mt-2">Conversion: {conversionRate}%</p>
            </div>

            <div className="bg-purple-50 rounded-lg p-6 border-2 border-purple-600">
              <h2 className="text-sm font-semibold text-kn-dark mb-2 uppercase">DOI Abschlüsse</h2>
              <p className="text-4xl font-bold text-purple-600">{analytics.doiCompletions.toLocaleString()}</p>
              <p className="text-sm text-gray-600 mt-2">Completion: {completionRate}%</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-kn-dark mb-4">Moderation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-100 rounded-lg p-4 border-2 border-green-600">
                <h3 className="text-sm font-semibold text-kn-dark mb-2 uppercase">Bestanden</h3>
                <p className="text-3xl font-bold text-green-600">{moderationPassed.toLocaleString()}</p>
                <p className="text-sm text-gray-600 mt-2">{moderationPassRate}% der moderierten Fotos</p>
              </div>

              <div className="bg-red-100 rounded-lg p-4 border-2 border-kn-red">
                <h3 className="text-sm font-semibold text-kn-dark mb-2 uppercase">Geflaggt</h3>
                <p className="text-3xl font-bold text-kn-red">{moderationFlagged.toLocaleString()}</p>
                <p className="text-sm text-gray-600 mt-2">{moderationFlagRate}% der moderierten Fotos</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              Gesamt moderierte Fotos: {totalModerated.toLocaleString()}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-bold text-kn-dark mb-4">Funnel-Übersicht</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold">1. Seitenaufruf</span>
                  <span className="text-sm">{analytics.pageViews} (100%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div className="bg-kn-blue h-4 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold">2. Foto Upload</span>
                  <span className="text-sm">{analytics.photoUploads} ({conversionRate}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div className="bg-kn-green h-4 rounded-full" style={{ width: `${conversionRate}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold">3. DOI Abschluss</span>
                  <span className="text-sm">{analytics.doiCompletions} ({completionRate}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div className="bg-purple-600 h-4 rounded-full" style={{ width: `${completionRate}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-sm text-gray-600">
            <p>Letzte Aktualisierung: {new Date(analytics.lastUpdated).toLocaleString('de-DE')}</p>
            <p className="mt-2">Diese Seite aktualisiert sich automatisch alle 10 Sekunden.</p>
          </div>
        </div>
      </div>

      <footer className="bg-kn-dark text-white py-4 px-4 text-center mt-8">
        <div className="text-xs space-x-4">
          <a href="/agb" className="hover:text-kn-light transition-colors">AGB</a>
          <span>|</span>
          <a href="/datenschutz" className="hover:text-kn-light transition-colors">Datenschutz</a>
          <span>|</span>
          <a href="/impressum" className="hover:text-kn-light transition-colors">Impressum</a>
        </div>
      </footer>
    </div>
  )
}
