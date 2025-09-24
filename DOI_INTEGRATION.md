# DOI Integration Dokumentation für KN Team

## Überblick

Das neue System verwendet **LocalStorage** und **Timestamp-basierte Erkennung** für die DOI-basierte Wasserzeichen-Entfernung. Benutzer können zwischen Tabs wechseln und ihre Bilder bleiben 24 Stunden verfügbar.

## Workflow

1. **Bild generiert** → App speichert Bild in LocalStorage
2. **Zur Registrierung** → Button öffnet: `https://aktion.kn-online.de/angebot/o7bl6` (normale URL, keine Parameter)
3. **DOI erfolgreich** → KN-Seite führt **generisches** JavaScript aus (siehe unten)
4. **Zurück zur App** → Wasserzeichen automatisch entfernt (basiert auf Timestamp-Vergleich)

## Integration für KN-Team

### JavaScript für DOI-Erfolgsseite

**Einfachste Lösung** - Fügen Sie diesen Code auf der Seite ein, die nach erfolgreichem Double-Opt-In angezeigt wird:

```javascript
<script>
// DOI als completed markieren (generisch für alle Benutzer)
localStorage.setItem('kn_doi_completed', Date.now().toString());
console.log('DOI marked as completed at:', new Date().toISOString());

// Optional: Benutzer zurück zur App leiten nach 3 Sekunden
setTimeout(() => {
    window.location.href = 'https://meine-kn-titelseite.de';
}, 3000);
</script>
```

### Alternative: Nur DOI markieren (ohne Weiterleitung)

```javascript
<script>
localStorage.setItem('kn_doi_completed', Date.now().toString());
alert('Registrierung erfolgreich! Sie können nun zur KN Titelseiten-App zurückkehren.');
</script>
```

### Erweiterte Version mit Popup-Unterstützung

```javascript
<script>
// DOI als completed markieren
localStorage.setItem('kn_doi_completed', Date.now().toString());

// Popup-Fenster benachrichtigen (falls geöffnet)
if (window.opener) {
    try {
        window.opener.postMessage({ type: 'KN_DOI_COMPLETED' }, '*');
        setTimeout(() => window.close(), 1000);
    } catch (error) {
        console.log('Could not notify parent window');
    }
} else {
    // Normale Weiterleitung
    setTimeout(() => {
        window.location.href = 'https://meine-kn-titelseite.de';
    }, 3000);
}
</script>
```

## URLs

### Von App zur Registrierung
```
https://aktion.kn-online.de/angebot/o7bl6
```
**Keine URL-Parameter erforderlich!**

### Zurück zur App
```
https://meine-kn-titelseite.de
```

## LocalStorage Schema

Das System verwendet folgende LocalStorage Keys:

```javascript
// Aktuelle Bild-Session (24h Gültigkeit)
localStorage.setItem('kn_current_session', JSON.stringify({
    imageData: 'data:image/jpeg;base64,...',
    timestamp: 1727176123456,
    registrationStartTime: 1727176234567,  // Wenn Registrierung gestartet
    imageId: '1727176123456_abc123def'
}));

// DOI completion markieren (generisch, wird von KN-Seite gesetzt)
localStorage.setItem('kn_doi_completed', '1727176345678');
```

## Features

### ✅ Vorteile
- **Persistent**: Funktioniert auch wenn Tabs geschlossen werden
- **24h Gültigkeit**: Automatische Cleanup von expired Sessions
- **Cross-Tab**: Funktioniert zwischen verschiedenen Tabs
- **Popup-Support**: Kann in Popup-Fenstern geöffnet werden
- **Einfache Integration**: Nur eine Zeile JavaScript für KN-Team

### ⚙️ Technische Details
- Session-ID Format: `timestamp_randomstring` (z.B. `1727176123456_abc123def`)
- Automatisches Polling alle 2 Sekunden nach DOI-Status
- Cleanup expired Sessions beim App-Start
- PostMessage Support für Popup-Kommunikation

## Testing

### Testen der Integration
1. Bild in App generieren
2. "Wasserzeichen entfernen" klicken → Popup öffnet sich mit sessionId
3. Auf KN-Seite: DOI-JavaScript ausführen
4. Zurück zur App → Wasserzeichen sollte weg sein

### Debug Console
```javascript
// Alle aktiven Sessions anzeigen
console.log(KNStorage.getActiveSessions());

// Manuell DOI für Session markieren (zum Testen)
KNStorage.markDOICompleted('1727176123456_abc123def');

// Session-Daten anzeigen
console.log(KNStorage.getSession('1727176123456_abc123def'));
```

## Support

Bei Fragen zur Integration kontaktieren Sie das Entwicklerteam. Das System ist vollständig abwärtskompatibel und funktioniert ohne weitere Backend-Änderungen.