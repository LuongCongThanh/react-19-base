import { Component, type ComponentType, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ComponentType<{ error: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: { componentStack: string }) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundaryClass extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }): void {
    this.props.onError?.(error, errorInfo);
  }

  resetError = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        const Fallback = this.props.fallback;
        return <Fallback error={this.state.error} resetError={this.resetError} />;
      }

      // Default fallback UI
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-4">{this.state.error.message}</p>
            <button onClick={this.resetError} className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Wrapper component để wrap component khác với Error Boundary
 *
 * @example
 * // Sử dụng với component cụ thể
 * <WithErrorBoundary component={MyComponent} myProp="value" />
 *
 * // Với custom fallback
 * <WithErrorBoundary
 *   component={MyComponent}
 *   fallback={CustomErrorUI}
 *   onError={(error) => console.error(error)}
 * />
 */
export const WithErrorBoundary = <P extends object>({
  component: Component,
  fallback,
  onError,
  ...props
}: {
  component: ComponentType<P>;
  fallback?: ComponentType<{ error: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: { componentStack: string }) => void;
} & P) => {
  return (
    <ErrorBoundaryClass fallback={fallback} onError={onError}>
      <Component {...(props as P)} />
    </ErrorBoundaryClass>
  );
};

/**
 * ErrorBoundary component để sử dụng trực tiếp
 *
 * @example
 * <ErrorBoundary fallback={CustomErrorUI}>
 *   <YourComponent />
 * </ErrorBoundary>
 */
export const ErrorBoundary = ErrorBoundaryClass;
