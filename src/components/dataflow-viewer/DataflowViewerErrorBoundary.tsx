import * as React from 'react';
import {StoreProps} from '.';
import DataflowViewer from './DataflowViewer';

// Wrap the component so we can catch the errors. We don't use the previously defined
// error boundary component, since we want to seperate errors in graph generation from
// errors in spec rendering

export default class DataflowViewerErrorBoundary extends React.Component<
  StoreProps,
  {
    error: Error | null;
  }
> {
  state = {
    error: null,
  };
  public componentDidCatch(error: Error) {
    this.setState({error});
  }

  public render() {
    if (this.state.error) {
      return <div id="error-indicator">{this.state.error.message}</div>;
    }
    return <DataflowViewer {...this.props} />;
  }
}
