import { useMemo, useState } from "react";
import { Icon } from "./Icons";

const groups = [
    {
        id: "customer",
        label: "Klanten",
        icon: "building",
        actions: [
            { icon: "building", mode: "live", title: "Klantoverzicht", description: "Actuele klantinformatie", prompt: "Geef me een actueel klantoverzicht van Hemubo" },
            { icon: "file", mode: "combined", title: "Klantbriefing", description: "Live situatie en historie", prompt: "Maak een complete klantbriefing voor Hemubo" },
            { icon: "users", mode: "live", title: "Contactpersonen", description: "Belangrijke klantcontacten", prompt: "Wie zijn de belangrijkste contactpersonen van Hemubo?" },
            { icon: "contract", mode: "live", title: "Contracten", description: "Actieve contracten", prompt: "Welke actieve contracten heeft Hemubo?" },
            { icon: "services", mode: "live", title: "Services & licenties", description: "Actuele dienstverlening", prompt: "Welke services en licenties heeft Hemubo?" }
        ]
    },
    {
        id: "tickets",
        label: "Tickets & operatie",
        icon: "ticket",
        actions: [
            { icon: "ticket", mode: "live", title: "Open tickets", description: "Lopende meldingen per klant", prompt: "Welke open tickets heeft Hemubo?" },
            { icon: "alert", mode: "live", title: "Kritieke tickets", description: "Actuele kritieke meldingen", prompt: "Welke kritieke tickets heeft Hemubo?" },
            { icon: "chart", mode: "analytics", title: "Tickettrend", description: "Ontwikkeling per maand", prompt: "Laat de ticketontwikkeling per maand in 2026 zien" },
            { icon: "ranking", mode: "analytics", title: "Topklanten", description: "Hoogste ticketvolume", prompt: "Welke vijf klanten hebben in 2026 de meeste tickets?" },
            { icon: "database", mode: "analytics", title: "Top queues", description: "Verdeling over queues", prompt: "Welke queues bevatten de meeste tickets?" },
            { icon: "issues", mode: "analytics", title: "Issue-analyse", description: "Meest voorkomende problemen", prompt: "Welke issuecategorieën komen het vaakst voor?" },
            { icon: "sparkles", mode: "analytics", title: "Stijgende klanten", description: "Opvallende ticketpieken", prompt: "Welke klanten hebben een opvallende stijging in ticketvolume?" }
        ]
    },
    {
        id: "finance",
        label: "Financieel",
        icon: "money",
        actions: [
            { icon: "money", mode: "analytics", title: "Omzet & marge", description: "YTD financieel overzicht", prompt: "Geef een algemeen overzicht van omzet, winst en brutomarge" },
            { icon: "chart", mode: "analytics", title: "Omzetontwikkeling", description: "Omzet per maand", prompt: "Hoe ontwikkelt de omzet zich per maand in 2026?" },
            { icon: "building", mode: "analytics", title: "Winst per klant", description: "Klantwinstgevendheid", prompt: "Welke vijf klanten hebben de hoogste brutowinst?" },
            { icon: "contract", mode: "analytics", title: "Winst per contract", description: "Contractwinstgevendheid", prompt: "Welke contracten hebben de hoogste brutowinst?" },
            { icon: "services", mode: "analytics", title: "Winst per service", description: "Servicewinstgevendheid", prompt: "Welke services hebben de hoogste marge?" }
        ]
    },
    {
        id: "actions",
        label: "Acties",
        icon: "plus",
        actions: [
            { icon: "plus", mode: "auto", title: "Nieuw ticket melden", description: "Klantvriendelijke intake", prompt: "Ik wil een nieuw ticket melden" }
        ]
    }
];

export function QuickActions({ onSelect, activeMode = "auto" }) {
    const [activeGroup, setActiveGroup] = useState("customer");
    const visibleGroups = useMemo(() => {
        if (activeMode === "live") return groups.filter((group) => ["customer", "tickets", "actions"].includes(group.id));
        if (activeMode === "analytics") return groups.filter((group) => ["tickets", "finance"].includes(group.id));
        if (activeMode === "combined") return groups.filter((group) => group.id === "customer");
        return groups;
    }, [activeMode]);

    const current = visibleGroups.find((group) => group.id === activeGroup) || visibleGroups[0];

    return (
        <section className="side-card quick-actions-card">
            <div className="side-card__heading">
                <span>Snelle acties</span>
                <small>Afgestemd op je modus</small>
            </div>

            <div className="quick-action-tabs" role="tablist" aria-label="Snelle acties categorieën">
                {visibleGroups.map((group) => (
                    <button
                        key={group.id}
                        type="button"
                        role="tab"
                        aria-selected={current?.id === group.id}
                        className={`quick-action-tab ${current?.id === group.id ? "is-active" : ""}`}
                        onClick={() => setActiveGroup(group.id)}
                    >
                        <Icon name={group.icon} size={15} />
                        <span>{group.label}</span>
                    </button>
                ))}
            </div>

            <div className="quick-actions">
                {current?.actions.map((action) => (
                    <button key={action.title} type="button" className="quick-action" onClick={() => onSelect(action)}>
                        <span className="quick-action__icon"><Icon name={action.icon} size={19} /></span>
                        <span className="quick-action__content">
                            <strong>{action.title}</strong>
                            <small>{action.description}</small>
                        </span>
                        <span className="quick-action__mode">{action.mode === "analytics" ? "Data Lake" : action.mode === "live" ? "Live" : action.mode === "combined" ? "Combi" : "AI"}</span>
                    </button>
                ))}
            </div>
        </section>
    );
}
