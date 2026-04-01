import React from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by ErrorBoundary:", error);
    console.error("Error info:", errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen w-full flex items-center justify-center"
          style={{ background: "#060a0f" }}
        >
          <div className="text-center space-y-6 max-w-sm px-6">
            {/* Icon */}
            <div className="w-20 h-20 rounded-2xl bg-[#4ECDC4]/10 flex items-center justify-center mx-auto">
              <AlertTriangle size={36} className="text-[#4ECDC4]" />
            </div>

            {/* Heading */}
            <div className="space-y-2">
              <p className="text-[#4ECDC4] text-sm font-semibold tracking-widest uppercase">Fejl</p>
              <h1 className="text-white text-2xl font-bold">Noget gik galt</h1>
              <p className="text-white/50 text-sm leading-relaxed">
                Noget gik galt. Prøv at genindlæse siden.
              </p>
            </div>

            {/* Debug info (only show in development) */}
            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10 text-left">
                <p className="text-xs text-white/50 font-mono break-words">
                  {this.state.error.message}
                </p>
              </div>
            )}

            {/* CTA */}
            <button
              onClick={this.handleReload}
              className="mt-2 px-6 py-3 rounded-xl bg-[#4ECDC4] text-[#0a0f1a] text-sm font-semibold hover:bg-[#3dbdb5] active:scale-[0.98] transition-all inline-block"
            >
              Genindlæs
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
