# Server Overload Protection

Diese Anwendung verfügt über einen integrierten Überlastungsschutz, der automatisch aktiviert wird, wenn der Server an seine Kapazitätsgrenzen stößt.

## Wie es funktioniert

### 1. Request-Rate Monitoring (Middleware)
Das Middleware (`middleware.ts`) überwacht die **Request-Rate** in Echtzeit:
- Bei >1000 Anfragen pro Minute wird automatisch auf `/overload` umgeleitet
- Läuft im Edge Runtime (schnell und effizient)

### 2. Memory Monitoring (Health Check API)
Die Health-Check API (`/api/health`) überwacht die **Arbeitsspeicher-Auslastung**:
- Bei >90% Heap-Auslastung gibt die API HTTP 503 zurück
- Läuft im Node.js Runtime (voller Zugriff auf Memory-Daten)
- Kann von Load Balancern für Health Checks verwendet werden

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

Bearbeiten Sie `middleware.ts` für Request-Rate:

```typescript
const MAX_REQUESTS_PER_MINUTE = 1000  // Anfragen
```

Bearbeiten Sie `app/api/health/route.ts` für Memory-Threshold:

```typescript
const MAX_MEMORY_PERCENT = 90  // Prozent
```

## Testing

### Lokales Testen

1. **Overload-Seite direkt testen:**
   ```
   http://localhost:3000/overload
   ```

2. **Health-Check API testen:**
   ```bash
   curl http://localhost:3000/api/health
   # Sollte Memory-Usage und Status zurückgeben
   ```

3. **Simulieren Sie Überlastung** (temporär `MAX_REQUESTS_PER_MINUTE` auf `1` setzen):

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
