import * as React from 'react';
import {mapDispatchToProps, mapStateToProps} from './index.js';
import './index.css';

type Props = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps> & {children?: React.ReactNode};

export default class ErrorBoundary extends React.PureComponent<Props> {
  //use react memo
  public componentDidCatch(error: Error) {
    this.props.logError(error);
  }
  public render() {
    return <ErrorBoundaryContent {...this.props} />;
  }
}

const ErrorBoundaryContent = (props: Props) => {
  if (props.error) {
    return (
      <div id="error-indicator" onClick={props.toggleDebugPane}>
        {props.error.message}
      </div>
    );
  }
  return <>{props.children}</>;
};
