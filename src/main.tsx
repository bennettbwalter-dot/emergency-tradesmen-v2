import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Prevent blank screen of death with immediate error reporting
window.addEventListener('error', (event) => {
    document.body.innerHTML = `
        <div style="padding: 20px; font-family: sans-serif; color: #721c24; background: #f8d7da; border: 2px solid #f5c6cb; margin: 20px; border-radius: 8px;">
            <h1 style="margin-top: 0;">Application Error</h1>
            <p><strong>Script Error:</strong> ${event.message}</p>
            <p>File: ${event.filename}:${event.lineno}</p>
            <pre style="background: rgba(0,0,0,0.05); padding: 10px; border-radius: 4px; overflow: auto;">${event.error?.stack || 'No stack trace available'}</pre>
        </div>
    `;
});

window.addEventListener('unhandledrejection', (event) => {
    document.body.innerHTML = `
        <div style="padding: 20px; font-family: sans-serif; color: #856404; background: #fff3cd; border: 2px solid #ffeeba; margin: 20px; border-radius: 8px;">
            <h1 style="margin-top: 0;">Unhandled Promise Rejection</h1>
            <p><strong>Reason:</strong> ${event.reason?.message || event.reason}</p>
            <pre style="background: rgba(0,0,0,0.05); padding: 10px; border-radius: 4px; overflow: auto;">${event.reason?.stack || 'No stack trace available'}</pre>
        </div>
    `;
});

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
