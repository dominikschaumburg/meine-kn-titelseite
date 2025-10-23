'use client'

import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  // Check if it's a server overload error
  const isOverload = error.message?.includes('overload') || error.message?.includes('capacity')

  if (isOverload) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* Header */}
        <header className="py-6 px-4">
          <div className="w-full max-w-sm mx-auto md:max-w-xs flex justify-center">
            <Link href="https://www.kn-online.de/" target="_blank" rel="noopener noreferrer">
              <img
                src="/assets/logos/KN_Schriftzug_Digital_Farbig.svg"
                alt="KN Logo"
                width="320"
                height="80"
                className="max-w-full h-auto"
              />
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 pb-4">
          <div className="max-w-md mx-auto text-center space-y-6">
            <div className="text-8xl mb-4">😢</div>

            <h1 className="text-3xl md:text-4xl font-bold text-kn-dark">
              Das waren zu viele Selfies!
            </h1>

            <p className="text-lg text-kn-dark/80">
              Unser Server ist gerade überlastet. Zu viele KN-Fans wollen gleichzeitig ihre persönliche Titelseite erstellen.
            </p>

            <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg">
              <p className="text-sm">
                <strong>💡 Kein Problem:</strong> Du kannst trotzdem am Gewinnspiel teilnehmen und später nochmal vorbeischauen!
              </p>
            </div>

            <div className="flex flex-col space-y-3 w-full pt-4">
              <a
                href="https://aktion.kn-online.de/angebot/o7bl6/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-kn-blue text-white py-4 px-6 rounded-kn text-lg font-medium text-center transition-colors block hover:bg-kn-dark"
              >
                🎁 Jetzt am Gewinnspiel teilnehmen
              </a>

              <button
                onClick={reset}
                className="w-full bg-gray-500 text-white py-4 px-6 rounded-kn text-lg font-medium transition-colors hover:bg-gray-600"
              >
                🔄 Nochmal versuchen
              </button>
            </div>

            <p className="text-sm text-gray-600 pt-4">
              Versuche es in ein paar Minuten erneut. Wir arbeiten daran, allen KN-Fans eine tolle Titelseite zu ermöglichen!
            </p>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-kn-dark text-white py-4 px-4 text-center">
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

  // Generic error fallback
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="max-w-md mx-auto text-center space-y-4">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-kn-dark">Ein Fehler ist aufgetreten</h1>
        <p className="text-gray-600">Entschuldigung, etwas ist schiefgelaufen.</p>
        <button
          onClick={reset}
          className="bg-kn-blue text-white py-3 px-6 rounded-kn font-medium transition-colors hover:bg-kn-dark"
        >
          Nochmal versuchen
        </button>
      </div>
    </div>
  )
}
