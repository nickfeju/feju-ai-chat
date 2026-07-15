import { Icon } from "./Icons";
import { formatDateTime } from "../utils/date";

const modeLabels = {
    auto: "Automatisch",
    live: "Live Autotask",
    analytics: "Data Lake analytics",
    combined: "Gecombineerd"
};

export function SourceBadges({ mode, sources = [], dataFreshness }) {
    const normalizedSources = sources.length ? sources : [{ type: mode || "auto", label: modeLabels[mode] || modeLabels.auto }];

    return (
        <div className="source-badges">
            {normalizedSources.map((source, index) => (
                <span className="source-badge" key={`${source.type || source.label}-${index}`}>
                    <Icon name={source.type === "autotask" || source.type === "live" ? "live" : source.type === "datalake" || source.type === "analytics" ? "database" : "sparkles"} size={13} />
                    {source.label || modeLabels[source.type] || "FéjuAI"}
                    {source.sourceDate ? ` · ${source.sourceDate}` : ""}
                </span>
            ))}
            {dataFreshness?.analyticsGeneratedAt && (
                <span className="source-badge source-badge--muted">Bijgewerkt {formatDateTime(dataFreshness.analyticsGeneratedAt)}</span>
            )}
        </div>
    );
}
