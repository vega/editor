import './index.css';

import * as React from 'react';

interface Props {
  error?: string;

  logError?: (err: any) => void;
  showErrorPane?: () => void;
}

export default class ErrorBoundary extends React.Component<Props> {
  public componentDidCatch(error, info) {
    this.props.logError(error.toString());
  }
  public render() {
    if (this.props.error) {
      return (
        <div id="error-indicator" onClick={e => this.props.showErrorPane()}>
          {this.props.error}
        </div>
      );
    }
    return this.props.children;
  }
}
