import "./index.css";
import React from "react";
type ErrorBoundaryProps = {
  logError?: (...args: any[]) => any,
  showErrorPane?: (...args: any[]) => any,
  error?: string
};
export default class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  {}
> {
  componentDidCatch(error, info) {
    this.props.logError(error.toString());
  }
  render() {
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
