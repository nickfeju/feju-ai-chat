export const appConfig = {
    functionUrl: import.meta.env.VITE_FUNCTION_URL || "",
    apiScope: import.meta.env.VITE_API_SCOPE || "",
    tenantId: import.meta.env.VITE_ENTRA_TENANT_ID || "d8e80c75-af0c-4d17-a7a5-4849d64af1c5",
    clientId: import.meta.env.VITE_ENTRA_CLIENT_ID || "59c65b43-60e0-4c9f-87f9-4a005a51fa54",
    requestTimeoutMs: Number(import.meta.env.VITE_REQUEST_TIMEOUT_MS || 40000),
    conversationLimit: Number(import.meta.env.VITE_CONVERSATION_LIMIT || 12),
    appName: "FéjuAI"
};

export const dataModes = [
    { value: "auto", label: "AI", icon: "sparkles", description: "FéjuAI kiest automatisch de juiste bron en route" },
    { value: "live", label: "Live", icon: "live", description: "Actuele informatie rechtstreeks uit Autotask" },
    { value: "analytics", label: "Analytics", icon: "chart", description: "Historische ticket- en financiële analyses uit het Data Lake" },
    { value: "combined", label: "Combinatie", icon: "layers", description: "Live klantbeeld gecombineerd met historische context" }
];

export const modePlaceholders = {
    auto: "Stel je vraag; FéjuAI kiest automatisch de juiste bron...",
    live: "Bijvoorbeeld: welke open tickets heeft Hemubo?",
    analytics: "Bijvoorbeeld: welke vijf klanten hebben in 2026 de meeste tickets?",
    combined: "Bijvoorbeeld: maak een complete klantbriefing voor Hemubo."
};
