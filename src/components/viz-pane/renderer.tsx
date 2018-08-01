import './index.css';

import * as React from 'react';
import SplitPane from 'react-split-pane';

import DataViewer from '../data-viewer';
import ErrorBoundary from '../error-boundary';
import ErrorPane from '../error-pane';
import Renderer from '../renderer';
import Toolbar from '../toolbar';

interface Props {
  debugPane?: boolean;
  debugPaneSize?: number;

  setDebugPaneSize: (val: any) => void;
  toggleDebugPane: () => void;
}

interface State {
  logs: boolean;
}

export default class VizPane extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      logs: true,
    };
    this.handleChange = this.handleChange.bind(this);
  }
  public handleChange(size: number) {
    this.props.setDebugPaneSize(size);
    if ((size > 25 && !this.props.debugPane) || (size === 25 && this.props.debugPane)) {
      this.props.toggleDebugPane();
    }
  }
  public componenDidUpdate() {
    const debugPane = this.refs.debugPane as any;
    if (debugPane.pane2.style.height > 25 && !this.props.debugPane) {
      this.props.toggleDebugPane();
    }
  }
  public render() {
    const debugPane = this.refs.debugPane as any;
    if (debugPane) {
      debugPane.pane2.style.height = this.props.debugPane
        ? (this.props.debugPaneSize || window.innerHeight * 0.4) + 'px'
        : '25px';
    }
    const container = (
      <div className="chart-container">
        <ErrorBoundary>
          <Renderer />
        </ErrorBoundary>
        <Toolbar />
      </div>
    );
    const debugPaneHeader = (
      <div className="debug-pane-header" onClick={e => this.props.toggleDebugPane()}>
        <ul className="tabs-nav">
          <li
            className={this.state.logs ? 'active-tab' : ''}
            onClick={e => {
              if (this.props.debugPane) {
                e.stopPropagation();
              }
              this.setState({ logs: true });
            }}
          >
            Logs
          </li>
          <li
            className={this.state.logs ? '' : 'active-tab'}
            onClick={e => {
              if (this.props.debugPane) {
                e.stopPropagation();
              }
              this.setState({ logs: false });
            }}
          >
            Data Viewer
          </li>
        </ul>
      </div>
    );
    return (
      <SplitPane
        ref="debugPane"
        split="horizontal"
        primary="second"
        minSize={25}
        defaultSize={this.props.debugPaneSize || 25}
        onChange={this.handleChange}
        paneStyle={{ display: 'flex' }}
      >
        {container}
        <div className="debug-pane">
          {debugPaneHeader}
          {this.state.logs ? <ErrorPane /> : <DataViewer />}
        </div>
      </SplitPane>
    );
  }
}
