import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ error, errorInfo });
    console.error("Uncaught error:", error, errorInfo);
  }

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className='min-h-screen bg-slate-50 dark:bg-surface-950 flex items-center justify-center p-4 transition-colors'>
          <div className='bg-white dark:bg-surface-900 border border-red-200 dark:border-red-900/50 rounded-2xl p-8 max-w-md w-full text-center shadow-xl dark:shadow-2xl transition-colors'>
            <div className='bg-red-50 dark:bg-red-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors'>
              <AlertTriangle
                size={32}
                className='text-red-600 dark:text-red-500 transition-colors'
              />
            </div>
            <h2 className='text-2xl font-bold text-slate-900 dark:text-white mb-2 transition-colors'>
              Algo salió mal
            </h2>
            <p className='text-slate-600 dark:text-slate-400 mb-6 transition-colors'>
              Ha ocurrido un error inesperado en la aplicación.
            </p>

            {this.state.error && (
              <div className='bg-slate-50 dark:bg-surface-950 p-4 rounded-lg border border-slate-200 dark:border-surface-800 text-left mb-6 overflow-auto max-h-40 transition-colors'>
                <p className='text-red-600 dark:text-red-400 font-mono text-xs transition-colors'>
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <button
              onClick={this.handleReload}
              className='bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 w-full transition-colors'
            >
              <RefreshCw size={20} /> Recargar Aplicación
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
