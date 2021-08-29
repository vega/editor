import * as React from 'react';
import {Sidebar} from './Sidebar';
import './DataflowViewer.css';
import {Graph} from './Graph';

/**
 * Wrap the component so we can catch the errors. We don't use the previously defined
 * error boundary component, since we want to seperate errors in graph generation from
 * errors in spec rendering
 * **/
export class DataflowViewer extends React.Component<
  Record<string, never>,
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
    return (
      <div className="dataflow-pane">
        <Graph />
        <Sidebar />
      </div>
    );
  }
}
