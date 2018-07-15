import './index.css';

import * as React from 'react';
import { ChevronDown, ChevronUp, X } from 'react-feather';
import SplitPane from 'react-split-pane';

import DataViewer from '../data-viewer';
import ErrorBoundary from '../error-boundary';
import ErrorPane from '../error-pane';
import Renderer from '../renderer';
import Toolbar from '../toolbar';

interface Props {
  debugPane?: boolean;

  toggleDebugPane: () => void;
}

interface State {
  errorLogs: boolean;
}

export default class VizPane extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      errorLogs: true,
    };
  }
  public render() {
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
            className={this.state.errorLogs ? 'active-tab' : ''}
            onClick={e => {
              if (this.props.debugPane) {
                e.stopPropagation();
              }
              this.setState({ errorLogs: true });
            }}
          >
            Error Logs
          </li>
          <li
            className={this.state.errorLogs ? '' : 'active-tab'}
            onClick={e => {
              if (this.props.debugPane) {
                e.stopPropagation();
              }
              this.setState({ errorLogs: false });
            }}
          >
            Data Viewer
          </li>
        </ul>
        <span onClick={e => this.props.toggleDebugPane()} className="close">
          <X size={20} />
        </span>
      </div>
    );
    if (this.props.debugPane) {
      return (
        <SplitPane
          split="horizontal"
          primary="second"
          minSize={25}
          defaultSize={window.innerHeight * 0.4}
          paneStyle={{ display: 'flex' }}
        >
          {container}
          <div className="debug-pane">
            {debugPaneHeader}
            {this.state.errorLogs ? <ErrorPane /> : <DataViewer />}
          </div>
        </SplitPane>
      );
    } else {
      return (
        <SplitPane
          split="horizontal"
          primary="second"
          minSize={25}
          defaultSize={25}
          paneStyle={{ display: 'flex', height: '25px' }}
        >
          {container}
          <div className="debug-pane">
            {debugPaneHeader}
            {this.state.errorLogs ? <ErrorPane /> : <DataViewer />}
          </div>
        </SplitPane>
      );
    }
  }
}
