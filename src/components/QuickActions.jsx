import { Icon } from "./Icons";

const actions = [
    { icon: "building", mode: "live", title: "Klantoverzicht", description: "Actuele klantinformatie", prompt: "Geef me een actueel klantoverzicht van Hemubo" },
    { icon: "ticket", mode: "live", title: "Open tickets", description: "Lopende meldingen en risico's", prompt: "Welke open tickets heeft Hemubo en welke zijn kritiek?" },
    { icon: "users", mode: "live", title: "Contactpersonen", description: "Belangrijke contacten", prompt: "Wie zijn de belangrijkste contactpersonen van Hemubo?" },
    { icon: "file", mode: "combined", title: "Klantbriefing", description: "Live situatie met historie", prompt: "Maak een klantbriefing voor Hemubo en vergelijk met de historische tickettrend" },
    { icon: "chart", mode: "analytics", title: "Tickettrend", description: "Ontwikkeling per maand", prompt: "Laat de tickettrend per maand zien" },
    { icon: "sparkles", mode: "analytics", title: "Stijgende klanten", description: "Detecteer opvallende pieken", prompt: "Welke klanten hebben een opvallende ticketstijging?" },
    { icon: "database", mode: "analytics", title: "Top queues", description: "Verdeling vanuit Data Lake", prompt: "Welke queues kregen de meeste tickets?" },
    { icon: "live", mode: "combined", title: "Klantontwikkeling", description: "Actueel versus historisch", prompt: "Geef de actuele situatie van Hemubo en vergelijk deze met de afgelopen maanden" }
];

export function QuickActions({ onSelect }) {
    return (
        <section className="side-card">
            <div className="side-card__heading">
                <span>Snelle acties</span>
                <small>Kies een startpunt</small>
            </div>
            <div className="quick-actions">
                {actions.map((action) => (
                    <button key={action.title} type="button" className="quick-action" onClick={() => onSelect(action)}>
                        <span className="quick-action__icon"><Icon name={action.icon} size={19} /></span>
                        <span className="quick-action__content">
                            <strong>{action.title}</strong>
                            <small>{action.description}</small>
                        </span>
                        <Icon name="chevron" size={16} />
                    </button>
                ))}
            </div>
        </section>
    );
}
