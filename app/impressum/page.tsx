import Link from 'next/link'

export default function Impressum() {
  return (
    <div className="min-h-screen bg-kn-light flex flex-col">
      <div className="flex-1 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="text-kn-blue hover:underline mb-4 inline-block">
            ← Zurück zur Hauptseite
          </Link>
          
          <h1 className="text-3xl font-bold text-kn-dark mb-8">Impressum</h1>
          
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-bold text-kn-dark mb-4">Angaben gemäß § 5 TMG</h2>
            
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Herausgeber:</h3>
              <p>
                Kieler Nachrichten<br/>
                Verlag: Schmidt & Klaunitzer GmbH & Co. KG<br/>
                Fleethörn 1-7<br/>
                24103 Kiel
              </p>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">Kontakt:</h3>
              <p>
                Telefon: +49 431 903-0<br/>
                E-Mail: redaktion@kieler-nachrichten.de<br/>
                Internet: www.kn-online.de
              </p>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">Geschäftsführung:</h3>
              <p>
                Dr. Christian Longardt<br/>
                Sönke Petersen
              </p>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">Registergericht:</h3>
              <p>
                Amtsgericht Kiel<br/>
                HRA 3578 KI
              </p>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">Umsatzsteuer-ID:</h3>
              <p>
                DE 134546770
              </p>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:</h3>
              <p>
                Christian Longardt<br/>
                Fleethörn 1-7<br/>
                24103 Kiel
              </p>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">Technische Umsetzung:</h3>
              <p>
                Diese Webanwendung wurde mit Next.js entwickelt und nutzt moderne 
                Web-Technologien für die Kamerafunktionalität und Bildverarbeitung.
              </p>
            </div>

            <div className="text-sm text-gray-600">
              <p>Stand: September 2025</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-kn-dark text-white py-4 px-4 text-center">
        <div className="text-xs space-x-4">
          <a href="/agb" className="hover:text-kn-blue transition-colors">AGB</a>
          <span>|</span>
          <a href="/datenschutz" className="hover:text-kn-blue transition-colors">Datenschutz</a>
          <span>|</span>
          <a href="/impressum" className="hover:text-kn-blue transition-colors">Impressum</a>
        </div>
      </footer>
    </div>
  )
}