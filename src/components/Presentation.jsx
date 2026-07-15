function MetricList({ items }) {
    return (
        <div className="metric-grid">
            {items.map((item) => (
                <div className="metric-card" key={item.label}>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                    {item.change && <small>{item.change}</small>}
                </div>
            ))}
        </div>
    );
}

function BarList({ items }) {
    const max = Math.max(...items.map((item) => Number(item.value) || 0), 1);
    return (
        <div className="bar-list">
            {items.map((item) => (
                <div className="bar-row" key={item.label}>
                    <span>{item.label}</span>
                    <div className="bar-track">
                        <i style={{ width: `${((Number(item.value) || 0) / max) * 100}%` }} />
                    </div>
                    <strong>{item.displayValue || item.value}</strong>
                </div>
            ))}
        </div>
    );
}

function TicketList({ items }) {
    return (
        <div className="ticket-result-list">
            {items.map((ticket) => (
                <div className={`ticket-result-card ${ticket.isCritical ? "ticket-result-card--critical" : ""}`} key={ticket.id || ticket.ticketNumber}>
                    <div className="ticket-result-card__top">
                        <strong>{ticket.ticketNumber || ticket.id}</strong>
                        {ticket.isCritical && <span className="ticket-critical-badge">Kritiek</span>}
                    </div>
                    <p>{ticket.title}</p>
                    <small>{[ticket.priorityName, ticket.statusName, ticket.queueName].filter(Boolean).join(" · ")}</small>
                </div>
            ))}
        </div>
    );
}

export function Presentation({ presentation }) {
    if (!presentation) return null;
    const items = Array.isArray(presentation.items) ? presentation.items : [];
    if (!items.length) return null;

    if (presentation.type === "metric-list") return <MetricList items={items} />;
    if (["bars", "bar-list"].includes(presentation.type)) return <BarList items={items} />;
    if (presentation.type === "ticket-list") return <TicketList items={items} />;
    return null;
}
