import { Icon } from "./Icons";

export function DataStatus() {
    return (
        <section className="side-card data-status">
            <div className="side-card__heading">
                <span>Datastatus</span>
                <small>Beschikbare bronnen</small>
            </div>
            <div className="status-row">
                <span className="status-row__icon status-row__icon--live"><Icon name="live" size={17} /></span>
                <span><strong>Live Autotask</strong><small>Actuele operationele data</small></span>
                <i className="status-dot" />
            </div>
            <div className="status-row">
                <span className="status-row__icon"><Icon name="database" size={17} /></span>
                <span><strong>Data Lake analytics</strong><small>Nightly snapshots en trends</small></span>
                <i className="status-dot" />
            </div>
            <p className="status-note">De backend bepaalt in de automatische modus welke bron het beste bij je vraag past.</p>
        </section>
    );
}
