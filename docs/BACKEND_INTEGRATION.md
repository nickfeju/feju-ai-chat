# Backend-integratie voor live Autotask + Data Lake

De frontend is direct compatibel met de bestaande `ask` Function, omdat `question` ongewijzigd wordt meegestuurd. Om alle UI-functies te benutten, breid je de response stapsgewijs uit.

## Eén centrale ingang

Gebruik bij voorkeur één endpoint:

```text
POST /api/assistant
```

De router kiest op basis van `mode` en de vraag:

- `live`: Autotask API-services
- `analytics`: readers voor Data Lake datasets
- `combined`: beide bronnen
- `auto`: intent/router kiest automatisch

## Veilige Data Lake-tools

Laat OpenAI niet zelf blobpaden bedenken. Registreer gecontroleerde functies:

```js
getAnalyticsOverview()
getCompanyStats({ companyName })
getMonthlyCompanyStats({ companyName, months })
getTicketTrend({ months })
getCompanySpikes()
getQueueStats()
getRecentAnalyticsTickets({ limit })
```

Deze lezen alleen bekende bestanden zoals:

```text
analytics/overview/latest.json
analytics/company-stats/latest.json
analytics/monthly-company-stats/latest.json
analytics/company-spikes/latest.json
analytics/queue-stats/latest.json
analytics/recent-tickets/latest.json
```

## Response metadata

Voeg bronnen toe zodat de frontend transparant kan tonen waar een antwoord vandaan komt:

```js
return {
    status: 200,
    jsonBody: {
        answer,
        mode: "combined",
        sources: [
            {
                type: "autotask",
                label: "Live Autotask",
                retrievedAt: new Date().toISOString()
            },
            {
                type: "datalake",
                label: "Data Lake analytics",
                sourceDate: analytics.sourceDate
            }
        ],
        dataFreshness: {
            live: true,
            analyticsGeneratedAt: analytics.generatedAt
        }
    }
};
```

## Presentatieblokken

Voor compacte KPI's:

```js
presentation: {
    type: "metric-list",
    items: [
        { label: "Open tickets", value: 17 },
        { label: "Kritiek", value: 2 },
        { label: "Klanten", value: 36 }
    ]
}
```

Voor verdelingen:

```js
presentation: {
    type: "bars",
    items: queueStats.slice(0, 8).map(row => ({
        label: row.label || row.value,
        value: row.count
    }))
}
```

## Authenticatie

1. Expose een scope op de Function/API app registration, bijvoorbeeld `access_as_user`.
2. Voeg die scope als delegated permission toe aan de SPA app registration.
3. Stel `VITE_API_SCOPE=api://<api-client-id>/access_as_user` in.
4. Valideer tenant, issuer, audience en token op de Function App via App Service Authentication of middleware.
5. Vertrouw niet op `body.user`; dat veld is alleen voor weergave/context.
6. Plaats geen Function key in frontendconfiguratie.

## CORS

Sta alleen toe:

- de productie-URL van de Azure Static Web App;
- localhost tijdens ontwikkeling.

Gebruik geen wildcard-CORS in productie.
