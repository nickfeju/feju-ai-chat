import { Icon } from "./Icons";

const starters = [
    { icon: "building", title: "Klantinformatie", text: "Actueel klantbeeld, contactpersonen, contracten en services.", mode: "live", prompt: "Geef me een actueel klantoverzicht van Hemubo" },
    { icon: "ticket", title: "Tickets", text: "Open meldingen, trends, queues, issues en klantvolume.", mode: "analytics", prompt: "Welke vijf klanten hebben in 2026 de meeste tickets?" },
    { icon: "money", title: "Financieel", text: "Omzet, brutowinst, marge en winstgevendheid.", mode: "analytics", prompt: "Geef een algemeen overzicht van omzet, winst en brutomarge" },
    { icon: "plus", title: "Nieuw ticket", text: "Een klantvriendelijke intake die alleen vraagt wat nog ontbreekt.", mode: "auto", prompt: "Ik wil een nieuw ticket melden" }
];

export function WelcomeDashboard({ onSelect }) {
    return (
        <section className="welcome-dashboard" aria-label="Startpunten">
            <div className="welcome-dashboard__intro">
                <span className="eyebrow">Wat kan FéjuAI voor je doen?</span>
                <h3>Kies een startpunt of stel direct je eigen vraag.</h3>
            </div>
            <div className="starter-grid">
                {starters.map((starter) => (
                    <button key={starter.title} className="starter-card" type="button" onClick={() => onSelect(starter)}>
                        <span className="starter-card__icon"><Icon name={starter.icon} size={22} /></span>
                        <span>
                            <strong>{starter.title}</strong>
                            <small>{starter.text}</small>
                        </span>
                        <Icon name="chevron" size={16} />
                    </button>
                ))}
            </div>
        </section>
    );
}
