import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🔴 ErrorBoundary caught an error:', error);
    console.error('🔴 Error info:', errorInfo);
    console.error('🔴 Component stack:', errorInfo.componentStack);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          padding: '2rem',
          fontFamily: 'monospace',
          backgroundColor: '#1a1a1a',
          color: '#fff',
          minHeight: '100vh'
        }}>
          <h1 style={{ color: '#ff5555' }}>⚠️ Something went wrong</h1>
          <div style={{
            padding: '1rem',
            backgroundColor: '#2a2a2a',
            borderRadius: '8px',
            marginTop: '1rem'
          }}>
            <h2>Error Details:</h2>
            <pre style={{
              backgroundColor: '#1a1a1a',
              padding: '1rem',
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '0.9rem'
            }}>
              {this.state.error?.toString()}
            </pre>
            {this.state.errorInfo && (
              <>
                <h3 style={{ marginTop: '1rem' }}>Component Stack:</h3>
                <pre style={{
                  backgroundColor: '#1a1a1a',
                  padding: '1rem',
                  borderRadius: '4px',
                  overflow: 'auto',
                  fontSize: '0.8rem'
                }}>
                  {this.state.errorInfo.componentStack}
                </pre>
              </>
            )}
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
