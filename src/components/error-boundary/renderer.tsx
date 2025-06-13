import * as React from 'react';
import {mapDispatchToProps, mapStateToProps} from './index.js';
import './index.css';

type Props = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps> & {children?: React.ReactNode};

interface ErrorBoundaryState {
  hasError: boolean;
}

export default class ErrorBoundary extends React.Component<Props, ErrorBoundaryState> {
  constructor(props: Props) {
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

interface ErrorBoundaryContentProps extends Props {
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
