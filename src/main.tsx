import { createRoot } from "react-dom/client";
import { devLog } from "@/lib/devLog";
import App from "./App.tsx";
import "./index.css";
import "@fontsource/dm-sans"; // Defaults to weight 400
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/700.css";
import { initPostHog } from "./lib/posthog";

// Initialize analytics
initPostHog();

// Prevent blank screen of death with immediate error reporting
window.addEventListener('error', (event) => {
    // Ignore benign ResizeObserver errors that don't actually crash the app
    const ignoredErrors = ['ResizeObserver', 'Script error.', 'ResizeObserver loop limit exceeded'];
    if (ignoredErrors.some(msg => event.message?.includes(msg))) {
        return;
    }

    console.error("🌐 GLOBAL ERROR DETECTED:", event.message, event.error);

    // Only show the fatal overlay for errors that actually prevent the app from mounting or are likely fatal
    // If the root element is already populated, we probably shouldn't wipe it
    const root = document.getElementById('root');
    const isAppMounted = root && root.children.length > 0;

    if (!isAppMounted) {
        document.body.innerHTML = `
            <div style="padding: 20px; font-family: sans-serif; color: #721c24; background: #f8d7da; border: 2px solid #f5c6cb; margin: 20px; border-radius: 8px;">
                <h1 style="margin-top: 0;">Application Error</h1>
                <p><strong>Script Error:</strong> ${event.message}</p>
                <p>File: ${event.filename}:${event.lineno}</p>
                <pre style="background: rgba(0,0,0,0.05); padding: 10px; border-radius: 4px; overflow: auto;">${event.error?.stack || 'No stack trace available'}</pre>
                <button onclick="window.location.reload()" style="padding: 8px 16px; background: #721c24; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 10px;">Reload Application</button>
            </div>
        `;
    }
});

window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const message = reason?.message || reason || 'No reason provided';
    const stack = reason?.stack || 'No stack trace available';

    console.error("📜 UNHANDLED PROMISE REJECTION:", message, reason);

    // Stop wiping the body for unhandled rejections! 
    // Most rejections are non-fatal or from third-party scripts.
    // Instead, we just log it. If it's a critical error, the normal ErrorBoundary will catch it 
    // or the 'error' event above will handle it if it results in a crash.
    
    // Optional: We could show a non-intrusive toast here if we had a global toast system 
    // that works outside of React, but for now, logging is safer than crashing the UI.
});

devLog("🚀 Application Starting...");

try {
    const rootElement = document.getElementById("root");
    if (!rootElement) throw new Error("Root element 'root' not found in index.html");

    createRoot(rootElement).render(<App />);
    devLog("React App Mounted");
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
