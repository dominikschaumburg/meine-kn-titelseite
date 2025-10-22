import Link from 'next/link'

export default function Impressum() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="text-kn-blue hover:underline mb-4 inline-block">
            ← Zurück zur Hauptseite
          </Link>

          <h1 className="text-3xl font-bold text-kn-dark mb-8">Impressum</h1>

          <div className="bg-white rounded-lg p-6">
            <h2 className="text-xl font-bold text-kn-dark mb-4">Angaben gemäß § 5 TMG</h2>

            <div className="mb-6">
              <p>
                <strong>Kieler Zeitung Verlags- und Druckerei KG-GmbH & Co.</strong><br/>
                Fleethörn 1/7<br/>
                24103 Kiel
              </p>
            </div>

            <div className="mb-6">
              <p>
                <strong>Telefon:</strong> 0800 / 1234 901 (kostenlos)<br/>
                <strong>E-Mail:</strong> <a href="mailto:vertrieb@kieler-nachrichten.de" className="text-kn-blue hover:underline">vertrieb@kieler-nachrichten.de</a>
              </p>
              <p className="mt-2 text-sm text-gray-600">
                <strong>Servicezeiten:</strong><br/>
                Mo – Fr: 09:00 – 18:00 Uhr<br/>
                Sa: 08:00 – 12:00 Uhr
              </p>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">Online-Streitbeilegung</h3>
              <p className="text-sm">
                Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:<br/>
                <a href="https://ec.europa.eu/consumers/odr" className="text-kn-blue hover:underline" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr</a>
              </p>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">Verbraucherstreitbeilegung</h3>
              <p className="text-sm">
                Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
              </p>
            </div>

            <div className="text-sm text-gray-600">
              <p>Stand: Oktober 2025</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
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