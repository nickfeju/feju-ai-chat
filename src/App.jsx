import { useEffect, useState } from "react";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { InteractionStatus } from "@azure/msal-browser";
import ReactMarkdown from "react-markdown";

const FUNCTION_URL = import.meta.env.VITE_FUNCTION_URL;

const loginRequest = {
    scopes: ["User.Read"]
};

function App() {
    const { accounts, instance, inProgress } = useMsal();
    const isAuthenticated = useIsAuthenticated();

    const [question, setQuestion] = useState("");
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content:
                "Welkom bij de Féju AI Assistant. Stel een vraag over klanten, contracten, contactpersonen of open tickets in Autotask."
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
                        "Je bent niet aangemeld. Meld je eerst aan met je Féju-account."
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
                    "VITE_FUNCTION_URL ontbreekt. Controleer de GitHub Secret en de Azure Static Web Apps workflow."
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
                    "Ik heb geen antwoord ontvangen van de Féju AI Assistant."
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
                <LoginCard>
                    <LogoCircle />
                    <h1 style={styles.loginTitle}>
                        Féju AI Assistant
                    </h1>
                    <p style={styles.loginSubtitle}>
                        Aanmelden wordt verwerkt...
                    </p>
                </LoginCard>
            </FullScreenShell>
        );
    }

    if (!isAuthenticated || !currentUser) {
        return (
            <FullScreenShell>
                <LoginCard>
                    <LogoCircle />

                    <h1 style={styles.loginTitle}>
                        Féju AI Assistant
                    </h1>

                    <p style={styles.loginSubtitle}>
                        Meld je aan met je Féju-account om toegang te krijgen tot de interne AI Assistant.
                    </p>

                    <button
                        onClick={login}
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
            <div style={styles.container}>
                <header style={styles.header}>
                    <div>
                        <div style={styles.brandRow}>
                            <LogoCircle />

                            <div>
                                <h1 style={styles.title}>
                                    Féju AI Assistant
                                </h1>

                                <p style={styles.subtitle}>
                                    Vraag direct informatie op uit Autotask
                                </p>
                            </div>
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
                            style={styles.logoutButton}
                        >
                            Uitloggen
                        </button>
                    </div>
                </header>

                <main style={styles.main}>
                    <section style={styles.chatPanel}>
                        <div style={styles.chatHeader}>
                            <div>
                                <h2 style={styles.chatTitle}>
                                    Chat
                                </h2>

                                <p style={styles.chatSubtitle}>
                                    Stel vragen over klanten, tickets, contracten en contactpersonen.
                                </p>
                            </div>

                            <div style={styles.liveBadge}>
                                Live Autotask
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
                                            <div style={styles.messageLabel}>
                                                {isUser
                                                    ? "Jij"
                                                    : "Féju AI"}
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
                                        <strong>Féju AI</strong>
                                        <div style={styles.loadingText}>
                                            Antwoord wordt opgehaald...
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
                                placeholder="Bijvoorbeeld: Welke contracten heeft Hemubo?"
                                style={styles.textarea}
                            />

                            <div style={styles.inputFooter}>
                                <div style={styles.inputHint}>
                                    Tip: druk op Enter om te versturen, Shift + Enter voor een nieuwe regel.
                                </div>

                                <button
                                    onClick={askQuestion}
                                    disabled={loading || !question.trim()}
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
                            <h3 style={styles.cardTitle}>
                                Snelle acties
                            </h3>

                            <QuickPromptButton
                                label="🏢 Klantoverzicht"
                                prompt="Vertel iets over klant Hemubo"
                                onClick={useQuickPrompt}
                            />

                            <QuickPromptButton
                                label="📄 Contracten"
                                prompt="Welke contracten heeft Hemubo?"
                                onClick={useQuickPrompt}
                            />

                            <QuickPromptButton
                                label="🎫 Open tickets"
                                prompt="Welke open tickets heeft Hemubo?"
                                onClick={useQuickPrompt}
                            />

                            <QuickPromptButton
                                label="👥 Contactpersonen"
                                prompt="Wie zijn de contactpersonen van Hemubo?"
                                onClick={useQuickPrompt}
                            />

                            <QuickPromptButton
                                label="📋 Klantbriefing"
                                prompt="Maak een klantbriefing voor Hemubo"
                                onClick={useQuickPrompt}
                            />
                        </div>

                        <div style={styles.greenCard}>
                            <h3 style={styles.greenCardTitle}>
                                Waar kan ik mee helpen?
                            </h3>

                            <ul style={styles.helpList}>
                                <li>Klantinformatie ophalen</li>
                                <li>Contracten samenvatten</li>
                                <li>Open tickets bekijken</li>
                                <li>Contactpersonen tonen</li>
                                <li>Klantbriefings maken</li>
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

function LogoCircle() {
    return (
        <div style={styles.logoCircle}>
            🤖
        </div>
    );
}

function QuickPromptButton({ label, prompt, onClick }) {
    return (
        <button
            onClick={() => onClick(prompt)}
            style={styles.quickButton}
        >
            {label}
        </button>
    );
}

const styles = {
    page: {
        minHeight: "100vh",
        background:
            "linear-gradient(135deg, #f3f7f4 0%, #eef3f8 50%, #f7fafc 100%)",
        fontFamily:
            "Segoe UI, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        color: "#17202a"
    },
    container: {
        maxWidth: "1180px",
        margin: "0 auto",
        padding: "32px"
    },
    header: {
        background: "rgba(255, 255, 255, 0.92)",
        border: "1px solid rgba(15, 23, 42, 0.08)",
        borderRadius: "24px",
        padding: "28px 32px",
        boxShadow: "0 20px 45px rgba(15, 23, 42, 0.08)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "24px",
        marginBottom: "24px"
    },
    brandRow: {
        display: "flex",
        alignItems: "center",
        gap: "14px"
    },
    logoCircle: {
        width: "48px",
        height: "48px",
        borderRadius: "16px",
        background: "linear-gradient(135deg, #00a651, #63d471)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "26px",
        boxShadow: "0 12px 25px rgba(0, 166, 81, 0.25)"
    },
    title: {
        margin: 0,
        fontSize: "32px",
        letterSpacing: "-0.04em"
    },
    subtitle: {
        margin: "6px 0 0 0",
        color: "#64748b",
        fontSize: "15px"
    },
    userPanel: {
        textAlign: "right"
    },
    userLabel: {
        fontSize: "13px",
        color: "#64748b",
        marginBottom: "6px"
    },
    userName: {
        fontWeight: 700,
        marginBottom: "10px"
    },
    logoutButton: {
        border: "1px solid #d1d5db",
        background: "#ffffff",
        borderRadius: "999px",
        padding: "8px 14px",
        cursor: "pointer",
        color: "#334155",
        fontWeight: 600
    },
    main: {
        display: "grid",
        gridTemplateColumns: "1fr 320px",
        gap: "24px"
    },
    chatPanel: {
        background: "rgba(255, 255, 255, 0.94)",
        border: "1px solid rgba(15, 23, 42, 0.08)",
        borderRadius: "24px",
        boxShadow: "0 20px 45px rgba(15, 23, 42, 0.08)",
        overflow: "hidden",
        minHeight: "650px",
        display: "flex",
        flexDirection: "column"
    },
    chatHeader: {
        padding: "20px 24px",
        borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
    },
    chatTitle: {
        margin: 0,
        fontSize: "20px"
    },
    chatSubtitle: {
        margin: "4px 0 0 0",
        color: "#64748b",
        fontSize: "14px"
    },
    liveBadge: {
        background: "#e8f8ef",
        color: "#007a3d",
        borderRadius: "999px",
        padding: "8px 12px",
        fontSize: "13px",
        fontWeight: 700
    },
    messagesArea: {
        flex: 1,
        padding: "24px",
        overflowY: "auto",
        background:
            "linear-gradient(180deg, #fbfdff 0%, #f8fafc 100%)"
    },
    messageBubble: {
        maxWidth: "78%",
        padding: "16px 18px",
        lineHeight: 1.55
    },
    userBubble: {
        borderRadius: "20px 20px 4px 20px",
        background: "linear-gradient(135deg, #00a651, #23c76a)",
        color: "#ffffff",
        boxShadow: "0 14px 30px rgba(0, 166, 81, 0.25)"
    },
    assistantBubble: {
        borderRadius: "20px 20px 20px 4px",
        background: "#ffffff",
        color: "#17202a",
        boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)",
        border: "1px solid rgba(15, 23, 42, 0.08)"
    },
    messageLabel: {
        fontSize: "13px",
        fontWeight: 700,
        marginBottom: "8px",
        opacity: 0.8
    },
    loadingRow: {
        display: "flex",
        justifyContent: "flex-start",
        marginBottom: "18px"
    },
    loadingBubble: {
        background: "#ffffff",
        border: "1px solid rgba(15, 23, 42, 0.08)",
        borderRadius: "20px 20px 20px 4px",
        padding: "16px 18px",
        boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)"
    },
    loadingText: {
        marginTop: "8px",
        color: "#64748b"
    },
    inputArea: {
        padding: "20px",
        borderTop: "1px solid rgba(15, 23, 42, 0.08)",
        background: "#ffffff"
    },
    textarea: {
        width: "100%",
        resize: "vertical",
        border: "1px solid rgba(15, 23, 42, 0.16)",
        borderRadius: "18px",
        padding: "16px",
        fontSize: "15px",
        fontFamily: "inherit",
        outline: "none",
        boxSizing: "border-box"
    },
    inputFooter: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "14px",
        gap: "12px"
    },
    inputHint: {
        color: "#64748b",
        fontSize: "13px"
    },
    askButton: {
        border: "none",
        borderRadius: "999px",
        padding: "12px 22px",
        cursor: "pointer",
        background: "linear-gradient(135deg, #00a651, #23c76a)",
        color: "#ffffff",
        fontWeight: 800,
        boxShadow: "0 12px 25px rgba(0, 166, 81, 0.25)"
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
        background: "rgba(255, 255, 255, 0.94)",
        border: "1px solid rgba(15, 23, 42, 0.08)",
        borderRadius: "24px",
        padding: "22px",
        boxShadow: "0 20px 45px rgba(15, 23, 42, 0.08)"
    },
    cardTitle: {
        marginTop: 0,
        marginBottom: "12px"
    },
    quickButton: {
        width: "100%",
        textAlign: "left",
        border: "1px solid rgba(15, 23, 42, 0.10)",
        background: "#ffffff",
        borderRadius: "14px",
        padding: "12px 14px",
        marginBottom: "10px",
        cursor: "pointer",
        fontWeight: 700,
        color: "#1e293b"
    },
    greenCard: {
        background: "linear-gradient(135deg, #102a1f, #005c35)",
        color: "#ffffff",
        borderRadius: "24px",
        padding: "22px",
        boxShadow: "0 20px 45px rgba(0, 80, 45, 0.22)"
    },
    greenCardTitle: {
        marginTop: 0
    },
    helpList: {
        paddingLeft: "18px",
        lineHeight: 1.8,
        marginBottom: 0
    },
    loginPage: {
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background:
            "linear-gradient(135deg, #f3f7f4 0%, #eef3f8 50%, #f7fafc 100%)",
        fontFamily:
            "Segoe UI, system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
    },
    loginCard: {
        background: "#ffffff",
        padding: "42px",
        borderRadius: "24px",
        boxShadow: "0 20px 45px rgba(15, 23, 42, 0.12)",
        textAlign: "center",
        width: "420px",
        border: "1px solid rgba(15, 23, 42, 0.08)"
    },
    loginTitle: {
        margin: "18px 0 8px 0",
        fontSize: "30px"
    },
    loginSubtitle: {
        color: "#64748b",
        fontSize: "15px",
        lineHeight: 1.6,
        marginBottom: "24px"
    },
    loginButton: {
        background: "linear-gradient(135deg, #00a651, #23c76a)",
        color: "#ffffff",
        border: "none",
        borderRadius: "999px",
        padding: "13px 24px",
        cursor: "pointer",
        fontWeight: 800,
        boxShadow: "0 12px 25px rgba(0, 166, 81, 0.25)"
    },
    securityNote: {
        marginTop: "18px",
        color: "#64748b",
        fontSize: "13px"
    }
};

export default App;