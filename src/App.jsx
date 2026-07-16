import { useCallback, useMemo, useState } from "react";
import { InteractionRequiredAuthError, InteractionStatus } from "@azure/msal-browser";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { appConfig } from "./config";
import { loginRequest } from "./auth/msalConfig";
import { useAssistant } from "./hooks/useAssistant";
import { useAutoScroll } from "./hooks/useAutoScroll";
import { getGreeting } from "./utils/date";
import { AppHeader } from "./components/AppHeader";
import { QuickActions } from "./components/QuickActions";
import { DataStatus } from "./components/DataStatus";
import { ChatMessage } from "./components/ChatMessage";
import { ChatComposer } from "./components/ChatComposer";
import { LoginScreen } from "./components/LoginScreen";
import { WelcomeDashboard } from "./components/WelcomeDashboard";
import { ExecutiveStart } from "./components/ExecutiveStart";
import "./styles/app.css";

export default function App() {
    const { accounts, instance, inProgress } = useMsal();
    const isAuthenticated = useIsAuthenticated();
    const [question, setQuestion] = useState("");
    const [mode, setMode] = useState("auto");

    const currentUser = instance.getActiveAccount() || accounts[0] || null;
    const displayName = useMemo(() => currentUser?.name?.split("|")[0]?.trim() || currentUser?.username?.split("@")[0] || "Féju-collega", [currentUser]);

    const acquireApiToken = useCallback(async () => {
        if (!appConfig.apiScope || !currentUser) return "";

        try {
            const response = await instance.acquireTokenSilent({
                scopes: [appConfig.apiScope],
                account: currentUser
            });
            return response.accessToken;
        } catch (error) {
            if (error instanceof InteractionRequiredAuthError) {
                const response = await instance.acquireTokenPopup({
                    scopes: [appConfig.apiScope],
                    account: currentUser
                });
                return response.accessToken;
            }
            throw error;
        }
    }, [currentUser, instance]);

    const assistant = useAssistant({ acquireApiToken, user: currentUser });
    const endRef = useAutoScroll(assistant.messages.length, assistant.loading);

    const login = async () => instance.loginRedirect(loginRequest);
    const logout = async () => instance.logoutRedirect({
        account: currentUser,
        postLogoutRedirectUri: window.location.origin
    });

    const send = async () => {
        const value = question.trim();
        if (!value) return;
        setQuestion("");
        await assistant.send({ question: value, mode });
    };

    const selectQuickAction = (action) => {
        setMode(action.mode);
        setQuestion(action.prompt);
    };

    if (inProgress !== InteractionStatus.None) {
        return <LoginScreen onLogin={login} busy status={`Microsoft-aanmelding: ${inProgress}`} />;
    }

    if (!isAuthenticated || !currentUser) {
        return <LoginScreen onLogin={login} />;
    }

    return (
        <div className="app-shell">
            <AppHeader user={currentUser} onLogout={logout} onNewChat={assistant.newChat} />

            <main className="workspace">
                <aside className="workspace__sidebar">
                    <div className="welcome-block">
                        <span className="eyebrow">{getGreeting()}</span>
                        <h1>{displayName}, wat wil je weten?</h1>
                        <p>Gebruik live Autotask-data, historische Data Lake-analytics of combineer beide.</p>
                    </div>
                    <QuickActions onSelect={selectQuickAction} activeMode={mode} />
                    <DataStatus />
                </aside>

                <section className="chat-panel" aria-label="FéjuAI chat">
                    <header className="chat-panel__header">
                        <div>
                            <span className="eyebrow">Assistant</span>
                            <h2>Van vraag naar inzicht en actie</h2>
                        </div>
                        <span className="connection-badge"><i /> Autotask + Data Lake</span>
                    </header>

                    <div className="chat-panel__messages">
                        {assistant.messages.length === 1 && (
                            <><ExecutiveStart onSelect={selectQuickAction} /><WelcomeDashboard onSelect={selectQuickAction} /></>
                        )}
                        {assistant.messages.map((message, index) => (
                            <ChatMessage
                                key={message.id}
                                message={message}
                                onRetry={message.role === "assistant" && index === assistant.messages.length - 1 ? assistant.retryLast : null}
                                onAction={selectQuickAction}
                            />
                        ))}

                        {assistant.loading && (
                            <div className="typing-row">
                                <span className="assistant-avatar">fé</span>
                                <div className="typing-bubble"><i /><i /><i /><span>Informatie ophalen en analyseren...</span></div>
                            </div>
                        )}
                        <div ref={endRef} />
                    </div>

                    {assistant.error && <div className="error-banner">{assistant.error}</div>}

                    <ChatComposer
                        question={question}
                        onQuestionChange={setQuestion}
                        mode={mode}
                        onModeChange={setMode}
                        loading={assistant.loading}
                        onSend={send}
                        onCancel={assistant.cancel}
                    />
                </section>
            </main>
        </div>
    );
}
