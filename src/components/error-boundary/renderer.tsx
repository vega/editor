import React from 'react';
import './index.css';

interface ErrorBoundaryProps {
  logError: (error: Error, info: React.ErrorInfo) => void;
  toggleDebugPane: () => void;
  children?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props) {
    super(props);
    this.state = {hasError: false};
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {hasError: true, error};
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.props.logError(error, info);
    console.error('ErrorBoundary caught an error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div id="error-indicator" onClick={this.props.toggleDebugPane}>
          {this.state.error?.message ?? 'An unexpected error occurred'}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
