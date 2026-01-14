# Migration Guide: app/page.tsx Änderungen

Dieses Dokument beschreibt die notwendigen Änderungen an [app/page.tsx](../app/page.tsx) zur Integration des neuen Config- und DOI-Code-Systems.

## Änderungen im Überblick

1. **Config-Loading hinzufügen**
2. **`isActionActive` von Config berechnen statt hardcodieren**
3. **DOI-Code-System integrieren**
4. **Download/Share-Buttons kombinieren**
5. **Gewinnspiel-Preis-Text dynamisch anzeigen**

---

## 1. Config-State hinzufügen

**Am Anfang der Komponente (nach den bestehenden State-Definitionen):**

```typescript
// NEU: Config-State
const [appConfig, setAppConfig] = useState<any>(null)
const [showCodeInput, setShowCodeInput] = useState(false)
const [codeInput, setCodeInput] = useState('')
const [codeError, setCodeError] = useState('')
```

---

## 2. Config laden im useEffect

**Im ersten useEffect (Zeile 39-107), am Anfang hinzufügen:**

```typescript
// Load app config
const loadConfig = async () => {
  try {
    const response = await fetch('/api/config')
    const data = await response.json()
    setAppConfig(data)
  } catch (err) {
    console.error('Failed to load config:', err)
  }
}

loadConfig()
```

---

## 3. isActionActive dynamisch berechnen

**Ersetzen (Zeile 25-26):**

```typescript
// ALT:
const isActionActive = false
```

**Mit:**

```typescript
// NEU: Calculate from config
const isActionActive = appConfig ? (() => {
  const now = Date.now()
  const start = new Date(appConfig.whiteLabel.actionStart).getTime()
  const end = new Date(appConfig.whiteLabel.actionEnd).getTime()
  return now >= start && now <= end
})() : false
```

---

## 4. DOI-Code-Validierung hinzufügen

**Neue Funktion nach `handleFileUpload`:**

```typescript
const handleCodeSubmit = async () => {
  if (!codeInput.trim()) {
    setCodeError('Bitte geben Sie einen Code ein')
    return
  }

  setIsProcessing(true)
  setCodeError('')

  try {
    const response = await fetch('/api/doi-code/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: codeInput.trim().toUpperCase() })
    })

    const result = await response.json()

    if (result.valid) {
      // Save code and mark as verified
      KNStorage.saveDOICode(codeInput.trim().toUpperCase())
      setIsDOICompleted(true)

      // Track DOI completion
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'doiCompletion' })
      }).catch(err => console.error('Analytics error:', err))
    } else {
      setCodeError('Ungültiger Code. Bitte überprüfen Sie Ihre Eingabe.')
    }
  } catch (error) {
    setCodeError('Fehler bei der Code-Validierung')
  } finally {
    setIsProcessing(false)
  }
}
```

---

## 5. DOI-Flow im handleCrop anpassen

**Im `handleCrop`-Function, nach der Moderation, ersetzen:**

```typescript
// ALT: Direct DOI URL
const doiUrl = process.env.NEXT_PUBLIC_APP_URL + '/doi'
```

**Mit:**

```typescript
// NEU: Check if DOI URL is configured
if (appConfig?.whiteLabel.doiUrl) {
  // External DOI flow
  window.open(appConfig.whiteLabel.doiUrl, '_blank')
  setShowCodeInput(true)
} else {
  // Code-based flow (no external URL)
  // Generate code automatically
  try {
    const codeResponse = await fetch('/api/doi-code/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: newSessionId })
    })

    const codeData = await codeResponse.json()
    // Show code to user immediately
    alert(`Ihr Freischaltcode: ${codeData.code}`)
    setShowCodeInput(true)
  } catch (error) {
    console.error('Code generation failed:', error)
  }
}
```

---

## 6. Download/Share-Buttons kombinieren

**Ersetzen die beiden Buttons (Download und Share) mit:**

```typescript
<button
  onClick={handleDownloadAndShare}
  className="px-6 py-3 bg-kn-blue text-white rounded-kn font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
>
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
  Herunterladen & Teilen
</button>
```

**Und neue Funktion:**

```typescript
const handleDownloadAndShare = async () => {
  if (!capturedImage) return

  try {
    // Download
    const link = document.createElement('a')
    link.download = `meine-kn-titelseite-${Date.now()}.jpg`
    link.href = capturedImage
    link.click()

    // Try to share if Web Share API is available
    if (navigator.share && navigator.canShare) {
      const blob = await (await fetch(capturedImage)).blob()
      const file = new File([blob], 'meine-kn-titelseite.jpg', { type: 'image/jpeg' })

      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Meine KN Titelseite',
          text: 'Schau dir meine KN Titelseite an!',
          files: [file]
        })
      }
    }

    // Track as single interaction
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'interaction' })
    }).catch(err => console.error('Analytics error:', err))

  } catch (error) {
    console.error('Download/Share error:', error)
  }
}
```

---

## 7. Code-Input UI hinzufügen

**Im Preview-Step, vor den Download/Share-Buttons:**

```typescript
{showCodeInput && !isDOICompleted && (
  <div className="bg-white rounded-lg p-6 shadow-sm mb-4">
    <h3 className="text-lg font-semibold mb-3">Freischaltcode eingeben</h3>
    <p className="text-gray-600 mb-4">
      Geben Sie den Code ein, den Sie nach der Registrierung erhalten haben.
    </p>
    <div className="flex gap-3">
      <input
        type="text"
        value={codeInput}
        onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
        placeholder="XXXX-YYYY-ZZZZ"
        maxLength={14}
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-mono text-lg tracking-wider"
      />
      <button
        onClick={handleCodeSubmit}
        disabled={isProcessing}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {isProcessing ? 'Prüfe...' : 'Freischalten'}
      </button>
    </div>
    {codeError && (
      <p className="text-red-600 text-sm mt-2">{codeError}</p>
    )}
  </div>
)}
```

---

## 8. Gewinnspiel-Preis dynamisch anzeigen

**In der Intro-Seite, nach der Überschrift:**

```typescript
{appConfig?.whiteLabel.contestPrize && (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
    <p className="text-blue-900">
      <strong>Gewinnspiel:</strong> {appConfig.whiteLabel.contestPrize}
    </p>
  </div>
)}
```

---

## Testing-Checklist

Nach den Änderungen testen:

- [ ] Config lädt beim Start
- [ ] Action-Ended-Modal zeigt sich wenn `actionEnd` überschritten
- [ ] Gewinnspiel-Preis wird angezeigt (wenn gesetzt)
- [ ] DOI-URL leer → Code wird generiert und angezeigt
- [ ] DOI-URL gesetzt → Externe Seite öffnet sich
- [ ] Code-Input funktioniert
- [ ] Code-Validierung funktioniert
- [ ] Combined Download/Share-Button funktioniert
- [ ] Analytics tracken "interaction" Event
- [ ] Moderation wird übersprungen wenn `moderationEnabled = false`

---

## Hinweise

- Die Datei `app/page.tsx` ist sehr groß (~900+ Zeilen)
- Änderungen sollten schrittweise und mit Tests durchgeführt werden
- Backup der Original-Datei empfohlen vor Änderungen
- Nach Änderungen: `npm run dev` und ausführlich testen
