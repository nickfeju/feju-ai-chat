import React from "react";
import ReactDOM from "react-dom/client";
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import App from "./App";
import { msalConfig } from "./auth/msalConfig";
import "./styles/tokens.css";
import "./styles/base.css";

const msalInstance = new PublicClientApplication(msalConfig);

async function startApp() {
    await msalInstance.initialize();
    const response = await msalInstance.handleRedirectPromise();

    if (response?.account) {
        msalInstance.setActiveAccount(response.account);
    } else {
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length) msalInstance.setActiveAccount(accounts[0]);
    }

    ReactDOM.createRoot(document.getElementById("root")).render(
        <React.StrictMode>
            <MsalProvider instance={msalInstance}>
                <App />
            </MsalProvider>
        </React.StrictMode>
    );
}

startApp().catch((error) => {
    console.error("FéjuAI kon niet starten", error);
    document.getElementById("root").innerHTML = `<main style="padding:32px;font-family:system-ui"><h1>FéjuAI kon niet starten</h1><pre>${String(error.message || error)}</pre></main>`;
});
