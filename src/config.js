export const appConfig = {
    functionUrl: import.meta.env.VITE_FUNCTION_URL || "",
    apiScope: import.meta.env.VITE_API_SCOPE || "",
    tenantId: import.meta.env.VITE_ENTRA_TENANT_ID || "d8e80c75-af0c-4d17-a7a5-4849d64af1c5",
    clientId: import.meta.env.VITE_ENTRA_CLIENT_ID || "59c65b43-60e0-4c9f-87f9-4a005a51fa54",
    requestTimeoutMs: Number(import.meta.env.VITE_REQUEST_TIMEOUT_MS || 40000),
    conversationLimit: Number(import.meta.env.VITE_CONVERSATION_LIMIT || 8),
    appName: "FéjuAI"
};

export const dataModes = [
    { value: "auto", label: "Automatisch", description: "FéjuAI kiest de juiste bron" },
    { value: "live", label: "Live Autotask", description: "Actuele klant- en ticketinformatie" },
    { value: "analytics", label: "Historie & trends", description: "Analytics uit de Data Lake" },
    { value: "combined", label: "Gecombineerd", description: "Live situatie met historische context" }
];
