import Link from 'next/link'

export default function Datenschutz() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="text-kn-blue hover:underline mb-4 inline-block">
            ← Zurück zur Hauptseite
          </Link>

          <div className="bg-white rounded-lg p-6 prose max-w-none">
            <h1 className="text-3xl font-bold text-kn-dark mb-6">Datenschutzerklärung</h1>

            <h2 className="text-2xl font-bold text-kn-dark mt-8 mb-4">1. Verantwortlicher</h2>
            <p className="mb-4">
              Verantwortliche Stelle für die Datenverarbeitung auf dieser Website i.S.d. DSGVO und BDSG ist (soweit nicht anders angegeben) allein die
            </p>
            <p className="mb-4">
              <strong>RND One GmbH</strong><br />
              Mühlenkamp 59<br />
              22303 Hamburg
            </p>
            <p className="mb-4">
              Sitz der Gesellschaft: Hamburg<br />
              Registergericht: Amtsgericht Hamburg HRB 176019<br />
              Geschäftsführer: Bernhard Bahners, Martin Kautz<br />
              USt-ID-Nr.: DE353970481
            </p>
            <p className="mb-4">Tel.: 0800/1234-312 (kostenlos)</p>

            <h2 className="text-2xl font-bold text-kn-dark mt-8 mb-4">2. Datenschutz-Kontakt</h2>
            <p className="mb-4">
              Wenn Sie eine Frage zum Datenschutz haben, erreichen Sie unser Datenschutzteam per E-Mail unter <a href="mailto:datenschutz@rnd-one.de" className="text-kn-blue underline">datenschutz@rnd-one.de</a> oder per Post unter RND One GmbH, Datenschutz, Mühlenkamp 59, 22303 Hamburg.
            </p>
            <p className="mb-4">
              <strong>Datenschutzbeauftragter:</strong><br />
              Unser Datenschutzbeauftragter ist erreichbar unter <a href="mailto:dsb@rnd-one.de" className="text-kn-blue underline">dsb@rnd-one.de</a> oder per Post unter RND One GmbH, Datenschutzbeauftragter, Mühlenkamp 59, 22303 Hamburg.
            </p>

            <h2 className="text-2xl font-bold text-kn-dark mt-8 mb-4">3. Allgemeine Hinweise</h2>
            <p className="mb-4">
              Der Schutz Ihrer persönlichen Daten ist uns ein wichtiges Anliegen. Wir verarbeiten Ihre Daten ausschließlich auf Grundlage der gesetzlichen Bestimmungen (DSGVO, TKG). In dieser Datenschutzerklärung informieren wir Sie über die Verarbeitung Ihrer personenbezogenen Daten bei der Nutzung unserer Web-Anwendung.
            </p>

            <h2 className="text-2xl font-bold text-kn-dark mt-8 mb-4">4. Datenverarbeitung im Rahmen der Web-Anwendung</h2>

            <h3 className="text-xl font-bold text-kn-dark mt-6 mb-3">4.1 Selfie-Upload und Bildverarbeitung</h3>
            <p className="mb-4"><strong>Welche Daten werden verarbeitet?</strong></p>
            <ul className="mb-4 list-disc pl-6">
              <li>Von Ihnen hochgeladene oder erstellte Selfie-Aufnahmen</li>
              <li>Postleitzahl (PLZ)</li>
              <li>E-Mail-Adresse (freiwillig)</li>
            </ul>

            <p className="mb-4"><strong>Zweck der Verarbeitung:</strong></p>
            <ul className="mb-4 list-disc pl-6">
              <li>Überprüfung der hochgeladenen Bilder auf unzulässige Inhalte (Gewalt, Nacktheit, Diskriminierung, Rassismus etc.) mittels automatisierter Moderationstechnologie</li>
              <li>Bereitstellung des verarbeiteten Bildes zum Download oder Teilen</li>
              <li>Bei Angabe der E-Mail-Adresse: Versand unserer redaktionellen Newsletter (nach Double-Opt-In-Verfahren)</li>
            </ul>

            <p className="mb-4"><strong>Rechtsgrundlage:</strong></p>
            <ul className="mb-4 list-disc pl-6">
              <li>Art. 6 Abs. 1 lit. a DSGVO (Einwilligung) für die Verarbeitung des Selfies und der PLZ</li>
              <li>Art. 6 Abs. 1 lit. a DSGVO (Einwilligung) für den Newsletter-Versand nach bestätigtem Double-Opt-In</li>
            </ul>

            <p className="mb-4"><strong>Weitergabe an Dritte:</strong></p>
            <p className="mb-4">
              Zur automatisierten Überprüfung der hochgeladenen Bilder auf unzulässige Inhalte nutzen wir den Moderationsdienst von OpenAI (USA). Die Datenübermittlung in die USA erfolgt auf Grundlage Ihrer Einwilligung (Art. 49 Abs. 1 lit. a DSGVO). Wir weisen darauf hin, dass in den USA möglicherweise nicht das gleiche Datenschutzniveau wie in der EU besteht.
            </p>

            <p className="mb-4"><strong>Speicherdauer:</strong></p>
            <p className="mb-4">
              Ihre hochgeladenen Bilder werden nicht dauerhaft gespeichert oder veröffentlicht. Die Bilder werden ausschließlich zur Durchführung der Moderation temporär verarbeitet und Ihnen anschließend zum Download oder Teilen zur Verfügung gestellt. Nach Abschluss des Vorgangs werden die Bilddaten gelöscht.
            </p>
            <p className="mb-4">
              Die E-Mail-Adresse wird im Falle der Newsletter-Anmeldung gespeichert, bis Sie den Newsletter abbestellen.
            </p>

            <h3 className="text-xl font-bold text-kn-dark mt-6 mb-3">4.2 Newsletter (freiwillig)</h3>
            <p className="mb-4">
              Die Angabe Ihrer E-Mail-Adresse ist freiwillig und dient ausschließlich dem Versand unserer redaktionellen Newsletter. Die Anmeldung erfolgt im Double-Opt-In-Verfahren: Sie erhalten nach der Eingabe Ihrer E-Mail-Adresse eine Bestätigungs-E-Mail, in der Sie durch Klick auf einen Link Ihre Anmeldung bestätigen müssen.
            </p>

            <p className="mb-4"><strong>Widerruf:</strong></p>
            <p className="mb-4">
              Sie können den Newsletter jederzeit abbestellen. Einen Abmeldelink finden Sie in jeder Newsletter-E-Mail. Alternativ können Sie Ihren Widerruf an <a href="mailto:datenschutz@rnd-one.de" className="text-kn-blue underline">datenschutz@rnd-one.de</a> senden.
            </p>

            <h2 className="text-2xl font-bold text-kn-dark mt-8 mb-4">5. Keine Cookies, Tracking oder Werbung</h2>
            <p className="mb-4">Diese Web-Anwendung verwendet:</p>
            <ul className="mb-4 list-disc pl-6">
              <li>Keine Cookies</li>
              <li>Kein Tracking</li>
              <li>Keine Werbenetzwerke</li>
              <li>Kein Google Analytics</li>
              <li>Keine Google Fonts</li>
              <li>Keine sonstigen externen Dienste außer der beschriebenen Moderationstechnologie</li>
            </ul>

            <h2 className="text-2xl font-bold text-kn-dark mt-8 mb-4">6. Ihre Rechte als Betroffene/r</h2>
            <p className="mb-4">Sie haben jederzeit das Recht auf:</p>
            <ul className="mb-4 list-disc pl-6">
              <li>Auskunft über Ihre bei uns gespeicherten Daten (Art. 15 DSGVO)</li>
              <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
              <li>Löschung Ihrer Daten (Art. 17 DSGVO)</li>
              <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
              <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
              <li>Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
              <li>Widerruf Ihrer Einwilligung (Art. 7 Abs. 3 DSGVO)</li>
            </ul>

            <p className="mb-4">
              Der Widerruf Ihrer Einwilligung lässt die Rechtmäßigkeit der bis dahin erfolgten Verarbeitung unberührt.
            </p>

            <p className="mb-4">
              Zur Ausübung Ihrer Rechte wenden Sie sich bitte an: <a href="mailto:datenschutz@rnd-one.de" className="text-kn-blue underline">datenschutz@rnd-one.de</a>
            </p>

            <p className="mb-4"><strong>Beschwerderecht:</strong></p>
            <p className="mb-4">
              Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über die Verarbeitung Ihrer personenbezogenen Daten durch uns zu beschweren.
            </p>

            <p className="mb-4">
              <strong>Zuständige Aufsichtsbehörde für Hamburg:</strong><br />
              Der Hamburgische Beauftragte für Datenschutz und Informationsfreiheit<br />
              Ludwig-Erhard-Straße 22<br />
              20459 Hamburg<br />
              <a href="https://www.datenschutz-hamburg.de" className="text-kn-blue underline" target="_blank" rel="noopener noreferrer">www.datenschutz-hamburg.de</a>
            </p>

            <div className="mt-8 text-sm text-gray-600">
              <p>Stand: 22.10.2025</p>
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