import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage?: string;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error.message, error.stack);
    console.error('Component stack:', errorInfo.componentStack);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4">
          <div className="text-center max-w-lg">
            <h1 className="text-3xl font-bold text-white mb-4 font-heading">Une erreur est survenue</h1>
            <p className="text-light-400 mb-4">
              Nous nous excusons pour la gene occasionnee. Veuillez rafraichir la page ou reessayer plus tard.
            </p>
            <p className="text-xs text-light-400/50 mb-8 bg-dark-800 p-3 rounded-lg text-left font-mono break-all">
              {this.state.errorMessage || 'Erreur inconnue'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn bg-fed-red-500 hover:bg-fed-red-600 text-white"
            >
              Rafraichir la page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;