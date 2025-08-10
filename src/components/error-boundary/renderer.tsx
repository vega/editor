import React from 'react';
import './index.css';

interface ErrorBoundaryProps {
  error: {message: string};
  logError: (error: Error, info: React.ErrorInfo) => void;
  toggleDebugPane: () => void;
  children?: React.ReactNode;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps> {
  public componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.props.logError(error, info);
  }

  public render() {
    if (this.props.error) {
      return (
        <div id="error-indicator" onClick={this.props.toggleDebugPane}>
          {this.props.error.message}
        </div>
      );
    }

    return this.props.children;
  }
}
