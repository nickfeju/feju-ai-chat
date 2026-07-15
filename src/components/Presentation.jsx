export function Presentation({ presentation }) {
    if (!presentation) return null;

    if (presentation.type === "metric-list" && Array.isArray(presentation.items)) {
        return (
            <div className="metric-grid">
                {presentation.items.map((item) => (
                    <div className="metric-card" key={item.label}>
                        <span>{item.label}</span>
                        <strong>{item.value}</strong>
                        {item.change && <small>{item.change}</small>}
                    </div>
                ))}
            </div>
        );
    }

    if (presentation.type === "bars" && Array.isArray(presentation.items)) {
        const max = Math.max(...presentation.items.map((item) => Number(item.value) || 0), 1);
        return (
            <div className="bar-list">
                {presentation.items.map((item) => (
                    <div className="bar-row" key={item.label}>
                        <span>{item.label}</span>
                        <div className="bar-track"><i style={{ width: `${((Number(item.value) || 0) / max) * 100}%` }} /></div>
                        <strong>{item.value}</strong>
                    </div>
                ))}
            </div>
        );
    }

    return null;
}
