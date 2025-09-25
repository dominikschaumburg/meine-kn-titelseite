# DOI Integration Dokumentation

## Überblick

Das System verwaltet die Double-Opt-In (DOI) Integration für die Entfernung der Bildunschärfe. Benutzer müssen ihre E-Mail-Adresse bestätigen, um das scharfe Bild zu erhalten.

## Problem: Unzuverlässige DOI-Erkennung

**Mögliche Ursachen für fehlschlagende DOI-Entfernung:**

1. **Popup-Blocker**: Browser blockiert Popup-Fenster
2. **Cross-Domain-Kommunikation**: PostMessage wird blockiert
3. **LocalStorage-Probleme**: Private/Inkognito-Modus, Browser-Einstellungen
4. **Timing-Issues**: DOI-Validierung schlägt fehl
5. **KN-Seite Integration**: JavaScript wird nicht korrekt ausgeführt

## Ablauf der DOI-Integration

### 1. Bild-Erstellung (Unschärfe aktiviert)
```typescript
// Nach Bildgenerierung - Unschärfe wird angewendet
setIsDOICompleted(false)
// CSS-Klasse: preview-blur { filter: blur(4px); }
```

### 2. Registrierung starten
```typescript
const openRegistration = () => {
  KNStorage.markRegistrationStart()  // Zeitstempel setzen
  window.open('https://aktion.kn-online.de/angebot/o7bl6', '_blank', 'width=800,height=600')
}
```

### 3. DOI-Bestätigung erkennen (3 Mechanismen)

#### A) Popup-Nachricht (Primär - **oft blockiert**)
```typescript
// App lauscht auf PostMessage vom Popup
window.addEventListener('message', (event) => {
  if (event.data.type === 'KN_DOI_COMPLETED') {
    setIsDOICompleted(true) // Unschärfe entfernen
  }
})
```
**Problem**: Cross-Domain-Kommunikation wird oft blockiert

#### B) URL-Parameter (Backup)
```typescript
// App prüft URL-Parameter bei Seitenaufruf
const urlParams = new URLSearchParams(window.location.search)
const doiFromURL = urlParams.get('doi_completed')
if (doiFromURL) {
  localStorage.setItem('kn_doi_completed', doiFromURL)
}
```
**Problem**: Funktioniert nur bei Weiterleitung

#### C) Polling LocalStorage (Fallback - **zuverlässigste Methode**)
```typescript
// App prüft alle 2 Sekunden LocalStorage
useEffect(() => {
  const interval = setInterval(() => {
    if (KNStorage.isDOICompleted()) {
      setIsDOICompleted(true)
    }
  }, 2000)
  return () => clearInterval(interval)
}, [])
```

## Integration für KN-Team

### Empfohlene JavaScript-Integration (Alle 3 Mechanismen)

**Auf der DOI-Erfolgsseite einbauen:**

```html
<script>
// 1. LocalStorage setzen (für Polling-Mechanismus)
localStorage.setItem('kn_doi_completed', Date.now().toString());
console.log('DOI marked as completed at:', new Date().toISOString());

// 2. Popup-Benachrichtigung (falls möglich)
if (window.opener) {
    try {
        window.opener.postMessage({ type: 'KN_DOI_COMPLETED' }, '*');
        console.log('Notified parent window');
        // Popup nach 2 Sekunden schließen
        setTimeout(() => window.close(), 2000);
    } catch (error) {
        console.log('Could not notify parent window:', error);
        // Fallback: Weiterleitung
        setTimeout(() => {
            window.location.href = 'https://meine-kn-titelseite.de?doi_completed=' + Date.now();
        }, 3000);
    }
} else {
    // 3. URL-Parameter Weiterleitung (für normale Navigation)
    setTimeout(() => {
        window.location.href = 'https://meine-kn-titelseite.de?doi_completed=' + Date.now();
    }, 3000);
}
</script>
```

## DOI-Validierung und Probleme

### Timing-Validierung
```typescript
// DOI muss folgende Bedingungen erfüllen:
static isDOICompleted(): boolean {
  // 1. Session muss existieren
  const currentSession = this.getCurrentSession()
  if (!currentSession) return false
  
  // 2. DOI-Timestamp muss vorhanden sein
  const doiCompletedTime = localStorage.getItem('kn_doi_completed')
  if (!doiCompletedTime) return false
  
  // 3. Timing-Validierung (mit 10min Grace Period)
  if (currentSession.registrationStartTime) {
    const isValidTiming = doiTimestamp > (currentSession.registrationStartTime - 600000)
    if (!isValidTiming) return false
  }
  
  // 4. DOI darf nicht älter als 24h sein
  const isNotExpired = Date.now() - doiTimestamp < 86400000
  return isNotExpired
}
```

### Häufige Probleme

#### 1. LocalStorage wird nicht gesetzt
```javascript
// Debug: LocalStorage-Zugriff testen
try {
  localStorage.setItem('test', 'value');
  console.log('LocalStorage funktioniert');
} catch (error) {
  console.error('LocalStorage blockiert:', error);
}
```

#### 2. Popup-Kommunikation scheitert
```javascript
// Debug: PostMessage-Test
window.opener.postMessage({ type: 'TEST' }, '*');
// Falls Fehler: "Failed to execute 'postMessage' on 'Window': The target origin provided ('*') does not match the recipient window's origin"
```

#### 3. Timing-Probleme
```javascript
// Debug: Zeitstempel prüfen
const session = JSON.parse(localStorage.getItem('kn_current_session'));
const doiTime = parseInt(localStorage.getItem('kn_doi_completed'));
console.log('Registration:', new Date(session.registrationStartTime));
console.log('DOI Completed:', new Date(doiTime));
console.log('Valid Timing:', doiTime > (session.registrationStartTime - 600000));
```

## Debug-Tools für Entwickler

### Browser-Konsole Debug-Befehle
```javascript
// 1. Vollständige Debug-Information
KNStorage.getDebugInfo()

// 2. DOI manuell setzen (zum Testen)
localStorage.setItem('kn_doi_completed', Date.now().toString())

// 3. Alle KN-LocalStorage-Keys anzeigen
Object.keys(localStorage).filter(key => key.startsWith('kn_'))

// 4. Session-Details
JSON.parse(localStorage.getItem('kn_current_session'))

// 5. DOI-Status forcieren (für Tests)
// In Browser-Konsole der Hauptapp:
setIsDOICompleted(true)
```

### Monitoring und Logging
```typescript
// App-seitiges Logging für Debugging
useEffect(() => {
  console.log('DOI Status Check:', {
    hasSession: !!KNStorage.getCurrentSession(),
    isDOICompleted: KNStorage.isDOICompleted(),
    doiTimestamp: localStorage.getItem('kn_doi_completed'),
    registrationStart: KNStorage.getCurrentSession()?.registrationStartTime,
    timingValid: /* timing validation result */
  });
}, [])
```

## Troubleshooting-Checklist

### Für Support-Team
- [ ] **Popup-Blocker** deaktiviert?
- [ ] **JavaScript** in beiden Domains aktiviert?
- [ ] **LocalStorage** verfügbar? (nicht Inkognito-Modus)
- [ ] **KN-Seite** führt JavaScript aus?
- [ ] **Timing** korrekt? (DOI nach Registrierung, < 24h alt)
- [ ] **Browser-Konsole** auf Fehler prüfen
- [ ] **Cross-Domain-Cookies** erlaubt?

### Alternative Lösungsansätze
1. **Polling-Intervall erhöhen** (von 2s auf 1s)
2. **Grace Period erweitern** (von 10min auf 30min)
3. **URL-Weiterleitung** als primären Mechanismus verwenden
4. **LocalStorage-Domain** prüfen (Subdomain-Probleme)

## URLs und Integration

### Von App zur Registrierung
```
https://aktion.kn-online.de/angebot/o7bl6
```

### Zurück zur App (mit DOI-Parameter)
```
https://meine-kn-titelseite.de?doi_completed=1727258400000
```

### LocalStorage-Struktur
```javascript
// Session-Daten (24h Gültigkeit)
'kn_current_session': {
  imageData: 'data:image/jpeg;base64,...',
  timestamp: 1727258400000,
  registrationStartTime: 1727258460000,
  imageId: 'abc123def456'
}

// DOI-Status (wird von KN-Seite gesetzt)
'kn_doi_completed': '1727258520000'
```

## Empfehlungen für bessere Zuverlässigkeit

1. **KN-Seite**: Alle 3 Mechanismen implementieren
2. **Polling-Intervall**: Von 2s auf 1s reduzieren
3. **Benutzer-Feedback**: Klarere Anweisungen bei Problemen
4. **Fallback-Button**: "Manuell aktualisieren" für Problemfälle
5. **Monitoring**: DOI-Success-Rate tracking implementieren