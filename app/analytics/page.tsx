'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface AnalyticsData {
  pageViews: number
  photoUploads: number
  doiCompletions: number
  moderationPassed: number
  moderationFlagged: number
  howItWorksClicks: number
  directContestClicks: number
  imageDownloads: number
  imageShares: number
  lastUpdated: string
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    // Check if already authenticated (check both sessionStorage and localStorage)
    const sessionAuth = sessionStorage.getItem('analytics_auth')
    const localAuth = localStorage.getItem('analytics_auth')
    const savedPassword = localStorage.getItem('analytics_password')

    if (sessionAuth === 'true' || localAuth === 'true') {
      setIsAuthenticated(true)
      if (savedPassword) {
        setPassword(savedPassword)
      }
      fetchAnalytics()
      const interval = setInterval(fetchAnalytics, 10000)
      return () => clearInterval(interval)
    } else {
      // Try to restore password if saved
      if (savedPassword) {
        setPassword(savedPassword)
      }
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
      // Save to both sessionStorage and localStorage for persistence
      sessionStorage.setItem('analytics_auth', 'true')
      localStorage.setItem('analytics_auth', 'true')
      localStorage.setItem('analytics_password', password)
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
      <div className="flex-1 py-4 md:py-8 px-3 md:px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-3 md:mb-4">
            <Link href="/" className="text-kn-blue hover:underline text-sm md:text-base">
              ← Zurück
            </Link>
            <button
              onClick={handleReset}
              className="bg-kn-red text-white py-1.5 px-3 md:py-2 md:px-4 rounded-kn font-medium text-xs md:text-sm transition-colors"
            >
              Reset
            </button>
          </div>

          <h1 className="text-xl md:text-3xl font-bold text-kn-dark mb-4 md:mb-8">Analytics</h1>

          <div className="grid grid-cols-3 gap-2 md:gap-4 mb-4 md:mb-8">
            <div className="bg-red-50 rounded-lg p-2 md:p-4 border-2 border-red-500">
              <h2 className="text-xs md:text-sm font-semibold text-kn-dark mb-1 uppercase">Aufrufe</h2>
              <p className="text-xl md:text-3xl font-bold text-red-500">{analytics.pageViews.toLocaleString()}</p>
            </div>

            <div className="bg-orange-50 rounded-lg p-2 md:p-4 border-2 border-orange-500">
              <h2 className="text-xs md:text-sm font-semibold text-kn-dark mb-1 uppercase">Uploads</h2>
              <p className="text-xl md:text-3xl font-bold text-orange-500">{analytics.photoUploads.toLocaleString()}</p>
              <p className="text-xs text-gray-600 mt-1">{conversionRate}%</p>
            </div>

            <div className="bg-green-50 rounded-lg p-2 md:p-4 border-2 border-green-600">
              <h2 className="text-xs md:text-sm font-semibold text-kn-dark mb-1 uppercase">DOI</h2>
              <p className="text-xl md:text-3xl font-bold text-green-600">{analytics.doiCompletions.toLocaleString()}</p>
              <p className="text-xs text-gray-600 mt-1">{completionRate}%</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 md:p-6 mb-4 md:mb-8">
            <h2 className="text-base md:text-xl font-bold text-kn-dark mb-3 md:mb-4">Moderation</h2>
            <div className="grid grid-cols-2 gap-2 md:gap-4">
              <div className="bg-green-100 rounded-lg p-2 md:p-4 border-2 border-green-600">
                <h3 className="text-xs md:text-sm font-semibold text-kn-dark mb-1 uppercase">Bestanden</h3>
                <p className="text-xl md:text-3xl font-bold text-green-600">{moderationPassed.toLocaleString()}</p>
                <p className="text-xs text-gray-600 mt-1">{moderationPassRate}%</p>
              </div>

              <div className="bg-red-100 rounded-lg p-2 md:p-4 border-2 border-kn-red">
                <h3 className="text-xs md:text-sm font-semibold text-kn-dark mb-1 uppercase">Geflaggt</h3>
                <p className="text-xl md:text-3xl font-bold text-kn-red">{moderationFlagged.toLocaleString()}</p>
                <p className="text-xs text-gray-600 mt-1">{moderationFlagRate}%</p>
              </div>
            </div>
            <p className="text-xs md:text-sm text-gray-600 mt-2 md:mt-4">
              Gesamt: {totalModerated.toLocaleString()}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 md:p-6 mb-4 md:mb-8">
            <h2 className="text-base md:text-xl font-bold text-kn-dark mb-3 md:mb-4">Interaktionen</h2>
            <div className="grid grid-cols-2 gap-2 md:gap-4">
              <div className="bg-blue-50 rounded-lg p-2 md:p-4 border-2 border-blue-500">
                <h3 className="text-xs md:text-sm font-semibold text-kn-dark mb-1 uppercase">Anleitung</h3>
                <p className="text-xl md:text-3xl font-bold text-blue-500">{(analytics.howItWorksClicks || 0).toLocaleString()}</p>
              </div>

              <div className="bg-purple-50 rounded-lg p-2 md:p-4 border-2 border-purple-500">
                <h3 className="text-xs md:text-sm font-semibold text-kn-dark mb-1 uppercase">Direkt Gewinnspiel</h3>
                <p className="text-xl md:text-3xl font-bold text-purple-500">{(analytics.directContestClicks || 0).toLocaleString()}</p>
              </div>

              <div className="bg-teal-50 rounded-lg p-2 md:p-4 border-2 border-teal-500">
                <h3 className="text-xs md:text-sm font-semibold text-kn-dark mb-1 uppercase">Downloads</h3>
                <p className="text-xl md:text-3xl font-bold text-teal-500">{(analytics.imageDownloads || 0).toLocaleString()}</p>
              </div>

              <div className="bg-pink-50 rounded-lg p-2 md:p-4 border-2 border-pink-500">
                <h3 className="text-xs md:text-sm font-semibold text-kn-dark mb-1 uppercase">Shares</h3>
                <p className="text-xl md:text-3xl font-bold text-pink-500">{(analytics.imageShares || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 md:p-6">
            <h2 className="text-base md:text-xl font-bold text-kn-dark mb-3 md:mb-4">Funnel</h2>
            <div className="space-y-3 md:space-y-4">
              <div>
                <div className="flex justify-between mb-1 md:mb-2">
                  <span className="text-xs md:text-sm font-semibold">1. Seitenaufruf</span>
                  <span className="text-xs md:text-sm">{analytics.pageViews} (100%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 md:h-4">
                  <div className="bg-red-500 h-3 md:h-4 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1 md:mb-2">
                  <span className="text-xs md:text-sm font-semibold">2. Foto Upload</span>
                  <span className="text-xs md:text-sm">{analytics.photoUploads} ({conversionRate}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 md:h-4">
                  <div className="bg-orange-500 h-3 md:h-4 rounded-full" style={{ width: `${conversionRate}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1 md:mb-2">
                  <span className="text-xs md:text-sm font-semibold">3. DOI Abschluss</span>
                  <span className="text-xs md:text-sm">{analytics.doiCompletions} ({completionRate}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 md:h-4">
                  <div className="bg-green-600 h-3 md:h-4 rounded-full" style={{ width: `${completionRate}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 md:mt-6 text-xs md:text-sm text-gray-600">
            <p>Update: {new Date(analytics.lastUpdated).toLocaleString('de-DE')}</p>
            <p className="mt-1 md:mt-2">Auto-refresh alle 10 Sek.</p>
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
