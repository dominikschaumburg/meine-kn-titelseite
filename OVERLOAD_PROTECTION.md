# Server Overload Protection

Diese Anwendung verfügt über einen integrierten Überlastungsschutz, der automatisch aktiviert wird, wenn der Server an seine Kapazitätsgrenzen stößt.

## Wie es funktioniert

Das Middleware (`middleware.ts`) überwacht:

1. **Arbeitsspeicher-Auslastung**: Bei >90% Heap-Auslastung
2. **Request-Rate**: Bei >1000 Anfragen pro Minute

Wenn eine dieser Schwellenwerte überschritten wird:
- API-Requests erhalten HTTP 503 (Service Unavailable) mit `Retry-After: 60` Header
- Seitenaufrufe werden zu `/overload` umgeleitet
- Benutzer sehen eine freundliche Fehlermeldung mit Gewinnspiel-Link

## Konfiguration

### Umgebungsvariablen (Optional)

Sie können die Schwellenwerte über Umgebungsvariablen anpassen:

```bash
# In Railway oder .env.local
MAX_MEMORY_PERCENT=90          # Standard: 90% Arbeitsspeicher
MAX_REQUESTS_PER_MINUTE=1000   # Standard: 1000 Anfragen/Minute
```

### Anpassung im Code

Bearbeiten Sie `middleware.ts`:

```typescript
const MAX_MEMORY_PERCENT = 90  // Prozent
const MAX_REQUESTS_PER_MINUTE = 1000  // Anfragen
```

## Testing

### Lokales Testen

1. Besuchen Sie direkt: `http://localhost:3000/overload`

2. Simulieren Sie Überlastung (temporär `MAX_REQUESTS_PER_MINUTE` auf `1` setzen):

```typescript
// In middleware.ts
const MAX_REQUESTS_PER_MINUTE = 1  // Nur für Test!
```

3. Laden Sie die Seite mehrmals schnell neu

### Load Testing

Mit Apache Bench:
```bash
# 1000 Requests mit 10 gleichzeitigen Verbindungen
ab -n 1000 -c 10 http://localhost:3000/
```

Mit Artillery:
```bash
npm install -g artillery
artillery quick --count 100 --num 10 http://localhost:3000/
```

## Railway Deployment

Die Overload-Protection ist auf Railway automatisch aktiv. Bei hoher Last:

1. Server erkennt Überlastung automatisch
2. Neue Requests werden zur Overload-Seite umgeleitet
3. Bestehende Requests werden normal abgearbeitet
4. Nach Entlastung kehrt der Server automatisch zum Normalbetrieb zurück

## Vorteile

- ✅ Verhindert Server-Abstürze bei Traffic-Spitzen
- ✅ Benutzer bekommen freundliche Fehlermeldung statt Timeout
- ✅ Gewinnspiel-Link bleibt verfügbar
- ✅ Automatische Wiederherstellung nach Entlastung
- ✅ Analytics-Endpunkte bleiben verfügbar

## Monitoring

Überlastungs-Events werden in den Server-Logs protokolliert:

```
Server overload detected: High memory usage
Server overload detected: High request rate
```

Diese können Sie in Railway unter "Deployments" → "Logs" einsehen.
