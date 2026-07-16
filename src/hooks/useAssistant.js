import { useCallback, useRef, useState } from "react";
import { askAssistant } from "../api/assistantApi";
import { appConfig } from "../config";

const welcomeMessage = {
    id: crypto.randomUUID(),
    role: "assistant",
    content: "Welkom bij **FéjuAI**. Vraag naar actuele Autotask-informatie, historische trends uit de Data Lake of combineer beide voor een complete klantbriefing.",
    mode: "auto",
    sources: []
};

export function useAssistant({ acquireApiToken, user }) {
    const [messages, setMessages] = useState([welcomeMessage]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const abortRef = useRef(null);

    const send = useCallback(async ({ question, mode = "auto" }) => {
        const trimmed = question.trim();
        if (!trimmed || loading) return;

        const userMessage = {
            id: crypto.randomUUID(),
            role: "user",
            content: trimmed,
            mode
        };

        const history = [...messages, userMessage];
        setMessages(history);
        setError("");
        setLoading(true);

        const controller = new AbortController();
        abortRef.current = controller;
        const timeout = window.setTimeout(() => controller.abort(), appConfig.requestTimeoutMs);

        try {
            const token = await acquireApiToken();
            const result = await askAssistant({
                token,
                question: trimmed,
                mode,
                messages: history,
                user,
                signal: controller.signal
            });

            setMessages((previous) => [
                ...previous,
                {
                    id: crypto.randomUUID(),
                    role: "assistant",
                    content: result.answer,
                    mode: result.mode,
                    sources: result.sources,
                    dataFreshness: result.dataFreshness,
                    presentation: result.presentation,
                    data: result.data,
                    raw: result.raw
                }
            ]);
        } catch (requestError) {
            const message = requestError.name === "AbortError"
                ? "De analyse duurde langer dan de webrequest toestaat. Probeer een specifiekere vraag of gebruik een Data Lake-analyse."
                : requestError.message;

            setError(message);
            setMessages((previous) => [
                ...previous,
                {
                    id: crypto.randomUUID(),
                    role: "assistant",
                    content: `Er ging iets mis.\n\n**Foutmelding:** ${message}`,
                    mode,
                    sources: []
                }
            ]);
        } finally {
            window.clearTimeout(timeout);
            abortRef.current = null;
            setLoading(false);
        }
    }, [acquireApiToken, loading, messages, user]);

    const cancel = useCallback(() => abortRef.current?.abort(), []);
    const newChat = useCallback(() => {
        cancel();
        setMessages([{ ...welcomeMessage, id: crypto.randomUUID() }]);
        setError("");
    }, [cancel]);

    const retryLast = useCallback(() => {
        const lastUserMessage = [...messages].reverse().find((message) => message.role === "user");
        if (lastUserMessage) {
            send({ question: lastUserMessage.content, mode: lastUserMessage.mode || "auto" });
        }
    }, [messages, send]);

    return { messages, loading, error, send, cancel, newChat, retryLast };
}
