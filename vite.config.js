import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    build: {
        rolldownOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes("node_modules/@azure/msal")) return "auth";
                    if (id.includes("node_modules/react-markdown") || id.includes("node_modules/remark") || id.includes("node_modules/unified")) return "markdown";
                    if (id.includes("node_modules/react") || id.includes("node_modules/react-dom")) return "react";
                    return undefined;
                }
            }
        }
    }
});
