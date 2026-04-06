import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class LocalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "4rem", color: "#ff8080", backgroundColor: "#111" }}>
          <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Runtime Crash Detected</h1>
          <pre style={{ whiteSpace: "pre-wrap", background: "#222", padding: "1rem", borderRadius: "8px" }}>
            {this.state.error?.message}
          </pre>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.85em", color: "#aaa", marginTop: "1rem" }}>
            {this.state.error?.stack}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}
