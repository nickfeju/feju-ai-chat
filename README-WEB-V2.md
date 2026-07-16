# FéjuAI Web V2

Deze versie sluit de webapp aan op Router V4, historische ticketanalytics, financiële YTD-analytics en Ticket Intake V3.

## Vernieuwd

- snelle acties gegroepeerd in Klanten, Tickets & operatie, Financieel en Acties;
- acties worden gefilterd op de gekozen modus;
- nieuwe compacte modusselector: AI, Live, Analytics en Combinatie;
- dynamische placeholder per modus;
- startdashboard met vier duidelijke ingangen;
- rijkere KPI-, bar- en ticketpresentaties;
- conversatielimiet verhoogd naar 12 voor betere vervolgvragen;
- responsieve verbeteringen voor tablet en mobiel.

## Installatie

```powershell
npm install
npm run build
```

## Configuratie

De bestaande `.env`-instellingen blijven geldig. Controleer minimaal:

```text
VITE_FUNCTION_URL
VITE_API_SCOPE
VITE_ENTRA_TENANT_ID
VITE_ENTRA_CLIENT_ID
```

## Acceptatietest

1. `Welke klanten hebben deze maand de meeste tickets?`
2. `Maak een top 5`
3. `Geef me een actueel klantoverzicht van Hemubo`
4. `Wie zijn de belangrijkste contactpersonen van Hemubo?`
5. `Geef een algemeen overzicht van omzet, winst en brutomarge`
6. `Ik wil een nieuw ticket melden`
