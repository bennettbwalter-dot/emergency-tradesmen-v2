import { createRoot } from "react-dom/client";
import { devLog } from "@/lib/devLog";
import App from "./App.tsx";
import "./index.css";
import "@fontsource/dm-sans"; // Defaults to weight 400
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/700.css";

// Defer non-critical observability libs until after first paint to keep them
// out of the LCP critical path. Both are idempotent and SPA-friendly.
const onIdle: (cb: () => void) => void = (cb) => {
    if (typeof window === 'undefined') return;
    const ric = (window as any).requestIdleCallback;
    if (typeof ric === 'function') ric(cb, { timeout: 4000 });
    else setTimeout(cb, 2500);
};

onIdle(() => {
    if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
        import('@sentry/react').then((Sentry) => {
            Sentry.init({
                dsn: import.meta.env.VITE_SENTRY_DSN,
                environment: import.meta.env.MODE,
                tracesSampleRate: 0.1,
                integrations: [Sentry.browserTracingIntegration()],
                ignoreErrors: [
                    'ResizeObserver loop limit exceeded',
                    'ResizeObserver loop completed with undelivered notifications',
                    'Script error.',
                ],
            });
        }).catch(() => { /* non-fatal */ });
    }
    import('./lib/posthog').then(({ initPostHog }) => initPostHog()).catch(() => {});
});

function renderFatalOverlay(title: string, details: Array<[string, unknown]>) {
    const wrapper = document.createElement('div');
    wrapper.style.padding = '20px';
    wrapper.style.fontFamily = 'sans-serif';
    wrapper.style.color = '#721c24';
    wrapper.style.background = '#f8d7da';
    wrapper.style.border = '2px solid #f5c6cb';
    wrapper.style.margin = '20px';
    wrapper.style.borderRadius = '8px';

    const heading = document.createElement('h1');
    heading.style.marginTop = '0';
    heading.textContent = title;
    wrapper.appendChild(heading);

    for (const [label, value] of details) {
        const node = label === 'Stack' ? document.createElement('pre') : document.createElement('p');
        if (label === 'Stack') {
            node.style.background = 'rgba(0,0,0,0.05)';
            node.style.padding = '10px';
            node.style.borderRadius = '4px';
            node.style.overflow = 'auto';
        }
        node.textContent = `${label}: ${String(value ?? '')}`;
        wrapper.appendChild(node);
    }

    const button = document.createElement('button');
    button.textContent = 'Reload Application';
    button.style.padding = '8px 16px';
    button.style.background = '#721c24';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '4px';
    button.style.cursor = 'pointer';
    button.style.marginTop = '10px';
    button.addEventListener('click', () => window.location.reload());
    wrapper.appendChild(button);

    document.body.replaceChildren(wrapper);
}

// Prevent blank screen of death with immediate error reporting
window.addEventListener('error', (event) => {
    // Ignore benign ResizeObserver errors that don't actually crash the app
    const ignoredErrors = ['ResizeObserver', 'Script error.', 'ResizeObserver loop limit exceeded'];
    if (ignoredErrors.some(msg => event.message?.includes(msg))) {
        return;
    }

    console.error("Global error detected:", event.message, event.error);

    // Only show the fatal overlay for errors that actually prevent the app from mounting or are likely fatal.
    const root = document.getElementById('root');
    const isAppMounted = root && root.children.length > 0;

    if (!isAppMounted) {
        renderFatalOverlay('Application Error', [
            ['Script Error', event.message],
            ['File', `${event.filename}:${event.lineno}`],
            ['Stack', event.error?.stack || 'No stack trace available'],
        ]);
    }
});

window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const message = reason?.message || reason || 'No reason provided';

    console.error("Unhandled promise rejection:", message, reason);
});

devLog("Application starting...");

try {
    const rootElement = document.getElementById("root");
    if (!rootElement) throw new Error("Root element 'root' not found in index.html");

    createRoot(rootElement).render(<App />);
    devLog("React App mounted");
} catch (error: any) {
    console.error("Fatal app crash:", error);
    renderFatalOverlay('Fatal Application Error', [
        ['Message', error?.message || error],
        ['Stack', error?.stack || 'No stack trace available'],
    ]);
}
