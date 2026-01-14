# DOI-Integration für externe Gewinnspiel-Seite

Dieses Dokument beschreibt, wie die externe DOI/Gewinnspiel-Seite einen Freischaltcode für die Titelseiten-App generiert und anzeigt.

## Überblick

Das neue Code-basierte System funktioniert wie folgt:

1. **Nutzer registriert sich** auf der externen DOI-Seite
2. **DOI-Seite generiert Code** via API-Aufruf
3. **Code wird dem Nutzer angezeigt** mit Copy-Button
4. **Nutzer gibt Code in App ein** zur Freischaltung der scharfen Titelseite

**Vorteile:**
- Funktioniert in allen Browsern (auch In-App-Browser)
- Keine localStorage-Probleme bei Cross-Browser-Szenarien
- Einfache manuelle Eingabe möglich

## API-Endpoint

### Code generieren

**Endpoint:** `POST https://kn.meine-titelseite.de/api/doi-code/generate`

**Request:**
```json
{
  "sessionId": "optional-unique-identifier"
}
```

**Response:**
```json
{
  "code": "A3F2-8B1C-D4E9",
  "expiresAt": 1705180800000,
  "timestamp": 1705094400000
}
```

**Code-Format:**
- 12 Hexadezimal-Zeichen in Gruppen von 4
- Format: `XXXX-YYYY-ZZZZ`
- Beispiele: `A3F2-8B1C-D4E9`, `5C7A-1E3B-9F2D`

## HTML/JavaScript-Integration

Fügen Sie folgenden Code auf der DOI-Erfolgsseite ein:

```html
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Registrierung erfolgreich</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      max-width: 600px;
      margin: 40px auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      background: white;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      text-align: center;
    }
    h1 {
      color: #4F80FF;
      margin-bottom: 20px;
    }
    .code-box {
      background: #f9f9f9;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      padding: 20px;
      margin: 30px 0;
    }
    .code {
      font-size: 32px;
      font-family: "Courier New", monospace;
      font-weight: bold;
      color: #333;
      letter-spacing: 4px;
      margin: 10px 0;
    }
    .copy-btn {
      background: #4F80FF;
      color: white;
      border: none;
      padding: 12px 32px;
      border-radius: 6px;
      font-size: 16px;
      cursor: pointer;
      margin-top: 20px;
    }
    .copy-btn:hover {
      background: #3d6de6;
    }
    .copy-btn.copied {
      background: #6bb024;
    }
    .instructions {
      color: #666;
      line-height: 1.6;
      margin-top: 30px;
    }
    .loading {
      color: #999;
    }
    .error {
      color: #e84f1c;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>✓ Registrierung erfolgreich!</h1>
    <p>Vielen Dank für Ihre Teilnahme am Gewinnspiel.</p>

    <div class="code-box">
      <p style="color: #666; margin-bottom: 10px;">Ihr Freischaltcode:</p>
      <div class="code" id="kn-code">
        <span class="loading">Wird geladen...</span>
      </div>
      <button class="copy-btn" id="kn-copy-btn" disabled>Code kopieren</button>
    </div>

    <div class="instructions">
      <h3>So geht's weiter:</h3>
      <ol style="text-align: left;">
        <li>Kehren Sie zur Titelseiten-App zurück</li>
        <li>Geben Sie dort diesen Code ein</li>
        <li>Ihre Titelseite wird sofort freigeschaltet</li>
      </ol>
    </div>
  </div>

  <script>
    (async function() {
      const codeElement = document.getElementById('kn-code')
      const copyButton = document.getElementById('kn-copy-btn')
      let generatedCode = ''

      try {
        // Optional: Session-ID aus URL-Parameter oder Cookie
        const params = new URLSearchParams(window.location.search)
        const sessionId = params.get('session_id') || `doi-${Date.now()}`

        // API-Aufruf zur Code-Generierung
        const response = await fetch('https://kn.meine-titelseite.de/api/doi-code/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId })
        })

        if (!response.ok) {
          throw new Error('API-Fehler')
        }

        const data = await response.json()
        generatedCode = data.code

        // Code anzeigen
        codeElement.innerHTML = generatedCode
        copyButton.disabled = false

        // Auto-copy beim Laden (optional)
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(generatedCode)
          console.log('Code automatisch kopiert')
        }
      } catch (error) {
        console.error('Fehler beim Laden des Codes:', error)
        codeElement.innerHTML = '<span class="error">Fehler beim Laden</span>'
        codeElement.className = 'code'
      }

      // Copy-Button Handler
      copyButton.addEventListener('click', async function() {
        if (!generatedCode) return

        try {
          await navigator.clipboard.writeText(generatedCode)
          this.textContent = '✓ Kopiert!'
          this.classList.add('copied')

          setTimeout(() => {
            this.textContent = 'Code kopieren'
            this.classList.remove('copied')
          }, 2000)
        } catch (error) {
          // Fallback: Select text
          const range = document.createRange()
          range.selectNode(codeElement)
          window.getSelection().removeAllRanges()
          window.getSelection().addRange(range)
          alert('Code markiert - bitte manuell kopieren (Strg+C / Cmd+C)')
        }
      })
    })()
  </script>
</body>
</html>
```

## Konfiguration in der Admin-Oberfläche

### Option 1: Code-basiert (DOI-URL leer)

Wenn in den Admin-Einstellungen **keine DOI-URL** eingetragen ist:

- App generiert Code automatisch nach Upload
- User gibt Code sofort ein (kein externer Flow)
- Funktioniert komplett offline/intern

### Option 2: Externe DOI-Seite (DOI-URL gesetzt)

Wenn eine **DOI-URL konfiguriert** ist:

- App öffnet externe DOI-Seite in neuem Tab/Fenster
- DOI-Seite zeigt Code wie oben beschrieben
- User gibt Code nach Rückkehr in App ein

## Code-Validierung

Die App validiert Codes über:

**Endpoint:** `POST https://kn.meine-titelseite.de/api/doi-code/validate`

**Request:**
```json
{
  "code": "A3F2-8B1C-D4E9"
}
```

**Response:**
```json
{
  "valid": true,
  "message": "Code is valid"
}
```

## Testing

### Test-Codes generieren

```bash
curl -X POST https://kn.meine-titelseite.de/api/doi-code/generate \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "test-123"}'
```

### Code validieren

```bash
curl -X POST https://kn.meine-titelseite.de/api/doi-code/validate \
  -H "Content-Type: application/json" \
  -d '{"code": "A3F2-8B1C-D4E9"}'
```

## Sicherheit

- Codes sind durch HMAC-SHA256 gesichert
- Jeder Code ist einzigartig (enthält Timestamp + Random-Komponente)
- Codes sind 24 Stunden gültig
- Validierung erfolgt serverseitig (kein Client-Hacking möglich)
- Secret-Key wird in config.json gespeichert

## Support

Bei Problemen oder Fragen:

- **Admin-Panel:** https://kn.meine-titelseite.de/admin
- **Dokumentation:** Siehe [CLAUDE.md](../CLAUDE.md)
- **API-Status:** https://kn.meine-titelseite.de/api/health

## Changelog

- **v1.0** (2026-01-13): Initial release mit Code-basiertem System
