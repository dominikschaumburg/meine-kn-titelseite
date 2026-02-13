# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Next.js 14 web application for creating personalized newspaper cover pages. Users upload photos, which are overlaid onto templates with watermarks. The app includes:

- **Admin Panel** at `/admin` for managing campaigns
- **White-Label Configuration** via `config.json` (no restarts needed)
- **Code-Based DOI System** (works in all browsers, including in-app browsers)
- **Content Moderation** via OpenAI/LiteLLM (toggleable in admin)
- **Analytics** with time-series event tracking

**Campaign Control**: Action start/end dates are configured in Admin Settings (`/admin/settings`), not hardcoded.

## Development Commands

```bash
# Development
npm run dev          # Start dev server on http://localhost:3000

# Production
npm run build        # Build for production
npm start            # Start production server

# Linting
npm run lint         # Run ESLint
```

## Architecture

### White-Label Configuration System

Central configuration in `config.json` (root directory):

```json
{
  "version": "1.0",
  "whiteLabel": {
    "contestPrize": "Ein iPad Pro",
    "doiUrl": "https://...",
    "actionStart": "2026-01-15T00:00:00.000Z",
    "actionEnd": "2026-02-15T23:59:59.999Z",
    "moderationEnabled": true,
    "formalAddress": false,
    "metaTitle": "Meine KN-Titelseite - Bring dein Selfie auf die Titelseite",
    "metaDescription": "Erstelle deine personalisierte Kieler Nachrichten Titelseite!",
    "socialShareImage": "/assets/share-image.jpg"
  },
  "security": {
    "doiSecret": "auto-generated",
    "adminPassword": "env:ANALYTICS_PASSWORD"
  }
}
```

**Key Features:**
- Config changes apply **immediately** without restart
- Managed via Admin UI at `/admin/settings`
- API: `GET/POST /api/config` ([app/api/config/route.ts](app/api/config/route.ts))
- Loader: [lib/config.ts](lib/config.ts)

**White-Label Fields:**
- `contestPrize`: Prize description (empty = no contest mode)
- `doiUrl`: External DOI page URL (empty = direct code generation)
- `actionStart`/`actionEnd`: Campaign date range (ISO 8601)
- `moderationEnabled`: Toggle content moderation on/off
- `formalAddress`: Toggle formal "Sie" vs informal "du" in UI text ([lib/texts.ts](lib/texts.ts))
- `metaTitle`/`metaDescription`/`socialShareImage`: SEO and social media metadata

### Admin Panel

**Routes:**
- `/admin` - Dashboard with analytics
- `/admin/settings` - White-label configuration
- `/admin/templates` - Template editor

**Authentication:**
- Password-based (uses `ANALYTICS_PASSWORD` env var)
- Session stored in localStorage/sessionStorage
- Auth provider: [components/admin/AuthProvider.tsx](components/admin/AuthProvider.tsx)
- Layout: [app/admin/layout.tsx](app/admin/layout.tsx)

### DOI (Double Opt-In) System - NEW

**Code-Based Verification** (solves in-app browser issues):

1. **Code Generation**: [app/api/doi-code/generate/route.ts](app/api/doi-code/generate/route.ts)
   - HMAC-SHA256 with secret from config
   - Format: `XXXX-YYYY-ZZZZ` (12 hex chars)
   - 24-hour validity

2. **Code Validation**: [app/api/doi-code/validate/route.ts](app/api/doi-code/validate/route.ts)
   - Pattern validation (no database lookup)
   - Server-side only

3. **Storage**: [utils/storage.ts](utils/storage.ts)
   - `KNStorage.saveDOICode(code)`: Save code to localStorage
   - `KNStorage.isDOIVerified()`: Check if code is valid
   - Works cross-browser (code must be entered manually)

4. **Integration**: See [docs/doi-integration.md](docs/doi-integration.md)
   - HTML/JS snippet for external DOI page
   - Displays code with copy button

**Two Modes:**
- **With DOI URL**: Opens external page, user gets code there, enters in app
- **Without DOI URL**: App generates code directly, shows immediately

### Image Processing Flow

The app uses **dual rendering** - client-side for preview, server-side for final images:

1. **Client-side preview** ([utils/clientTemplateRenderer.ts](utils/clientTemplateRenderer.ts)):
   - Browser Canvas API renders user image + template layers
   - Used for instant preview before download
   - No server load for previews

2. **Server-side generation** ([app/api/generate-cover/route.ts](app/api/generate-cover/route.ts)):
   - Node Canvas renders final 1920x1920px JPEG
   - Applies template-specific positioning and rotation from `config.json`
   - Images stored in `storage/generated-images/` with metadata

### Template System

Templates in `templates/{id}/` directories contain:
- `config.json` (required): Defines user image position, size, and rotation
- `background.jpg/png` (optional): Base layer
- `foreground.png` (optional): Overlay layer with transparency

Example config structure:
```json
{
  "id": "1",
  "name": "Template Name",
  "userImagePosition": {
    "x": 204.8,
    "y": 792.6,
    "width": 1232.8,
    "height": 704.4,
    "rotation": -5.3
  }
}
```

The template system is implemented in [lib/templates.ts](lib/templates.ts):
- `getRandomTemplate()`: Returns a random valid template
- `getTemplateById(id)`: Returns a specific template
- Templates are validated to have a `config.json` file; background and foreground images are optional

### Content Moderation

[app/api/moderate/route.ts](app/api/moderate/route.ts):
- **Toggleable**: Checks `config.whiteLabel.moderationEnabled`
- Uses OpenAI Omni Moderation via LiteLLM proxy
- Endpoint: `https://litellm.ki.rndtech.de/v1`
- Graceful degradation on rate limits or errors (allows content without moderation)
- Tracks moderation results in `analytics.json`

### Analytics

File-based analytics in `analytics.json` (no database):
- **Counters**: page views, photo uploads, DOI completions, interactions, moderation results
- **Time-Series**: Events array with timestamps (last 30 days retained)
- **Dashboard**: `/admin` (replaced old `/analytics`)
- **Auto-Migration**: Old analytics.json automatically upgraded with events array

**API**: [app/api/analytics/route.ts](app/api/analytics/route.ts)
- `POST` - Track events (pageView, photoUpload, doiCompletion, interaction, etc.)
- `GET` - Fetch all analytics data

## Environment Variables

Required variables (see `.env.example`):
- `LITELLM_API_KEY`: LiteLLM API key for content moderation
- `ANALYTICS_PASSWORD`: Password for admin panel
- `NEXT_PUBLIC_APP_URL`: Public URL (e.g., `https://kn.meine-titelseite.de/`)
- `MAX_REQUESTS_PER_MINUTE`: Optional rate limiting

## Key Implementation Notes

### Canvas Configuration
- All canvases are fixed at **1920x1920px** regardless of viewport
- Template aspect ratio (from config) determines crop box proportions
- Default aspect ratio is calculated from template config on page load

### Image Quality
- Client-side: JPEG quality 0.95
- Server-side: Uses Sharp for high-quality processing
- Canvas externals (utf-8-validate, bufferutil) configured in `next.config.js`

### Storage Cleanup
- `ImageStorage.cleanupOldImages(maxAgeHours)` removes old generated images
- Default retention: 24 hours
- Can be called manually or via cron job

### Legal Pages
Static pages at `/agb`, `/datenschutz`, `/impressum` for terms, privacy, and imprint.

### Language System
Text rendering supports both informal ("du") and formal ("Sie") address modes:
- Controlled by `config.whiteLabel.formalAddress`
- Implementation: [lib/texts.ts](lib/texts.ts) - `getText(config, 'key')` function
- Contest-aware variants: Changes text based on whether `contestPrize` is set
- Usage in pages: `getText(appConfig, 'intro.headline')` returns appropriate variant

## Migration Guide

**Important**: The main app page ([app/page.tsx](app/page.tsx)) requires manual updates for config integration. See [docs/MIGRATION.md](docs/MIGRATION.md) for:
- Config loading on mount
- Dynamic `isActionActive` calculation
- DOI code input UI
- Combined download/share button
- Contest prize display

## Deployment

Configured for Railway deployment:
1. Set environment variables in Railway dashboard
2. Ensure `config.json` exists (auto-created on first run)
3. Git push triggers auto-deploy
4. Custom domain configured via Railway

## Troubleshooting

### Config Not Loading
- Check `config.json` exists in root directory
- Verify JSON is valid (use `node -e "JSON.parse(require('fs').readFileSync('config.json'))"`)
- Check API endpoint: `curl http://localhost:3000/api/config`

### Admin Panel Login Fails
- Verify `ANALYTICS_PASSWORD` environment variable
- Default password: `kn2025analytics` (if env var not set)
- Clear localStorage/sessionStorage and retry

### DOI Codes Not Working
- Check `config.security.doiSecret` is at least 16 chars
- Test generation: `curl -X POST http://localhost:3000/api/doi-code/generate -H "Content-Type: application/json" -d '{"sessionId":"test"}'`
- Test validation: `curl -X POST http://localhost:3000/api/doi-code/validate -H "Content-Type: application/json" -d '{"code":"XXXX-YYYY-ZZZZ"}'`

### Template Not Loading
- Verify `config.json` exists in template directory
- Check background/foreground files exist (optional but commonly used)
- Check console logs for template loading errors in [lib/templates.ts](lib/templates.ts)

### Moderation Not Working
- Check `config.whiteLabel.moderationEnabled` is true
- Verify LiteLLM API key and endpoint availability
- Review graceful degradation in [app/api/moderate/route.ts](app/api/moderate/route.ts)
- Moderation failures allow content by default (fail-open)

### Canvas Rendering Issues
- Verify template config coordinates are within 1920x1920 bounds
- Check rotation values (in degrees, can be negative)
- Use admin template editor to visually debug positioning

## Documentation

- **DOI Integration**: [docs/doi-integration.md](docs/doi-integration.md) - External DOI page setup
- **Migration Guide**: [docs/MIGRATION.md](docs/MIGRATION.md) - app/page.tsx changes needed
- **Implementation Plan**: `.claude/plans/` - Detailed architecture decisions

## Dependencies

Key packages:
- `next@14.0.0` - Framework
- `react-image-crop@^11.0.10` - Crop UI
- `react-chartjs-2@^5.2.0` - Analytics charts (for future time-series display)
- `chart.js@^4.4.0` - Chart library
- `sharp@^0.32.6` - Server-side image processing
- `canvas@^2.11.2` - Server-side canvas rendering
- `openai@^4.20.1` - Moderation API client
