/** @format */

import * as React from 'react';

import './index.css';

type Props = {
  logError?: (...args: any[]) => any;
  showErrorPane?: (...args: any[]) => any;
  error?: string;
};
export default class ErrorBoundary extends React.Component<Props> {
  componentDidCatch(error, info) {
    this.props.logError(error.toString());
  }
  render() {
    if (this.props.error) {
      return (
        <div id="error-indicator" onClick={(e) => this.props.showErrorPane()}>
          {this.props.error}
        </div>
      );
    }
    return this.props.children;
  }
}
