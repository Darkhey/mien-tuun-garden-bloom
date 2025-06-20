
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-cream flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-xl font-serif text-earth-800">
                Oops! Etwas ist schiefgelaufen
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-earth-600">
                Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut.
              </p>
              {this.state.error && (
                <details className="text-left text-xs text-earth-500 bg-earth-50 p-2 rounded">
                  <summary className="cursor-pointer">Technische Details</summary>
                  <pre className="mt-2 overflow-auto">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
              <div className="space-x-2">
                <Button onClick={this.handleReset} className="bg-sage-600 hover:bg-sage-700">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Erneut versuchen
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/'}
                >
                  Zur Startseite
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
