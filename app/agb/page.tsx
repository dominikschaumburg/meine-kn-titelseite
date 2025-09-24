import Link from 'next/link'

export default function AGB() {
  return (
    <div className="min-h-screen bg-kn-light py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-kn-blue hover:underline mb-4 inline-block">
          ← Zurück zur Hauptseite
        </Link>
        
        <h1 className="text-3xl font-bold text-kn-dark mb-8">Allgemeine Geschäftsbedingungen</h1>
        
        <div className="bg-white rounded-lg p-6 shadow-lg prose max-w-none">
          <h2>1. Geltungsbereich</h2>
          <p>
            Diese Allgemeinen Geschäftsbedingungen gelten für die Nutzung der Web-Anwendung 
            "Meine KN Titelseite" der Kieler Nachrichten.
          </p>

          <h2>2. Leistungen</h2>
          <p>
            Die Anwendung ermöglicht es Nutzern, personalisierte Titelseiten zu erstellen. 
            Die Nutzung erfolgt kostenfrei, jedoch mit einem Wasserzeichen. 
            Die Entfernung des Wasserzeichens erfolgt nach einer E-Mail-Verifizierung.
          </p>

          <h2>3. Nutzungsrechte</h2>
          <p>
            Mit der Nutzung der Anwendung erhalten Sie ein nicht-exklusives, 
            nicht-übertragbares Recht zur privaten Nutzung der generierten Inhalte.
          </p>

          <h2>4. Nutzerverhalten</h2>
          <p>
            Die Nutzer verpflichten sich, keine rechtswidrigen, beleidigenden oder 
            anderweitig unzulässigen Inhalte zu verwenden. Alle hochgeladenen Bilder 
            werden automatisch moderiert.
          </p>

          <h2>5. Haftungsausschluss</h2>
          <p>
            Die Kieler Nachrichten übernehmen keine Haftung für Schäden, die durch 
            die Nutzung der Anwendung entstehen, soweit dies gesetzlich zulässig ist.
          </p>

          <h2>6. Änderungen</h2>
          <p>
            Diese AGB können jederzeit geändert werden. Nutzer werden über Änderungen 
            angemessen informiert.
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