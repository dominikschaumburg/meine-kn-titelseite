Es sind noch einige Anpassungen an der App notwendig. Das Logo im Header oben sollte durch die Datei KN_Schriftzug_Digital_Farbig.svg mittig zentriert ersetzt werden. Darüber hinaus sollten die Favicons unter /Users/dominik/Documents/Projekte/meine-kn-titelseite/assets/favicon ordnungsgemäß eingebunden werden.

<link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="shortcut icon" href="/favicon.ico" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<meta name="apple-mobile-web-app-title" content="Meine KN-Titelseite" />
<link rel="manifest" href="/site.webmanifest" />

Die interaktive Box für den Beschnitt des Bildes sollte standardmäßig immer so groß wie möglich (volle Breite oder Höhe je nach Seitenverhältnis des Nutzerbilds im Template) sein und zentriert sein. Meine KN Titelseite wird "Meine KN-Titelseite" geschrieben. Die Buttons sollten alle in Kobaltblau gehalten sein und ihre Farbe nicht bei Hover ändern. Border Radius 4px. Als Textfont sollte die Inter verwendet werden:
'/Users/dominik/Documents/Projekte/meine-kn-titelseite/assets/fonts/Inter-Regular-slnt=0.ttf'

Der Moderations-Endpunkt sollte durch den folgenden mit der folgenden API-schlüssel ersetzt werden:
- https://litellm.ki.rndtech.de/v1
- API-Schlüssel: sk-9cRZIcMm7X8GhiMzsnidEQ

Das Layout der Seite mit dem Bildbeschnitt sollte so sein, dass sie Buttons immer im Viewport sind.

Auf der Startseite der Button sollte "Foto aufnehmen" heißen und nicht "Foto auswählen". Der Selfie-Emoji würde besser passen. Darüber hinaus sollte darunter ein zweiter Button mit "Nur am Gewinnspiel teilnehmen" der auf https://aktion.kn-online.de/angebot/o7bl6/ verlinkt sein.

In der Ansicht mit dem unscharfen Template die beiden Buttons sollten untereinander sein, statt "Bild entschärfen" sollte dort "Am Gewinnspiel teilnehmen & Titelseite freischalten" oder soetwas in die Richtung stehen.

Es ist ganz wichtig, dass Mobile immer alle Buttons vollständig innerhalb des Viewports sind und man nicht scrollen muss.

AGB, Datenschutzerklärung und Impressum sollten so wie in /Users/dominik/Documents/Projekte/meine-kn-titelseite/agb.md, /Users/dominik/Documents/Projekte/meine-kn-titelseite/Datenschutzerklärung.md und /Users/dominik/Documents/Projekte/meine-kn-titelseite/Impressum.md angepasst werden.

Darüber hinaus sollte auf der Startseite nochmal eine aufklappbare Infobox oder ein kurzes visuall ansprechendes und animiertes Onboarding/Scrollytelling stattfinden.

Du könntest dich beispielsweise an den folgenden Punkten (die auch so auf den Werbemitteln stehen) orientieren:
1. QR-Code scannen oder kn.meine-titelseite.de besuchen (unnötig, man ist ja bereits auf der Webseite)
2. Foto machen
3. Für Gewinnspiel registrieren (es gibt einen 250 € Gutschein für den Holstein Kiel Fanshop im Stadion zu gewinnen) & Titelseite freischalten
3. Digitale Titelseite herunterladen & teilen

Wer mag kann die Kieler Nachrichten auf Social Media markieren.

Darüber hinaus sollte ein möglichst minimalistisches Web-Analyse-Tracking ohne Cookies implementiert werden. Wir müssen im Anschluss irgendwie wissen wie viele Seitenaufrufe wir hatten, wie viele ein Foto hochgeladen haben und wie viele am Ende wirklich mit einer URL mit DOI-Parameter wieder gekommen sind um ihre Titelseite freizuschalten. Das sollte möglichst einfach einsehbar und auswertbar sein.

Darüber hinaus geben die Logs bei Railway glaube ich bei jeder Verarbeitung die folgende Meldung aus:  ⚠ Unsupported metadata viewport is configured in metadata export. Please move it to viewport export instead.

Außerdem währe es wünschenswert wenn die Webseite über die nötigen und empfohlenen SEO Meta-Tags verfügt, sodass sie über die Keywords Meine, KN, Kieler Nachrichten und Titelseite gefunden wird.

Die Nutzungsbedingungen und Datenschutzerklärung bei der checkbox sollten korrekt verlinkt werden.

Darber hinaus habe ich noch eine Frage: Die Verarbeitung der Fotos zum Template findet klientseitig statt und nicht serverseitig, oder? Weil wir rechnen mit vielen Nutzer:innen gleichzeitig.