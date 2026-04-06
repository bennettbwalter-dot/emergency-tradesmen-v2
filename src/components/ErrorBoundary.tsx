import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(_: Error): State {
        return { hasError: true };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        this.setState({ error, errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;
            return (
                <div style={{ padding: "4rem", backgroundColor: "#020617", color: "#f87171", fontFamily: "monospace", minHeight: "100vh" }}>
                    <h1 style={{ fontSize: "2rem", marginBottom: "1rem", fontWeight: "bold", color: "#fbbf24" }}>Critical React Crash</h1>
                    <p style={{ marginBottom: "2rem", color: "#94a3b8" }}>The application encountered an unhandled exception during rendering. The error has been captured below.</p>
                    <div style={{ padding: "1rem", backgroundColor: "#1e1b1b", borderLeft: "4px solid #ef4444", borderRadius: "0.25rem", overflowX: "auto" }}>
                        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem", color: "#fca5a5" }}>{this.state.error?.toString() || "Unknown Error"}</h2>
                        <pre style={{ fontSize: "0.875rem", color: "#f87171", whiteSpace: "pre-wrap" }}>
                            {this.state.errorInfo?.componentStack || this.state.error?.stack}
                        </pre>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
