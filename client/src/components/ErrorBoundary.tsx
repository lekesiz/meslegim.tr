import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-8 bg-background">
          <div className="flex flex-col items-center w-full max-w-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle
                size={32}
                className="text-red-600 flex-shrink-0"
              />
            </div>

            <h2 className="text-2xl font-bold text-foreground mb-2">Bir Hata Oluştu</h2>
            <p className="text-muted-foreground mb-6">
              Beklenmeyen bir sorun oluştu. Lütfen sayfayı yenilemeyi deneyin veya ana sayfaya dönün.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="p-4 w-full rounded-lg bg-muted overflow-auto mb-6 text-left">
                <pre className="text-xs text-muted-foreground whitespace-break-spaces">
                  {this.state.error?.message}
                </pre>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-lg",
                  "bg-primary text-primary-foreground",
                  "hover:opacity-90 cursor-pointer transition-opacity"
                )}
              >
                <RotateCcw size={16} />
                Sayfayı Yenile
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-lg",
                  "bg-muted text-foreground",
                  "hover:bg-muted/80 cursor-pointer transition-colors"
                )}
              >
                <Home size={16} />
                Ana Sayfa
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
