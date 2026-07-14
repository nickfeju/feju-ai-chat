import { useState } from "react";
import { useMsal } from "@azure/msal-react";
import ReactMarkdown from "react-markdown";

const FUNCTION_URL = import.meta.env.VITE_FUNCTION_URL;

console.log("========== APP START ==========");
console.log("import.meta.env:", import.meta.env);
console.log("VITE_FUNCTION_URL:", import.meta.env.VITE_FUNCTION_URL);
console.log("FUNCTION_URL:", FUNCTION_URL);

function App() {
    const { accounts, instance } = useMsal();

    const [question, setQuestion] = useState("");
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content:
                "Welkom bij de Féju AI Assistant. Stel een vraag over klanten, contracten, contactpersonen of open tickets in Autotask."
        }
    ]);
    const [loading, setLoading] = useState(false);

    const currentUser = accounts[0];

    const logout = async () => {
        await instance.logoutPopup();
    };

    const askQuestion = async () => {
        const trimmedQuestion = question.trim();

        if (!trimmedQuestion) {
            return;
        }

        console.log("========== QUESTION ==========");
        console.log("Question:", trimmedQuestion);
        console.log("FUNCTION_URL before fetch:", FUNCTION_URL);

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
                console.error("FUNCTION_URL is undefined or empty.");

                throw new Error(
                    "FUNCTION_URL is undefined. Controleer of VITE_FUNCTION_URL correct is ingesteld tijdens de Azure Static Web App build."
                );
            }

            console.log("========== FETCH START ==========");
            console.log("Calling URL:", FUNCTION_URL);

            const response = await fetch(
                FUNCTION_URL,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        question: trimmedQuestion
                    })
                }
            );

            console.log("========== FETCH RESPONSE ==========");
            console.log("Response status:", response.status);
            console.log("Response ok:", response.ok);
            console.log("Response url:", response.url);
            console.log("Response type:", response.type);
            console.log("Response redirected:", response.redirected);

            const responseText = await response.text();

            console.log("Response body:");
            console.log(responseText);

            if (!response.ok) {
                throw new Error(
                    `Azure Function gaf status ${response.status}: ${responseText}`
                );
            }

            let data;

            try {
                data = JSON.parse(responseText);
            } catch (jsonError) {
                console.error("Kon response niet als JSON parsen:", jsonError);

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
            console.error("========== ERROR ==========");
            console.error(error);

            setMessages((previousMessages) => [
                ...previousMessages,
                {
                    role: "assistant",
                    content:
                        "Er ging iets mis bij het ophalen van het antwoord.\n\n" +
                        `**Foutmelding:** ${error.message}\n\n` +
                        `**Debug:** FUNCTION_URL = ${FUNCTION_URL || "undefined"}`
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

    return (
        <div
            style={{
                minHeight: "100vh",
                background:
                    "linear-gradient(135deg, #f3f7f4 0%, #eef3f8 50%, #f7fafc 100%)",
                fontFamily:
                    "Segoe UI, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
                color: "#17202a"
            }}
        >
            <div
                style={{
                    maxWidth: "1180px",
                    margin: "0 auto",
                    padding: "32px"
                }}
            >
                <header
                    style={{
                        background: "rgba(255, 255, 255, 0.92)",
                        border: "1px solid rgba(15, 23, 42, 0.08)",
                        borderRadius: "24px",
                        padding: "28px 32px",
                        boxShadow:
                            "0 20px 45px rgba(15, 23, 42, 0.08)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "24px",
                        marginBottom: "24px"
                    }}
                >
                    <div>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "14px"
                            }}
                        >
                            <div
                                style={{
                                    width: "48px",
                                    height: "48px",
                                    borderRadius: "16px",
                                    background:
                                        "linear-gradient(135deg, #00a651, #63d471)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "26px",
                                    boxShadow:
                                        "0 12px 25px rgba(0, 166, 81, 0.25)"
                                }}
                            >
                                🤖
                            </div>

                            <div>
                                <h1
                                    style={{
                                        margin: 0,
                                        fontSize: "32px",
                                        letterSpacing: "-0.04em"
                                    }}
                                >
                                    Féju AI Assistant
                                </h1>

                                <p
                                    style={{
                                        margin: "6px 0 0 0",
                                        color: "#64748b",
                                        fontSize: "15px"
                                    }}
                                >
                                    Vraag direct informatie op uit Autotask
                                </p>
                            </div>
                        </div>
                    </div>

                    <div
                        style={{
                            textAlign: "right"
                        }}
                    >
                        <div
                            style={{
                                fontSize: "13px",
                                color: "#64748b",
                                marginBottom: "6px"
                            }}
                        >
                            Ingelogd als
                        </div>

                        <div
                            style={{
                                fontWeight: 700,
                                marginBottom: "10px"
                            }}
                        >
                            {currentUser?.username || "Onbekende gebruiker"}
                        </div>

                        <button
                            onClick={logout}
                            style={{
                                border: "1px solid #d1d5db",
                                background: "#ffffff",
                                borderRadius: "999px",
                                padding: "8px 14px",
                                cursor: "pointer",
                                color: "#334155",
                                fontWeight: 600
                            }}
                        >
                            Uitloggen
                        </button>
                    </div>
                </header>

                <main
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 320px",
                        gap: "24px"
                    }}
                >
                    <section
                        style={{
                            background: "rgba(255, 255, 255, 0.94)",
                            border: "1px solid rgba(15, 23, 42, 0.08)",
                            borderRadius: "24px",
                            boxShadow:
                                "0 20px 45px rgba(15, 23, 42, 0.08)",
                            overflow: "hidden",
                            minHeight: "650px",
                            display: "flex",
                            flexDirection: "column"
                        }}
                    >
                        <div
                            style={{
                                padding: "20px 24px",
                                borderBottom:
                                    "1px solid rgba(15, 23, 42, 0.08)",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center"
                            }}
                        >
                            <div>
                                <h2
                                    style={{
                                        margin: 0,
                                        fontSize: "20px"
                                    }}
                                >
                                    Chat
                                </h2>

                                <p
                                    style={{
                                        margin: "4px 0 0 0",
                                        color: "#64748b",
                                        fontSize: "14px"
                                    }}
                                >
                                    Stel vragen over klanten, tickets,
                                    contracten en contactpersonen.
                                </p>
                            </div>

                            <div
                                style={{
                                    background: "#e8f8ef",
                                    color: "#007a3d",
                                    borderRadius: "999px",
                                    padding: "8px 12px",
                                    fontSize: "13px",
                                    fontWeight: 700
                                }}
                            >
                                Live Autotask
                            </div>
                        </div>

                        <div
                            style={{
                                flex: 1,
                                padding: "24px",
                                overflowY: "auto",
                                background:
                                    "linear-gradient(180deg, #fbfdff 0%, #f8fafc 100%)"
                            }}
                        >
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
                                                maxWidth: "78%",
                                                borderRadius: isUser
                                                    ? "20px 20px 4px 20px"
                                                    : "20px 20px 20px 4px",
                                                padding: "16px 18px",
                                                background: isUser
                                                    ? "linear-gradient(135deg, #00a651, #23c76a)"
                                                    : "#ffffff",
                                                color: isUser
                                                    ? "#ffffff"
                                                    : "#17202a",
                                                boxShadow: isUser
                                                    ? "0 14px 30px rgba(0, 166, 81, 0.25)"
                                                    : "0 12px 30px rgba(15, 23, 42, 0.08)",
                                                border: isUser
                                                    ? "none"
                                                    : "1px solid rgba(15, 23, 42, 0.08)",
                                                lineHeight: 1.55
                                            }}
                                        >
                                            <div
                                                style={{
                                                    fontSize: "13px",
                                                    fontWeight: 700,
                                                    marginBottom: "8px",
                                                    opacity: 0.8
                                                }}
                                            >
                                                {isUser
                                                    ? "Jij"
                                                    : "Féju AI"}
                                            </div>

                                            {isUser ? (
                                                <div>
                                                    {message.content}
                                                </div>
                                            ) : (
                                                <div
                                                    className="markdown-body"
                                                >
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
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "flex-start",
                                        marginBottom: "18px"
                                    }}
                                >
                                    <div
                                        style={{
                                            background: "#ffffff",
                                            border:
                                                "1px solid rgba(15, 23, 42, 0.08)",
                                            borderRadius:
                                                "20px 20px 20px 4px",
                                            padding: "16px 18px",
                                            boxShadow:
                                                "0 12px 30px rgba(15, 23, 42, 0.08)"
                                        }}
                                    >
                                        <strong>Féju AI</strong>
                                        <div
                                            style={{
                                                marginTop: "8px",
                                                color: "#64748b"
                                            }}
                                        >
                                            Antwoord wordt opgehaald...
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div
                            style={{
                                padding: "20px",
                                borderTop:
                                    "1px solid rgba(15, 23, 42, 0.08)",
                                background: "#ffffff"
                            }}
                        >
                            <textarea
                                rows={4}
                                value={question}
                                onChange={(event) =>
                                    setQuestion(event.target.value)
                                }
                                onKeyDown={handleKeyDown}
                                placeholder="Bijvoorbeeld: Welke contracten heeft Hemubo?"
                                style={{
                                    width: "100%",
                                    resize: "vertical",
                                    border:
                                        "1px solid rgba(15, 23, 42, 0.16)",
                                    borderRadius: "18px",
                                    padding: "16px",
                                    fontSize: "15px",
                                    fontFamily: "inherit",
                                    outline: "none",
                                    boxSizing: "border-box"
                                }}
                            />

                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginTop: "14px",
                                    gap: "12px"
                                }}
                            >
                                <div
                                    style={{
                                        color: "#64748b",
                                        fontSize: "13px"
                                    }}
                                >
                                    Tip: druk op Enter om te versturen,
                                    Shift + Enter voor een nieuwe regel.
                                </div>

                                <button
                                    onClick={askQuestion}
                                    disabled={loading || !question.trim()}
                                    style={{
                                        border: "none",
                                        borderRadius: "999px",
                                        padding: "12px 22px",
                                        cursor:
                                            loading || !question.trim()
                                                ? "not-allowed"
                                                : "pointer",
                                        background:
                                            loading || !question.trim()
                                                ? "#cbd5e1"
                                                : "linear-gradient(135deg, #00a651, #23c76a)",
                                        color: "#ffffff",
                                        fontWeight: 800,
                                        boxShadow:
                                            loading || !question.trim()
                                                ? "none"
                                                : "0 12px 25px rgba(0, 166, 81, 0.25)"
                                    }}
                                >
                                    {loading
                                        ? "Bezig..."
                                        : "Vraag stellen"}
                                </button>
                            </div>
                        </div>
                    </section>

                    <aside
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "18px"
                        }}
                    >
                        <div
                            style={{
                                background: "rgba(255, 255, 255, 0.94)",
                                border:
                                    "1px solid rgba(15, 23, 42, 0.08)",
                                borderRadius: "24px",
                                padding: "22px",
                                boxShadow:
                                    "0 20px 45px rgba(15, 23, 42, 0.08)"
                            }}
                        >
                            <h3
                                style={{
                                    marginTop: 0,
                                    marginBottom: "12px"
                                }}
                            >
                                Snelle acties
                            </h3>

                            <QuickPromptButton
                                label="Klantoverzicht"
                                prompt="Vertel iets over klant Hemubo"
                                onClick={useQuickPrompt}
                            />

                            <QuickPromptButton
                                label="Contracten"
                                prompt="Welke contracten heeft Hemubo?"
                                onClick={useQuickPrompt}
                            />

                            <QuickPromptButton
                                label="Open tickets"
                                prompt="Welke open tickets heeft Hemubo?"
                                onClick={useQuickPrompt}
                            />

                            <QuickPromptButton
                                label="Contactpersonen"
                                prompt="Wie zijn de contactpersonen van Hemubo?"
                                onClick={useQuickPrompt}
                            />

                            <QuickPromptButton
                                label="Klantbriefing"
                                prompt="Maak een klantbriefing voor Hemubo"
                                onClick={useQuickPrompt}
                            />
                        </div>

                        <div
                            style={{
                                background:
                                    "linear-gradient(135deg, #102a1f, #005c35)",
                                color: "#ffffff",
                                borderRadius: "24px",
                                padding: "22px",
                                boxShadow:
                                    "0 20px 45px rgba(0, 80, 45, 0.22)"
                            }}
                        >
                            <h3
                                style={{
                                    marginTop: 0
                                }}
                            >
                                Waar kan ik mee helpen?
                            </h3>

                            <ul
                                style={{
                                    paddingLeft: "18px",
                                    lineHeight: 1.8,
                                    marginBottom: 0
                                }}
                            >
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

function QuickPromptButton({ label, prompt, onClick }) {
    return (
        <button
            onClick={() => onClick(prompt)}
            style={{
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
            }}
        >
            {label}
        </button>
    );
}

export default App;