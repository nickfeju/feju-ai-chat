import { useEffect, useMemo, useState } from "react";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { InteractionStatus } from "@azure/msal-browser";
import ReactMarkdown from "react-markdown";
import fejuLogo from "./Logo-Feju-2020-kopie.png";

const FUNCTION_URL = import.meta.env.VITE_FUNCTION_URL;

const loginRequest = {
    scopes: ["User.Read"]
};

const quickActions = [
    {
        icon: "🏢",
        title: "Klantoverzicht",
        description: "Basisgegevens, SLA en bijzonderheden",
        prompt: "Geef me een klantoverzicht van Hemubo"
    },
    {
        icon: "📄",
        title: "Contracten",
        description: "Contracten en afspraken samenvatten",
        prompt: "Welke contracten heeft Hemubo?"
    },
    {
        icon: "🛠️",
        title: "Services",
        description: "Afgenomen diensten inzichtelijk maken",
        prompt: "Welke diensten nemen ze af bij Hemubo?"
    },
    {
        icon: "🛡️",
        title: "Microsoft licenties",
        description: "Licenties en aantallen bekijken",
        prompt: "Welke Microsoft licenties heeft Hemubo?"
    },
    {
        icon: "⚙️",
        title: "Managed services",
        description: "Beheerafspraken analyseren",
        prompt: "Welke managed services nemen ze af bij Hemubo?"
    },
    {
        icon: "🎫",
        title: "Open tickets",
        description: "Lopende tickets en aandachtspunten",
        prompt: "Welke open tickets heeft Hemubo?"
    },
    {
        icon: "👥",
        title: "Contactpersonen",
        description: "Belangrijke contacten bij de klant",
        prompt: "Wie zijn de contactpersonen van Hemubo?"
    },
    {
        icon: "📋",
        title: "Klantbriefing",
        description: "Voorbereiding voor klantgesprek",
        prompt: "Maak een klantbriefing voor Hemubo"
    }
];

function App() {
    const { accounts, instance, inProgress } = useMsal();
    const isAuthenticated = useIsAuthenticated();

    const [question, setQuestion] = useState("");
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content:
                "Goedemorgen, welkom bij FéjuAI. Ik help je met klantinformatie, contracten, services, Microsoft licenties, contactpersonen en open tickets uit Autotask. Waar kan ik mee helpen?"
        }
    ]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (accounts.length > 0 && !instance.getActiveAccount()) {
            instance.setActiveAccount(accounts[0]);
        }
    }, [accounts, instance]);

    const currentUser =
        instance.getActiveAccount() ||
        accounts[0] ||
        null;

    const displayName = useMemo(() => {
        if (!currentUser) return "Féju collega";

        if (currentUser.name) {
            return currentUser.name.split("|")[0].trim();
        }

        if (currentUser.username) {
            return currentUser.username.split("@")[0];
        }

        return "Féju collega";
    }, [currentUser]);

    const greeting = useMemo(() => {
        const hour = new Date().getHours();

        if (hour < 12) return "Goedemorgen";
        if (hour < 18) return "Goedemiddag";

        return "Goedenavond";
    }, []);

    const login = async () => {
        try {
            await instance.loginRedirect(loginRequest);
        } catch (error) {
            console.error("Login mislukt:", error);
        }
    };

    const logout = async () => {
        try {
            await instance.logoutRedirect({
                account: currentUser,
                postLogoutRedirectUri: window.location.origin
            });
        } catch (error) {
            console.error("Logout mislukt:", error);
        }
    };

    const askQuestion = async () => {
        const trimmedQuestion = question.trim();

        if (!trimmedQuestion) {
            return;
        }

        if (!isAuthenticated || !currentUser) {
            setMessages((previousMessages) => [
                ...previousMessages,
                {
                    role: "assistant",
                    content:
                        "Je bent nog niet aangemeld. Meld je eerst aan met je Féju-account, dan help ik je verder."
                }
            ]);

            return;
        }

        const userMessage = {
            role: "user",
            content: trimmedQuestion
        };

        setMessages((previousMessages) => [
            ...previousMessages,
            userMessage
        ]);

        setQuestion("");
        setLoading(true);

        try {
            if (!FUNCTION_URL) {
                throw new Error(
                    "VITE_FUNCTION_URL ontbreekt. Controleer je GitHub Secret en de Azure Static Web Apps workflow."
                );
            }

            const response = await fetch(
                FUNCTION_URL,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        question: trimmedQuestion,
                        user: {
                            username: currentUser?.username || "",
                            name: currentUser?.name || ""
                        }
                    })
                }
            );

            const responseText = await response.text();

            if (!response.ok) {
                throw new Error(
                    `Azure Function gaf status ${response.status}: ${responseText}`
                );
            }

            let data;

            try {
                data = JSON.parse(responseText);
            } catch {
                throw new Error(
                    "De Azure Function gaf geen geldige JSON terug: " +
                    responseText
                );
            }

            const assistantMessage = {
                role: "assistant",
                content:
                    data.answer ||
                    "Ik heb geen antwoord ontvangen van FéjuAI."
            };

            setMessages((previousMessages) => [
                ...previousMessages,
                assistantMessage
            ]);
        } catch (error) {
            console.error("Fout bij ophalen antwoord:", error);

            setMessages((previousMessages) => [
                ...previousMessages,
                {
                    role: "assistant",
                    content:
                        "Er ging iets mis bij het ophalen van het antwoord.\n\n" +
                        `**Foutmelding:** ${error.message}`
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            askQuestion();
        }
    };

    const useQuickPrompt = (prompt) => {
        setQuestion(prompt);
    };

    if (inProgress !== InteractionStatus.None) {
        return (
            <FullScreenShell>
                <BrandStyle />

                <LoginCard>
                    <LogoMark />

                    <h1 style={styles.loginTitle}>
                        FéjuAI
                    </h1>

                    <p style={styles.loginSubtitle}>
                        Je aanmelding wordt verwerkt.
                    </p>

                    <p style={styles.securityNote}>
                        MSAL-status: {String(inProgress)}
                    </p>
                </LoginCard>
            </FullScreenShell>
        );
    }

    if (!isAuthenticated || !currentUser) {
        return (
            <FullScreenShell>
                <BrandStyle />

                <LoginCard>
                    <LogoMark />

                    <h1 style={styles.loginTitle}>
                        Welkom bij FéjuAI
                    </h1>

                    <p style={styles.loginSubtitle}>
                        Je digitale Féju-collega voor klantinformatie,
                        contracten, tickets, services en licenties uit Autotask.
                    </p>

                    <button
                        onClick={login}
                        className="primary-button"
                        style={styles.loginButton}
                    >
                        Inloggen met Microsoft
                    </button>

                    <p style={styles.securityNote}>
                        Alleen geautoriseerde Féju-gebruikers krijgen toegang.
                    </p>
                </LoginCard>
            </FullScreenShell>
        );
    }

    return (
        <div style={styles.page}>
            <BrandStyle />

            <div style={styles.topBar}>
                <div style={styles.topBarInner}>
                    <div style={styles.miniNav}>
                        <span>Diensten</span>
                        <span>Klantverhalen</span>
                        <span>Over ons</span>
                    </div>

                    <LogoWordmark />

                    <div style={styles.miniNav}>
                        <span>Nieuws en blogs</span>
                        <span>Werken bij</span>
                    </div>
                </div>
            </div>

            <div style={styles.brandBand} />

            <div style={styles.container}>
                <section style={styles.heroCard}>
                    <div style={styles.heroLeft}>
                        <div style={styles.brandRow}>
                            <LogoMark />

                            <div>
                                <div style={styles.eyebrow}>
                                    Verbonden met Autotask
                                </div>

                                <h1 style={styles.title}>
                                    FéjuAI
                                </h1>
                            </div>
                        </div>

                        <p style={styles.heroText}>
                            {greeting} {displayName}. Stel direct vragen over klanten,
                            contracten, tickets, Microsoft licenties en contactpersonen.
                        </p>

                        <div style={styles.heroActions}>
                            <button
                                type="button"
                                className="primary-button"
                                style={styles.heroPrimaryButton}
                                onClick={() =>
                                    setQuestion("Maak een klantbriefing voor Hemubo")
                                }
                            >
                                Maak klantbriefing
                            </button>

                            <button
                                type="button"
                                className="secondary-button"
                                style={styles.heroSecondaryButton}
                                onClick={() =>
                                    setQuestion("Welke open tickets heeft Hemubo?")
                                }
                            >
                                Bekijk open tickets
                            </button>
                        </div>
                    </div>

                    <div style={styles.userPanel}>
                        <div style={styles.userLabel}>
                            Ingelogd als
                        </div>

                        <div style={styles.userName}>
                            {currentUser?.username || "Onbekende gebruiker"}
                        </div>

                        <button
                            onClick={logout}
                            className="secondary-button"
                            style={styles.logoutButton}
                        >
                            Uitloggen
                        </button>
                    </div>
                </section>

                <main style={styles.main} className="main-grid">
                    <section style={styles.chatPanel}>
                        <div style={styles.chatHeader}>
                            <div>
                                <div style={styles.sectionKicker}>
                                    Chat
                                </div>

                                <h2 style={styles.chatTitle}>
                                    Waar kan ik je mee helpen?
                                </h2>

                                <p style={styles.chatSubtitle}>
                                    Vraag bijvoorbeeld naar klantinformatie, contracten,
                                    diensten, licenties, contactpersonen of openstaande tickets.
                                </p>
                            </div>

                            <div style={styles.liveBadge}>
                                <span style={styles.statusDot} />
                                Live Féju Data
                            </div>
                        </div>

                        <div style={styles.messagesArea}>
                            {messages.map((message, index) => {
                                const isUser = message.role === "user";

                                return (
                                    <div
                                        key={index}
                                        style={{
                                            display: "flex",
                                            justifyContent: isUser
                                                ? "flex-end"
                                                : "flex-start",
                                            marginBottom: "18px"
                                        }}
                                    >
                                        <div
                                            style={{
                                                ...styles.messageBubble,
                                                ...(isUser
                                                    ? styles.userBubble
                                                    : styles.assistantBubble)
                                            }}
                                        >
                                            <div style={styles.messageMeta}>
                                                {!isUser && (
                                                    <span style={styles.smallAvatar}>
                                                        fé
                                                    </span>
                                                )}

                                                <span style={styles.messageLabel}>
                                                    {isUser
                                                        ? "Jij"
                                                        : "FéjuAI"}
                                                </span>
                                            </div>

                                            {isUser ? (
                                                <div>
                                                    {message.content}
                                                </div>
                                            ) : (
                                                <div className="markdown-body">
                                                    <ReactMarkdown>
                                                        {message.content}
                                                    </ReactMarkdown>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            {loading && (
                                <div style={styles.loadingRow}>
                                    <div style={styles.loadingBubble}>
                                        <div style={styles.messageMeta}>
                                            <span style={styles.smallAvatar}>
                                                fé
                                            </span>

                                            <strong>
                                                FéjuAI
                                            </strong>
                                        </div>

                                        <div style={styles.loadingText}>
                                            Ik haal de informatie voor je op...
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={styles.inputArea}>
                            <textarea
                                rows={4}
                                value={question}
                                onChange={(event) =>
                                    setQuestion(event.target.value)
                                }
                                onKeyDown={handleKeyDown}
                                placeholder="Bijvoorbeeld: geef me een overzicht van klant Paridaans"
                                style={styles.textarea}
                            />

                            <div style={styles.inputFooter}>
                                <div style={styles.inputHint}>
                                    Enter = versturen · Shift + Enter = nieuwe regel
                                </div>

                                <button
                                    onClick={askQuestion}
                                    disabled={loading || !question.trim()}
                                    className="primary-button"
                                    style={{
                                        ...styles.askButton,
                                        ...(loading || !question.trim()
                                            ? styles.askButtonDisabled
                                            : {})
                                    }}
                                >
                                    {loading
                                        ? "Bezig..."
                                        : "Vraag stellen"}
                                </button>
                            </div>
                        </div>
                    </section>

                    <aside style={styles.sidebar}>
                        <div style={styles.card}>
                            <div style={styles.cardHeader}>
                                <div>
                                    <div style={styles.sectionKicker}>
                                        Snel starten
                                    </div>

                                    <h3 style={styles.cardTitle}>
                                        Snelle acties
                                    </h3>
                                </div>
                            </div>

                            <div style={styles.quickGrid}>
                                {quickActions.map((action) => (
                                    <QuickPromptTile
                                        key={action.title}
                                        icon={action.icon}
                                        title={action.title}
                                        description={action.description}
                                        prompt={action.prompt}
                                        onClick={useQuickPrompt}
                                    />
                                ))}
                            </div>
                        </div>

                        <div style={styles.greenCard}>
                            <div style={styles.greenCardEyebrow}>
                                FéjuAI kan helpen met
                            </div>

                            <h3 style={styles.greenCardTitle}>
                                Minder zoeken, sneller klantinzicht.
                            </h3>

                            <ul style={styles.helpList}>
                                <li>Klantinformatie ophalen</li>
                                <li>Contracten samenvatten</li>
                                <li>Services en licenties bekijken</li>
                                <li>Managed services analyseren</li>
                                <li>Open tickets bekijken</li>
                                <li>Klantbriefings voorbereiden</li>
                            </ul>
                        </div>
                    </aside>
                </main>
            </div>
        </div>
    );
}

function FullScreenShell({ children }) {
    return (
        <div style={styles.loginPage}>
            {children}
        </div>
    );
}

function LoginCard({ children }) {
    return (
        <div style={styles.loginCard}>
            {children}
        </div>
    );
}

function LogoMark() {
    return (
        <div style={styles.logoMark}>
            <img
                src={fejuLogo}
                alt="Féju ICT Groep"
                style={styles.logoImage}
            />
        </div>
    );
}

function LogoWordmark() {
    return (
        <div style={styles.logoWordmark}>
            <div style={styles.logoText}>
                féju
            </div>

            <div style={styles.logoSubText}>
                ICT GROEP
            </div>
        </div>
    );
}

function QuickPromptTile({ icon, title, description, prompt, onClick }) {
    return (
        <button
            type="button"
            onClick={() => onClick(prompt)}
            className="quick-tile"
            style={styles.quickTile}
        >
            <span style={styles.quickIcon}>
                {icon}
            </span>

            <span style={styles.quickContent}>
                <span style={styles.quickTitle}>
                    {title}
                </span>

                <span style={styles.quickDescription}>
                    {description}
                </span>
            </span>
        </button>
    );
}

function BrandStyle() {
    return (
        <style>
            {`
                * {
                    box-sizing: border-box;
                }

                body {
                    margin: 0;
                }

                .primary-button {
                    transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
                }

                .primary-button:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 16px 30px rgba(136, 163, 27, 0.28);
                }

                .secondary-button {
                    transition: background 0.18s ease, border-color 0.18s ease, transform 0.18s ease;
                }

                .secondary-button:hover {
                    background: #f7faf0;
                    border-color: #9bb31d;
                    transform: translateY(-1px);
                }

                .quick-tile {
                    transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease, background 0.18s ease;
                }

                .quick-tile:hover {
                    transform: translateY(-2px);
                    border-color: rgba(151, 175, 30, 0.55) !important;
                    background: #fbfdf3 !important;
                    box-shadow: 0 12px 26px rgba(15, 23, 42, 0.08);
                }

                .markdown-body p:first-child {
                    margin-top: 0;
                }

                .markdown-body p:last-child {
                    margin-bottom: 0;
                }

                .markdown-body ul {
                    margin-top: 8px;
                    margin-bottom: 8px;
                }

                .markdown-body a {
                    color: #6f850d;
                    font-weight: 700;
                }

                @media (max-width: 980px) {
                    .main-grid {
                        grid-template-columns: 1fr !important;
                    }
                }

                @media (max-width: 720px) {
                    .mini-nav-hidden {
                        display: none;
                    }
                }
            `}
        </style>
    );
}

const colors = {
    fejuGreen: "#9bb31d",
    fejuGreenDark: "#6f850d",
    fejuGreenSoft: "#f4f8df",
    deepGreen: "#004932",
    deepGreen2: "#00613f",
    text: "#17202a",
    muted: "#687385",
    border: "rgba(15, 23, 42, 0.09)",
    page: "#f4f7f5",
    white: "#ffffff"
};

const styles = {
    page: {
        minHeight: "100vh",
        background:
            "linear-gradient(135deg, #f6f8f3 0%, #eef4f2 48%, #f9faf7 100%)",
        fontFamily:
            "Segoe UI, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        color: colors.text
    },
    topBar: {
        background: colors.white,
        borderBottom: "1px solid rgba(15, 23, 42, 0.06)"
    },
    topBarInner: {
        maxWidth: "1240px",
        margin: "0 auto",
        padding: "18px 32px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "24px"
    },
    miniNav: {
        display: "flex",
        alignItems: "center",
        gap: "34px",
        color: "#262b2f",
        fontSize: "14px",
        fontWeight: 600
    },
    logoWordmark: {
        textAlign: "center",
        minWidth: "110px",
        lineHeight: 1
    },
    logoText: {
        color: "#111111",
        fontSize: "34px",
        fontWeight: 400,
        letterSpacing: "-0.08em"
    },
    logoSubText: {
        color: "#8b8f95",
        fontSize: "11px",
        letterSpacing: "0.05em",
        marginTop: "3px"
    },
    brandBand: {
        height: "190px",
        background: colors.fejuGreen,
        marginBottom: "-140px"
    },
    container: {
        maxWidth: "1240px",
        margin: "0 auto",
        padding: "0 32px 40px 32px",
        position: "relative"
    },
    heroCard: {
        background: "rgba(255, 255, 255, 0.96)",
        border: `1px solid ${colors.border}`,
        borderRadius: "26px",
        padding: "30px 34px",
        boxShadow: "0 24px 55px rgba(15, 23, 42, 0.10)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "28px",
        marginBottom: "24px"
    },
    heroLeft: {
        flex: 1
    },
    brandRow: {
        display: "flex",
        alignItems: "center",
        gap: "16px"
    },
    logoMark: {
    width: "220px",
    height: "80px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
    },
    logoImage: {
    width: "100%",
    height: "100%",
    objectFit: "contain"
    },
    eyebrow: {
        color: colors.fejuGreenDark,
        fontSize: "13px",
        fontWeight: 800,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        marginBottom: "4px"
    },
    title: {
        margin: 0,
        fontSize: "36px",
        letterSpacing: "-0.04em",
        color: "#111827"
    },
    heroText: {
        margin: "18px 0 0 0",
        maxWidth: "720px",
        color: "#475569",
        fontSize: "17px",
        lineHeight: 1.65
    },
    heroActions: {
        display: "flex",
        gap: "12px",
        marginTop: "22px",
        flexWrap: "wrap"
    },
    heroPrimaryButton: {
        border: "none",
        borderRadius: "999px",
        padding: "13px 20px",
        cursor: "pointer",
        background:
            "linear-gradient(135deg, #9bb31d 0%, #819714 100%)",
        color: colors.white,
        fontWeight: 800
    },
    heroSecondaryButton: {
        border: "1px solid rgba(151, 175, 30, 0.45)",
        background: colors.white,
        borderRadius: "999px",
        padding: "12px 18px",
        cursor: "pointer",
        color: "#334155",
        fontWeight: 800
    },
    userPanel: {
        textAlign: "right",
        minWidth: "260px"
    },
    userLabel: {
        fontSize: "13px",
        color: colors.muted,
        marginBottom: "7px"
    },
    userName: {
        fontWeight: 800,
        marginBottom: "12px",
        color: "#111827",
        overflowWrap: "anywhere"
    },
    logoutButton: {
        border: "1px solid rgba(15, 23, 42, 0.13)",
        background: colors.white,
        borderRadius: "999px",
        padding: "9px 16px",
        cursor: "pointer",
        color: "#334155",
        fontWeight: 700
    },
    main: {
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) 360px",
        gap: "24px"
    },
    chatPanel: {
        background: "rgba(255, 255, 255, 0.96)",
        border: `1px solid ${colors.border}`,
        borderRadius: "26px",
        boxShadow: "0 24px 55px rgba(15, 23, 42, 0.08)",
        overflow: "hidden",
        minHeight: "680px",
        display: "flex",
        flexDirection: "column"
    },
    chatHeader: {
        padding: "24px 26px",
        borderBottom: `1px solid ${colors.border}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "20px",
        background:
            "linear-gradient(180deg, #ffffff 0%, #fbfdf7 100%)"
    },
    sectionKicker: {
        color: colors.fejuGreenDark,
        fontSize: "12px",
        fontWeight: 900,
        textTransform: "uppercase",
        letterSpacing: "0.09em",
        marginBottom: "6px"
    },
    chatTitle: {
        margin: 0,
        fontSize: "24px",
        letterSpacing: "-0.03em"
    },
    chatSubtitle: {
        margin: "7px 0 0 0",
        color: colors.muted,
        fontSize: "14px",
        lineHeight: 1.55
    },
    liveBadge: {
        background: colors.fejuGreenSoft,
        color: colors.fejuGreenDark,
        borderRadius: "999px",
        padding: "9px 13px",
        fontSize: "13px",
        fontWeight: 900,
        display: "flex",
        alignItems: "center",
        whiteSpace: "nowrap",
        gap: "8px"
    },
    statusDot: {
        width: "9px",
        height: "9px",
        borderRadius: "999px",
        background: colors.fejuGreen,
        boxShadow: "0 0 0 4px rgba(155, 179, 29, 0.16)"
    },
    messagesArea: {
        flex: 1,
        padding: "26px",
        overflowY: "auto",
        background:
            "radial-gradient(circle at top left, rgba(155, 179, 29, 0.08), transparent 34%), linear-gradient(180deg, #fbfcf8 0%, #f8faf7 100%)"
    },
    messageBubble: {
        maxWidth: "78%",
        padding: "17px 19px",
        lineHeight: 1.58,
        fontSize: "15px"
    },
    userBubble: {
        borderRadius: "22px 22px 6px 22px",
        background:
            "linear-gradient(135deg, #8ca418 0%, #acc533 100%)",
        color: colors.white,
        boxShadow: "0 16px 34px rgba(136, 163, 27, 0.24)"
    },
    assistantBubble: {
        borderRadius: "22px 22px 22px 6px",
        background: colors.white,
        color: colors.text,
        boxShadow: "0 14px 34px rgba(15, 23, 42, 0.08)",
        border: `1px solid ${colors.border}`
    },
    messageMeta: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginBottom: "9px"
    },
    smallAvatar: {
        width: "24px",
        height: "24px",
        borderRadius: "8px",
        background: colors.fejuGreenSoft,
        color: colors.fejuGreenDark,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "12px",
        fontWeight: 900,
        letterSpacing: "-0.06em"
    },
    messageLabel: {
        fontSize: "13px",
        fontWeight: 800,
        opacity: 0.86
    },
    loadingRow: {
        display: "flex",
        justifyContent: "flex-start",
        marginBottom: "18px"
    },
    loadingBubble: {
        background: colors.white,
        border: `1px solid ${colors.border}`,
        borderRadius: "22px 22px 22px 6px",
        padding: "17px 19px",
        boxShadow: "0 14px 34px rgba(15, 23, 42, 0.08)"
    },
    loadingText: {
        marginTop: "8px",
        color: colors.muted
    },
    inputArea: {
        padding: "20px",
        borderTop: `1px solid ${colors.border}`,
        background: colors.white
    },
    textarea: {
        width: "100%",
        resize: "vertical",
        border: "1px solid rgba(15, 23, 42, 0.16)",
        borderRadius: "20px",
        padding: "16px",
        fontSize: "15px",
        fontFamily: "inherit",
        outline: "none",
        color: colors.text,
        background: "#ffffff",
        boxSizing: "border-box"
    },
    inputFooter: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "14px",
        gap: "12px",
        flexWrap: "wrap"
    },
    inputHint: {
        color: colors.muted,
        fontSize: "13px"
    },
    askButton: {
        border: "none",
        borderRadius: "999px",
        padding: "12px 22px",
        cursor: "pointer",
        background:
            "linear-gradient(135deg, #9bb31d 0%, #819714 100%)",
        color: colors.white,
        fontWeight: 900,
        boxShadow: "0 12px 25px rgba(136, 163, 27, 0.23)"
    },
    askButtonDisabled: {
        background: "#cbd5e1",
        cursor: "not-allowed",
        boxShadow: "none"
    },
    sidebar: {
        display: "flex",
        flexDirection: "column",
        gap: "18px"
    },
    card: {
        background: "rgba(255, 255, 255, 0.96)",
        border: `1px solid ${colors.border}`,
        borderRadius: "26px",
        padding: "22px",
        boxShadow: "0 24px 55px rgba(15, 23, 42, 0.08)"
    },
    cardHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "14px"
    },
    cardTitle: {
        margin: 0,
        fontSize: "22px",
        letterSpacing: "-0.03em"
    },
    quickGrid: {
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: "11px"
    },
    quickTile: {
        width: "100%",
        textAlign: "left",
        border: `1px solid ${colors.border}`,
        background: colors.white,
        borderRadius: "18px",
        padding: "14px",
        cursor: "pointer",
        color: "#1e293b",
        display: "flex",
        gap: "12px",
        alignItems: "flex-start"
    },
    quickIcon: {
        width: "34px",
        height: "34px",
        borderRadius: "12px",
        background: colors.fejuGreenSoft,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0
    },
    quickContent: {
        display: "flex",
        flexDirection: "column",
        gap: "3px"
    },
    quickTitle: {
        fontSize: "14px",
        fontWeight: 900
    },
    quickDescription: {
        fontSize: "12px",
        color: colors.muted,
        lineHeight: 1.4
    },
    greenCard: {
        background:
            "linear-gradient(135deg, #003d2b 0%, #00613f 58%, #7f9915 145%)",
        color: colors.white,
        borderRadius: "26px",
        padding: "24px",
        boxShadow: "0 24px 55px rgba(0, 73, 50, 0.24)"
    },
    greenCardEyebrow: {
        color: "#dbeaa2",
        fontSize: "12px",
        fontWeight: 900,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        marginBottom: "8px"
    },
    greenCardTitle: {
        marginTop: 0,
        marginBottom: "14px",
        fontSize: "23px",
        letterSpacing: "-0.04em",
        lineHeight: 1.18
    },
    helpList: {
        paddingLeft: "18px",
        lineHeight: 1.85,
        marginBottom: 0,
        color: "#f6ffe0"
    },
    loginPage: {
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background:
            "linear-gradient(135deg, #f6f8f3 0%, #eef4f2 48%, #f9faf7 100%)",
        fontFamily:
            "Segoe UI, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        padding: "24px"
    },
    loginCard: {
        background: colors.white,
        padding: "44px",
        borderRadius: "28px",
        boxShadow: "0 24px 55px rgba(15, 23, 42, 0.12)",
        textAlign: "center",
        width: "440px",
        maxWidth: "100%",
        border: `1px solid ${colors.border}`
    },
    loginTitle: {
        margin: "20px 0 8px 0",
        fontSize: "32px",
        letterSpacing: "-0.04em"
    },
    loginSubtitle: {
        color: colors.muted,
        fontSize: "15px",
        lineHeight: 1.65,
        marginBottom: "24px"
    },
    loginButton: {
        background:
            "linear-gradient(135deg, #9bb31d 0%, #819714 100%)",
        color: colors.white,
        border: "none",
        borderRadius: "999px",
        padding: "13px 24px",
        cursor: "pointer",
        fontWeight: 900,
        boxShadow: "0 12px 25px rgba(136, 163, 27, 0.24)"
    },
    securityNote: {
        marginTop: "18px",
        color: colors.muted,
        fontSize: "13px"
    }
};

export default App;