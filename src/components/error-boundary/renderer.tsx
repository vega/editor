import * as React from 'react';
import {mapDispatchToProps, mapStateToProps} from '.';
import './index.css';

type Props = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

export default class ErrorBoundary extends React.PureComponent<Props> {
  public componentDidCatch(error, info) {
    this.props.logError(new Error(error));
  }
  public render() {
    if (this.props.error) {
      return (
        <div id="error-indicator" onClick={e => this.props.toggleDebugPane()}>
          {this.props.error.message}
        </div>
      );
    }
    return this.props.children;
  }
}
