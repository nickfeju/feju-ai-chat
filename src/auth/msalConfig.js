export const msalConfig = {
    auth: {
        clientId: "59c65b43-60e0-4c9f-87f9-4a005a51fa54",
        authority:
            "https://login.microsoftonline.com/d8e80c75-af0c-4d17-a7a5-4849d64af1c5",
        redirectUri: window.location.origin
    },
    cache: {
        cacheLocation: "sessionStorage",
        storeAuthStateInCookie: false
    }
};

export const loginRequest = {
    scopes: ["User.Read"]
};
`