import './index.css';

import * as React from 'react';

type Props = {
  logError?: (...args: any[]) => any;
  showErrorPane?: (...args: any[]) => any;
  error?: string;
};
export default class ErrorBoundary extends React.Component<Props> {
  public componentDidCatch(error, info) {
    this.props.logError(error.toString());
  }
  public render() {
    if (this.props.error) {
      return (
        <div id='error-indicator' onClick={(e) => this.props.showErrorPane()}>
          {this.props.error}
        </div>
      );
    }
    return this.props.children;
  }
}
