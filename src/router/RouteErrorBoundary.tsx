// src/router/RouteErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

import type { RouteConfig } from '@/types/routing';

// ===== ERROR BOUNDARY STATE =====

interface RouteErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

// ===== ERROR BOUNDARY PROPS =====

interface RouteErrorBoundaryProps {
  route?: RouteConfig;
  children: ReactNode;
  fallback?: React.ComponentType<RouteErrorFallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo, route?: RouteConfig) => void;
  onRetry?: (retryCount: number) => void;
  maxRetries?: number;
  retryDelay?: number;
}

interface RouteErrorFallbackProps {
  error: Error;
  errorInfo: ErrorInfo;
  route?: RouteConfig;
  retryCount: number;
  maxRetries: number;
  onRetry: () => void;
  onReset: () => void;
}

// ===== DEFAULT ERROR FALLBACK =====

const DefaultErrorFallback: React.FC<RouteErrorFallbackProps> = ({
  error,
  errorInfo,
  route,
  retryCount,
  maxRetries,
  onRetry,
  onReset,
}) => {
  const canRetry = retryCount < maxRetries;
  const isRouteError = error.name === 'RouteError';
  const isGuardError = error.name === 'GuardError';
  const isLayoutError = error.name === 'LayoutError';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
          <svg
            className="w-6 h-6 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>

        <div className="text-center">
          <h1 className="text-lg font-medium text-gray-900 mb-2">
            {isRouteError && 'Route Error'}
            {isGuardError && 'Access Denied'}
            {isLayoutError && 'Layout Error'}
            {!isRouteError && !isGuardError && !isLayoutError && 'Application Error'}
          </h1>

          <p className="text-sm text-gray-600 mb-4">
            {isRouteError && 'There was a problem loading this route.'}
            {isGuardError && 'You do not have permission to access this resource.'}
            {isLayoutError && 'There was a problem loading the layout.'}
            {!isRouteError && !isGuardError && !isLayoutError && 'Something went wrong.'}
          </p>

          {route && (
            <div className="bg-gray-100 rounded-md p-3 mb-4">
              <p className="text-xs text-gray-500 mb-1">Route:</p>
              <p className="text-sm font-mono text-gray-700">{route.path}</p>
              {route.meta.title && (
                <p className="text-xs text-gray-500 mt-1">{route.meta.title}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            {canRetry && (
              <button
                onClick={onRetry}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Try Again ({retryCount + 1}/{maxRetries})
              </button>
            )}

            <button
              onClick={onReset}
              className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Reset
            </button>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 text-left">
              <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                Error Details
              </summary>
              <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                <p><strong>Error:</strong> {error.message}</p>
                <p><strong>Stack:</strong></p>
                <pre className="whitespace-pre-wrap text-xs">{error.stack}</pre>
                {errorInfo.componentStack && (
                  <>
                    <p><strong>Component Stack:</strong></p>
                    <pre className="whitespace-pre-wrap text-xs">{errorInfo.componentStack}</pre>
                  </>
                )}
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  );
};

// ===== ROUTE ERROR BOUNDARY COMPONENT =====

export class RouteErrorBoundary extends Component<
  RouteErrorBoundaryProps,
  RouteErrorBoundaryState
> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: RouteErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<RouteErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { route, onError } = this.props;

    // Update state with error info
    this.setState({
      error,
      errorInfo,
    });

    // Call error handler
    if (onError) {
      onError(error, errorInfo, route);
    }

    // Log error for debugging
    console.error('Route Error Boundary caught an error:', error, errorInfo);

    // Report error to monitoring service (if available)
    this.reportError(error, errorInfo);
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // TODO: Integrate with error monitoring service (e.g., Sentry, LogRocket)
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { extra: errorInfo });
      console.error('Error reported to monitoring service:', error);
    }
  };

  private handleRetry = () => {
    const { retryDelay = 1000, onRetry } = this.props;
    const { retryCount } = this.state;

    if (onRetry) {
      onRetry(retryCount + 1);
    }

    // Clear timeout if exists
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }

    // Retry after delay
    this.retryTimeoutId = setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: retryCount + 1,
      });
    }, retryDelay);
  };

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    });
  };

  render() {
    const { hasError, error, errorInfo, retryCount } = this.state;
    const { children, fallback: Fallback, maxRetries = 3 } = this.props;

    if (hasError && error && errorInfo) {
      const ErrorFallback = Fallback || DefaultErrorFallback;

      return (
        <ErrorFallback
          error={error}
          errorInfo={errorInfo}
          route={this.props.route}
          retryCount={retryCount}
          maxRetries={maxRetries}
          onRetry={this.handleRetry}
          onReset={this.handleReset}
        />
      );
    }

    return children;
  }
}

// ===== ROUTE ERROR BOUNDARY HOOK =====

export const useRouteErrorBoundary = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { captureError, resetError };
};

// ===== ROUTE ERROR BOUNDARY WRAPPER =====

interface RouteErrorBoundaryWrapperProps {
  children: ReactNode;
  route?: RouteConfig;
  fallback?: React.ComponentType<RouteErrorFallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo, route?: RouteConfig) => void;
}

export const RouteErrorBoundaryWrapper: React.FC<RouteErrorBoundaryWrapperProps> = ({
  children,
  route,
  fallback,
  onError,
}) => {
  return (
    <RouteErrorBoundary
      route={route}
      fallback={fallback}
      onError={onError}
      maxRetries={3}
      retryDelay={1000}
    >
      {children}
    </RouteErrorBoundary>
  );
};

export default RouteErrorBoundary;
