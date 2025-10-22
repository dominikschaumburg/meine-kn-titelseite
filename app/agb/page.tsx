import Link from 'next/link'

export default function AGB() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="text-kn-blue hover:underline mb-4 inline-block">
            ← Zurück zur Hauptseite
          </Link>

          <div className="bg-white rounded-lg p-6 prose max-w-none">
            <p className="mb-4">
              <strong>Kieler Zeitung Verlags- und Druckerei KG-GmbH & Co.</strong><br />
              Fleethörn 1/7, 24103 Kiel<br />
              Tel.: 0800 / 1234 901 (Mo – Fr 09:00 – 18:00 Uhr, Sa 08:00 – 12:00 Uhr)<br />
              E-Mail: vertrieb@kieler-nachrichten.de
            </p>

            <h1 className="text-3xl font-bold text-kn-dark mb-6">Allgemeine Geschäftsbedingungen</h1>

            <p className="mb-4">für die kostenlose Meine KN-Titelseite Anwendung des Anbieters.</p>

            <h2 className="text-2xl font-bold text-kn-dark mt-8 mb-4">Geltungsbereich</h2>
            <p className="mb-4">
              Diese Allgemeinen Geschäftsbedingungen (AGB) regeln die unentgeltliche Nutzung der vom Anbieter bereitgestellten Online-Anwendung („Anwendung"). Abweichende oder ergänzende Bedingungen des Nutzers finden keine Anwendung, es sei denn, der Anbieter stimmt ihrer Geltung ausdrücklich zu.
            </p>

            <h2 className="text-2xl font-bold text-kn-dark mt-8 mb-4">Leistungsbeschreibung</h2>
            <p className="mb-4">
              Der Anbieter stellt einen webbasierten Dienst zur Verfügung, mit dem registrierte Nutzer ein eigenes Foto („Selfie") hochladen, automatisiert in ein digitales Zeitungs-Template einfügen lassen und das Ergebnis nach Freischaltung herunterladen oder teilen können. Die Speicherung der hochgeladenen Fotos erfolgt ausschließlich zum Zwecke der technischen Verarbeitung und Anzeige; eine dauerhafte Speicherung oder öffentliche Veröffentlichung findet nicht statt. Nach Zweckerfüllung werden die Daten gelöscht (vgl. Art. 5 Abs. 1 lit. e sowie Art. 17 DSGVO). Die Nutzung der Anwendung ist derzeit unentgeltlich. Der Anbieter behält sich jedoch vor, künftig optionale, kostenpflichtige Zusatzfunktionen einzuführen.
            </p>

            <h2 className="text-2xl font-bold text-kn-dark mt-8 mb-4">Registrierung, Double-Opt-In und Newsletter</h2>
            <p className="mb-4">
              Zur Nutzung der Anwendung ist eine Registrierung unter Angabe einer gültigen E-Mail-Adresse sowie der Postleitzahl erforderlich. Die Aktivierung des Bildes erfolgt über das Double-Opt-In-Verfahren; erst nach Bestätigung des in der Anmelde-E-Mail übermittelten Links wird das Bild freigeschaltet. Die Einwilligung in den Erhalt eines E-Mail-Newsletters ist freiwillig, jederzeit widerrufbar und beeinflusst nicht die Nutzung der Anwendung（DSGVO Art. 7 Abs. 3; § 7 UWG).
            </p>

            <h2 className="text-2xl font-bold text-kn-dark mt-8 mb-4">Teilnahme an Aktionen und Gewinnspielen</h2>
            <p className="mb-4">
              Im Rahmen der Anwendung kann der Anbieter zeitlich befristete Aktionen, insbesondere Gewinnspiele, durchführen. Die Teilnahme ist freiwillig, jedoch Voraussetzung für die Freischaltung des bearbeiteten Fotos. Teilnahmeberechtigt sind natürliche Personen ab Vollendung des 18. Lebensjahres mit Wohnsitz in Deutschland. Für die Teilnahme wird kein Entgelt erhoben; damit liegt kein Glücksspiel im Sinne von § 3 GlüStV vor. Art, Anzahl und Wert der ausgelobten Preise werden jeweils gesondert bekanntgegeben. Die Ermittlung der Gewinner erfolgt nach dem in der jeweiligen Aktion beschriebenen Verfahren (z. B. Losentscheid); der Rechtsweg ist insoweit ausgeschlossen. Gewinner werden per E-Mail benachrichtigt und müssen den Gewinn innerhalb der in der Gewinnbenachrichtigung genannten Frist annehmen; andernfalls verfällt der Anspruch. Der Anbieter behält sich vor, eine Aktion aus wichtigem Grund vorzeitig zu beenden oder auszusetzen, wenn deren ordnungsgemäße Durchführung aus technischen oder rechtlichen Gründen nicht gewährleistet werden kann.
            </p>

            <h2 className="text-2xl font-bold text-kn-dark mt-8 mb-4">Nutzerpflichten, Netiquette und unzulässige Inhalte</h2>
            <p className="mb-4">
              Der Nutzer verpflichtet sich, nur Inhalte hochzuladen, an denen er die erforderlichen Rechte besitzt, und keine Rechte Dritter zu verletzen. Unzulässig sind insbesondere Inhalte, die Gewalt verherrlichen, diskriminierend oder rassistisch sind, pornografisch oder jugendgefährdend sind oder Propagandamaterial verfassungswidriger Organisationen, Volksverhetzung oder sonstige strafbare Inhalte enthalten. Der Anbieter setzt zur Einhaltung dieser Regeln eine automatisierte Inhaltsprüfung ein und ist berechtigt, rechts- oder vertragswidrige Inhalte sowie betroffene Nutzerkonten ohne Vorankündigung zu sperren oder zu löschen. Ein internes Beschwerdeverfahren zur Überprüfung solcher Maßnahmen steht den betroffenen Nutzern zur Verfügung (Art. 20 DSA).
            </p>

            <h2 className="text-2xl font-bold text-kn-dark mt-8 mb-4">Rechteeinräumung an Fotos</h2>
            <p className="mb-4">
              Der Nutzer räumt dem Anbieter eine einfache, nicht ausschließliche, räumlich und zeitlich auf die Vertragsdauer sowie sachlich auf die technische Verarbeitung beschränkte Lizenz an den hochgeladenen Fotos ein, um die vertraglich geschuldeten Leistungen zu erbringen. Eine weitergehende Nutzung oder Veröffentlichung der Fotos durch den Anbieter findet nicht statt.
            </p>

            <h2 className="text-2xl font-bold text-kn-dark mt-8 mb-4">Verfügbarkeit, Wartung und höhere Gewalt</h2>
            <p className="mb-4">
              Der Anbieter bemüht sich um eine möglichst unterbrechungsfreie Verfügbarkeit der Anwendung, übernimmt hierfür jedoch bei einem unentgeltlichen Dienst keine Gewähr. Geplante Wartungsarbeiten können regelmäßig durchgeführt werden und werden, soweit möglich, im Voraus angekündigt. Der Anbieter haftet nicht für Störungen, die auf Ereignisse höherer Gewalt zurückzuführen sind.
            </p>

            <h2 className="text-2xl font-bold text-kn-dark mt-8 mb-4">Haftung und Freistellung</h2>
            <p className="mb-4">
              Für unentgeltliche Leistungen haftet der Anbieter nur bei Vorsatz und grober Fahrlässigkeit (§ 521 BGB). Bei Verletzung von Leben, Körper oder Gesundheit haftet der Anbieter unbeschränkt. Im Übrigen ist die Haftung auf vorhersehbare, typische Schäden begrenzt. Der Nutzer stellt den Anbieter von sämtlichen Ansprüchen Dritter frei, die aus einer von ihm zu vertretenden Rechtsverletzung resultieren.
            </p>

            <h2 className="text-2xl font-bold text-kn-dark mt-8 mb-4">Vertragslaufzeit und Kündigung</h2>
            <p className="mb-4">
              Der Nutzungsvertrag wird auf unbestimmte Zeit geschlossen und kann von beiden Parteien jederzeit ohne Einhaltung einer Kündigungsfrist beendet werden. Der Anbieter stellt auf seiner Website einen „Verträge hier kündigen"-Button im Sinne von § 312k BGB bereit; über diesen kann der Nutzer den Vertrag auch ohne vorherigen Login durch wenige Schritte kündigen. Gesetzliche Sonderkündigungsrechte bleiben unberührt.
            </p>

            <h2 className="text-2xl font-bold text-kn-dark mt-8 mb-4">Änderungen dieser AGB</h2>
            <p className="mb-4">
              Der Anbieter ist berechtigt, diese AGB aus sachlich gerechtfertigten Gründen zu ändern, insbesondere bei Änderungen gesetzlicher Vorgaben oder technischen Weiterentwicklungen. Geplante Änderungen werden dem Nutzer mindestens vier Wochen vor Inkrafttreten in Textform mitgeteilt. Der Nutzer kann den Änderungen innerhalb dieser Frist widersprechen; im Falle des Widerspruchs bleibt der Vertrag zu den bisherigen Bedingungen bestehen, der Anbieter kann jedoch den Vertrag ordentlich kündigen.
            </p>

            <h2 className="text-2xl font-bold text-kn-dark mt-8 mb-4">Datenschutz</h2>
            <p className="mb-4">
              Die Verarbeitung personenbezogener Daten erfolgt ausschließlich im Einklang mit der DSGVO, dem BDSG und sonstigen einschlägigen Vorschriften. Nähere Informationen enthält die Datenschutzerklärung des Anbieters, auf die hiermit verwiesen wird (Art. 13 DSGVO).
            </p>

            <h2 className="text-2xl font-bold text-kn-dark mt-8 mb-4">Hinweis gemäß § 36 VSBG</h2>
            <p className="mb-4">
              Der Anbieter ist nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen. Die Plattform der Europäischen Kommission zur Online-Streitbeilegung (OS) ist unter <a href="https://ec.europa.eu/consumers/odr/" className="text-kn-blue underline">https://ec.europa.eu/consumers/odr/</a> erreichbar.
            </p>

            <h2 className="text-2xl font-bold text-kn-dark mt-8 mb-4">Schlussbestimmungen</h2>
            <p className="mb-4">
              Es gilt deutsches Recht unter Ausschluss des UN-Kaufrechts. Sofern der Nutzer Verbraucher ist, bleibt die gesetzliche Gerichtsstandregelung unberührt. Ist der Nutzer Kaufmann, ist Kiel ausschließlicher Gerichtsstand. Sollten einzelne Bestimmungen dieser AGB ganz oder teilweise unwirksam sein oder werden, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.
            </p>
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