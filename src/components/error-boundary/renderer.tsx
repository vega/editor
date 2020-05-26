import * as React from 'react';
import {mapDispatchToProps, mapStateToProps} from '.';
import './index.css';

type Props = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps> & {children?: React.ReactNode};

export default class ErrorBoundary extends React.PureComponent<Props> {
  public componentDidCatch(error: Error) {
    this.props.logError(error);
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
