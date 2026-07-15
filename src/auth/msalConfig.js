import { appConfig } from "../config";

export const msalConfig = {
    auth: {
        clientId: appConfig.clientId,
        authority: `https://login.microsoftonline.com/${appConfig.tenantId}`,
        redirectUri: window.location.origin,
        postLogoutRedirectUri: window.location.origin,
        navigateToLoginRequestUrl: false
    },
    cache: {
        cacheLocation: "sessionStorage",
        storeAuthStateInCookie: false
    }
};

export const loginRequest = {
    scopes: appConfig.apiScope ? [appConfig.apiScope] : ["User.Read"]
};
