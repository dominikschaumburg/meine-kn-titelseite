import Link from 'next/link'

export default function Datenschutz() {
  return (
    <div className="min-h-screen bg-kn-light py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-kn-blue hover:underline mb-4 inline-block">
          ← Zurück zur Hauptseite
        </Link>
        
        <h1 className="text-3xl font-bold text-kn-dark mb-8">Datenschutzerklärung</h1>
        
        <div className="bg-white rounded-lg p-6 shadow-lg prose max-w-none">
          <h2>1. Verantwortlicher</h2>
          <p>
            Verantwortlicher für die Datenverarbeitung ist:<br/>
            Kieler Nachrichten<br/>
            Fleethörn 1-7<br/>
            24103 Kiel
          </p>

          <h2>2. Erhebung und Verarbeitung personenbezogener Daten</h2>
          <p>
            Bei der Nutzung unserer Web-Anwendung werden folgende Daten verarbeitet:
          </p>
          <ul>
            <li>Kameraaufnahmen (werden lokal verarbeitet und temporär gespeichert)</li>
            <li>E-Mail-Adresse (für die Wasserzeichen-Entfernung)</li>
            <li>Technische Daten (IP-Adresse, Browser-Informationen)</li>
          </ul>

          <h2>3. Zweck der Datenverarbeitung</h2>
          <p>
            Die Daten werden ausschließlich verarbeitet für:
          </p>
          <ul>
            <li>Die Bereitstellung der Anwendungsfunktionen</li>
            <li>Die Content-Moderation mittels OpenAI</li>
            <li>Die E-Mail-Verifizierung für die Wasserzeichen-Entfernung</li>
          </ul>

          <h2>4. Rechtsgrundlage</h2>
          <p>
            Die Verarbeitung erfolgt auf Basis Ihrer Einwilligung (Art. 6 Abs. 1 lit. a DSGVO) 
            und zur Erfüllung der vertraglichen Leistungen (Art. 6 Abs. 1 lit. b DSGVO).
          </p>

          <h2>5. Speicherdauer</h2>
          <p>
            Generierte Bilder werden maximal 24 Stunden gespeichert. 
            E-Mail-Adressen werden nach erfolgreicher Verifizierung gelöscht.
          </p>

          <h2>6. Ihre Rechte</h2>
          <p>
            Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung 
            der Verarbeitung, Datenübertragbarkeit und Widerspruch gegen die Verarbeitung 
            Ihrer personenbezogenen Daten.
          </p>

          <h2>7. Externe Dienste</h2>
          <p>
            Wir nutzen OpenAI für die Content-Moderation. Dabei werden Bilddaten 
            temporär an OpenAI übermittelt und nach der Prüfung gelöscht.
          </p>

          <div className="mt-8 text-sm text-gray-600">
            <p>Stand: September 2025</p>
            <p>Kieler Nachrichten</p>
          </div>
        </div>
      </div>
    </div>
  )
}