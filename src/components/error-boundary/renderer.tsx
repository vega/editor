import * as React from 'react';
import './index.css';

interface ErrorBoundaryProps {
  error?: Error;
  logError: (error: Error) => void;
  toggleDebugPane: () => void;
  children?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {hasError: false};
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return {hasError: true};
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.props.logError(error);
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    return <ErrorBoundaryContent {...this.props} hasError={this.state.hasError} />;
  }
}

interface ErrorBoundaryContentProps extends ErrorBoundaryProps {
  hasError: boolean;
}

function ErrorBoundaryContent(props: ErrorBoundaryContentProps) {
  if (props.error || props.hasError) {
    return (
      <div id="error-indicator" onClick={props.toggleDebugPane}>
        {props.error?.message || 'An unexpected error occurred'}
      </div>
    );
  }
  return <>{props.children}</>;
}
