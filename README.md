# FéjuAI Static Web App

De webapp gebruikt één centrale Azure Function (`/api/ask`) voor:

- live Autotask-vragen;
- historische Data Lake-analytics;
- gecombineerde klantvragen;
- financiële analytics;
- ticketintake via chat.

## Lokaal starten

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Minimale configuratie:

```env
VITE_FUNCTION_URL=https://<function-app>.azurewebsites.net/api/ask
VITE_REQUEST_TIMEOUT_MS=40000
```

## Ticketintake

Kies **Ticket intake**. De chat vraagt om e-mailadres, titel en omschrijving. Na een samenvatting moet de gebruiker expliciet bevestigen. De backend matcht het e-mailadres met een Autotask Contact en gebruikt diens `companyID` en `contactID` voor het nieuwe ticket.

## Zware analyses

Een normale browserrequest wordt bewust na circa 40 seconden afgebroken. Grote historische imports lopen niet via de webapp, maar via de queue-gebaseerde backfill-endpoints van de Function App.
