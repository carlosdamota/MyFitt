import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("Uncaught error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-900/50 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
            <div className="bg-red-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} className="text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Algo salió mal</h2>
            <p className="text-slate-400 mb-6">Ha ocurrido un error inesperado en la aplicación.</p>
            
            {this.state.error && (
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-left mb-6 overflow-auto max-h-40">
                <p className="text-red-400 font-mono text-xs">{this.state.error.toString()}</p>
              </div>
            )}

            <button 
              onClick={this.handleReload}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 w-full transition-colors"
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
