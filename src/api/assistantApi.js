import { appConfig } from "../config";

function normalizeConversation(messages) {
    return messages
        .filter((message) => ["user", "assistant"].includes(message.role))
        .slice(-appConfig.conversationLimit)
        .map(({ role, content }) => ({ role, content }));
}

export async function askAssistant({
    token,
    question,
    mode,
    messages,
    user,
    signal
}) {
    if (!appConfig.functionUrl) {
        throw new Error("VITE_FUNCTION_URL ontbreekt. Voeg deze toe aan je Static Web App configuratie.");
    }

    const headers = {
        "Content-Type": "application/json"
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(appConfig.functionUrl, {
        method: "POST",
        headers,
        signal,
        body: JSON.stringify({
            question,
            mode,
            conversation: normalizeConversation(messages),
            clientContext: {
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                locale: navigator.language
            },
            user: {
                username: user?.username || "",
                name: user?.name || ""
            }
        })
    });

    const text = await response.text();
    const body = (() => {
        try {
            return text ? JSON.parse(text) : null;
        } catch {
            return null;
        }
    })();

    if (!response.ok) {
        throw new Error(body?.error || body?.message || `De API gaf status ${response.status}: ${text}`);
    }

    if (!body) {
        throw new Error("De API gaf geen geldige JSON terug.");
    }

    return {
        answer: body.answer || body.message || "Ik heb geen antwoord ontvangen.",
        mode: body.mode || body.intent || mode,
        sources: Array.isArray(body.sources) ? body.sources : [],
        dataFreshness: body.dataFreshness || null,
        presentation: body.presentation || null,
        raw: body
    };
}
