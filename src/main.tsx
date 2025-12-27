import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log("🚀 Application Starting...");

try {
    const rootElement = document.getElementById("root");
    if (!rootElement) throw new Error("Root element 'root' not found in index.html");

    createRoot(rootElement).render(<App />);
    console.log("✅ React App Mounted");
} catch (error: any) {
    console.error("🔥 FATAL APP CRASH:", error);
    document.body.innerHTML = `
        <div style="padding: 20px; font-family: monospace; color: red; background: #fff0f0; border: 2px solid red;">
            <h1>🔥 FATAL APPLICATION ERROR</h1>
            <p>The app crashed before it could start.</p>
            <pre style="background: #333; color: #fff; padding: 15px; overflow: auto;">${error?.message || error}</pre>
            <pre>${error?.stack || ''}</pre>
        </div>
    `;
}
