import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('MoneyMate Uncaught Error:', error, errorInfo);
  }

  private handleReset = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #090d16 0%, #111827 100%)',
            color: '#f9fafb',
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            padding: '24px',
          }}
        >
          <div
            style={{
              maxWidth: '520px',
              width: '100%',
              backgroundColor: '#131b2e',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              padding: '36px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '28px',
                fontWeight: 'bold',
              }}
            >
              !
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
              Something went wrong
            </h2>
            <p style={{ color: '#9ca3af', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
              MoneyMate encountered an unexpected error while rendering. You can try refreshing or resetting local cached state.
            </p>
            {this.state.error?.message && (
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  color: '#f87171',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  marginBottom: '24px',
                  textAlign: 'left',
                  overflowX: 'auto',
                }}
              >
                {this.state.error.message}
              </div>
            )}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={this.handleReload}
                style={{
                  padding: '12px 24px',
                  borderRadius: '12px',
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s',
                }}
              >
                Reload App
              </button>
              <button
                onClick={this.handleReset}
                style={{
                  padding: '12px 24px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: '#e5e7eb',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Reset Stored Data
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
