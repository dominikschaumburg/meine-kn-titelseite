'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/admin/AuthProvider'
import { WhiteLabelConfig } from '@/lib/config'

export default function SettingsPage() {
  const { password } = useAuth()
  const [config, setConfig] = useState<WhiteLabelConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/config')
      const data = await response.json()
      setConfig(data.whiteLabel)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch config:', error)
      setMessage({ type: 'error', text: 'Fehler beim Laden der Konfiguration' })
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!config) return

    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${password}`
        },
        body: JSON.stringify({ whiteLabel: config })
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Einstellungen erfolgreich gespeichert' })
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.error || 'Fehler beim Speichern' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Netzwerkfehler beim Speichern' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-gray-600">Lade Einstellungen...</div>
  }

  if (!config) {
    return <div className="text-red-600">Fehler beim Laden der Einstellungen</div>
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Einstellungen</h1>
        <p className="text-gray-500 mt-2">White-Label-Konfiguration für die Aktion</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 space-y-6">
          {/* Contest Prize */}
          <div>
            <label htmlFor="contestPrize" className="block text-sm font-medium text-gray-700 mb-2">
              Gewinnspiel-Preis (optional)
            </label>
            <textarea
              id="contestPrize"
              value={config.contestPrize}
              onChange={(e) => setConfig({ ...config, contestPrize: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="z.B. Ein iPad Pro im Wert von 1.000€"
            />
            <p className="text-sm text-gray-500 mt-1">
              Leer lassen, um keinen Preis anzuzeigen
            </p>
          </div>

          {/* DOI URL */}
          <div>
            <label htmlFor="doiUrl" className="block text-sm font-medium text-gray-700 mb-2">
              DOI/Gewinnspiel-URL (optional)
            </label>
            <input
              type="url"
              id="doiUrl"
              value={config.doiUrl}
              onChange={(e) => setConfig({ ...config, doiUrl: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://..."
            />
            <p className="text-sm text-gray-500 mt-1">
              Leer lassen = Code-basierte Verifikation ohne externe URL
            </p>
          </div>

          {/* Action Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="actionStart" className="block text-sm font-medium text-gray-700 mb-2">
                Aktionsstart
              </label>
              <input
                type="datetime-local"
                id="actionStart"
                value={config.actionStart.slice(0, 16)}
                onChange={(e) => setConfig({ ...config, actionStart: new Date(e.target.value).toISOString() })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="actionEnd" className="block text-sm font-medium text-gray-700 mb-2">
                Aktionsende
              </label>
              <input
                type="datetime-local"
                id="actionEnd"
                value={config.actionEnd.slice(0, 16)}
                onChange={(e) => setConfig({ ...config, actionEnd: new Date(e.target.value).toISOString() })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Moderation Toggle */}
          <div className="flex items-center justify-between py-3">
            <div>
              <label htmlFor="moderationEnabled" className="block text-sm font-medium text-gray-700">
                Content-Moderation
              </label>
              <p className="text-sm text-gray-500 mt-1">
                Aktiviert OpenAI-basierte Bild-Moderation
              </p>
            </div>
            <button
              type="button"
              onClick={() => setConfig({ ...config, moderationEnabled: !config.moderationEnabled })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.moderationEnabled ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config.moderationEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Formal Address Dropdown */}
          <div>
            <label htmlFor="formalAddress" className="block text-sm font-medium text-gray-700 mb-2">
              Ansprache
            </label>
            <select
              id="formalAddress"
              value={config.formalAddress ? 'sie' : 'du'}
              onChange={(e) => setConfig({ ...config, formalAddress: e.target.value === 'sie' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="du">Informell (Du)</option>
              <option value="sie">Formell (Sie)</option>
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Bestimmt die Ansprache im gesamten Frontend
            </p>
          </div>

          {/* Meta Title */}
          <div>
            <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700 mb-2">
              Meta-Titel
            </label>
            <input
              type="text"
              id="metaTitle"
              value={config.metaTitle || ''}
              onChange={(e) => setConfig({ ...config, metaTitle: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Meine Titelseite"
            />
            <p className="text-sm text-gray-500 mt-1">
              Titel für Browser-Tab und Suchmaschinen
            </p>
          </div>

          {/* Meta Description */}
          <div>
            <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 mb-2">
              Meta-Beschreibung
            </label>
            <textarea
              id="metaDescription"
              value={config.metaDescription || ''}
              onChange={(e) => setConfig({ ...config, metaDescription: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Erstelle deine personalisierte Titelseite"
            />
            <p className="text-sm text-gray-500 mt-1">
              Beschreibung für Suchmaschinen und Social Media (max. 160 Zeichen)
            </p>
          </div>

          {/* Social Share Image */}
          <div>
            <label htmlFor="socialShareImage" className="block text-sm font-medium text-gray-700 mb-2">
              Social Share Bild
            </label>
            <input
              type="text"
              id="socialShareImage"
              value={config.socialShareImage || ''}
              onChange={(e) => setConfig({ ...config, socialShareImage: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="/assets/share-image.jpg"
            />
            <p className="text-sm text-gray-500 mt-1">
              Bild das beim Teilen auf Social Media angezeigt wird (empfohlen: 1200x630px)
            </p>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`p-4 rounded-lg ${
                message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Speichere...' : 'Einstellungen speichern'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
