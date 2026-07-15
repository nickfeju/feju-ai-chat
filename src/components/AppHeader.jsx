import { Icon } from "./Icons";
import logo from "../Logo-Feju-2020-kopie.png";

export function AppHeader({ user, onLogout, onNewChat }) {
    const displayName = user?.name?.split("|")[0]?.trim() || user?.username?.split("@")[0] || "Féju-collega";

    return (
        <header className="app-header">
            <div className="app-header__brand">
                <div className="brand-mark"><img src={logo} alt="Féju ICT Groep" /></div>
                <div>
                    <strong>FéjuAI</strong>
                    <span>Consultant workspace</span>
                </div>
            </div>

            <div className="app-header__actions">
                <button className="button button--ghost" type="button" onClick={onNewChat}>
                    <Icon name="plus" size={18} /> Nieuwe chat
                </button>
                <div className="user-chip">
                    <span className="user-chip__avatar">{displayName.slice(0, 1).toUpperCase()}</span>
                    <span className="user-chip__text">
                        <strong>{displayName}</strong>
                        <small>{user?.username || "Aangemeld"}</small>
                    </span>
                </div>
                <button className="icon-button" type="button" onClick={onLogout} aria-label="Uitloggen" title="Uitloggen">
                    <Icon name="logout" size={19} />
                </button>
            </div>
        </header>
    );
}
