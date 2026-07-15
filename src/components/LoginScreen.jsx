import logo from "../Logo-Feju-2020-kopie.png";

export function LoginScreen({ onLogin, busy = false, status = "" }) {
    return (
        <main className="login-screen">
            <section className="login-card">
                <div className="login-card__logo"><img src={logo} alt="Féju ICT Groep" /></div>
                <span className="eyebrow">Veilige consultant workspace</span>
                <h1>Welkom bij FéjuAI</h1>
                <p>Combineer actuele Autotask-informatie met historische inzichten uit de Féju Data Lake.</p>
                <button className="button button--primary button--wide" type="button" onClick={onLogin} disabled={busy}>
                    {busy ? "Aanmelding verwerken..." : "Inloggen met Microsoft"}
                </button>
                <small>{status || "Alleen geautoriseerde Féju-gebruikers krijgen toegang."}</small>
            </section>
        </main>
    );
}
