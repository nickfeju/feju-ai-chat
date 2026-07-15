# FéjuAI Static Web App

Een React/Vite consultant-workspace voor actuele Autotask-informatie en historische analytics uit Azure Data Lake.

## Inhoud

- Microsoft Entra ID-login via MSAL
- Eén chatinterface met bronmodus: automatisch, live, analytics of gecombineerd
- Gesprekscontext (laatste 8 berichten)
- Timeout/annuleren, retry, kopiëren en automatisch scrollen
- Bron- en actualiteitsbadges wanneer de backend metadata teruggeeft
- Optionele visuele responseblokken (`metric-list` en `bars`)
- Responsive zakelijke Féju-vormgeving
- Azure Static Web App navigation fallback en security headers

## Installeren

```bash
npm ci
cp .env.example .env.local
npm run dev
```

## Omgevingsvariabelen

| Variabele | Verplicht | Beschrijving |
|---|---:|---|
| `VITE_FUNCTION_URL` | ja | Centrale assistant/ask Function URL |
| `VITE_API_SCOPE` | nee | Entra API-scope voor Bearer-token |
| `VITE_ENTRA_CLIENT_ID` | ja | SPA app registration client ID |
| `VITE_ENTRA_TENANT_ID` | ja | Féju tenant ID |
| `VITE_REQUEST_TIMEOUT_MS` | nee | Standaard 60000 |
| `VITE_CONVERSATION_LIMIT` | nee | Standaard 8 |

> Zet nooit een Function key in een `VITE_...`-variabele. Alles met `VITE_` komt in de browserbundle terecht. Beveilig de Function met Entra ID/App Service Authentication of een backend-proxy.

## Verwacht requestmodel

De frontend stuurt extra velden mee maar blijft compatibel met een backend die alleen `question` gebruikt.

```json
{
  "question": "Welke klanten hebben een opvallende ticketstijging?",
  "mode": "analytics",
  "conversation": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ],
  "clientContext": {
    "timezone": "Europe/Amsterdam",
    "locale": "nl-NL"
  },
  "user": {
    "username": "...",
    "name": "..."
  }
}
```

## Aanbevolen responsemodel

Minimaal:

```json
{ "answer": "..." }
```

Uitgebreid:

```json
{
  "answer": "De analyse laat zien...",
  "mode": "combined",
  "sources": [
    { "type": "autotask", "label": "Live Autotask", "retrievedAt": "2026-07-15T16:30:00Z" },
    { "type": "datalake", "label": "Data Lake analytics", "sourceDate": "2026-07-15" }
  ],
  "dataFreshness": {
    "live": true,
    "analyticsGeneratedAt": "2026-07-15T02:04:11Z"
  },
  "presentation": {
    "type": "metric-list",
    "items": [
      { "label": "Open tickets", "value": 17 },
      { "label": "Kritiek", "value": 2 }
    ]
  }
}
```

Voor een horizontale barweergave:

```json
{
  "presentation": {
    "type": "bars",
    "items": [
      { "label": "Support", "value": 42 },
      { "label": "Projects", "value": 18 }
    ]
  }
}
```

## Aanbevolen backend-routing

- `live`: actuele Autotask API-tools
- `analytics`: gecontroleerde readers voor `analytics/*/latest.json`
- `combined`: live tools + Data Lake analytics
- `auto`: GPT-router kiest bron/tool

Laat het model niet rechtstreeks willekeurig door blobs bladeren. Bied gecontroleerde tools aan, zoals `getAnalyticsOverview`, `getCompanyStats`, `getMonthlyCompanyStats` en `getRecentAnalyticsTickets`.

## Build en controle

```bash
npm run lint
npm run build
```
