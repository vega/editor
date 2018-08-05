import './index.css';

import * as React from 'react';
import { ChevronDown, ChevronUp } from 'react-feather';
import SplitPane from 'react-split-pane';

import { View } from '../../constants';
import DataViewer from '../data-viewer';
import ErrorBoundary from '../error-boundary';
import ErrorPane from '../error-pane';
import Renderer from '../renderer';
import Toolbar from '../toolbar';

interface Props {
  debugPane?: boolean;
  debugPaneSize?: number;
  logs?: boolean;
  view?: View;

  setDebugPaneSize: (val: any) => void;
  showLogs: (val: any) => void;
  toggleDebugPane: () => void;
}

export default class VizPane extends React.Component<Props> {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }
  public handleChange(size: number) {
    this.props.setDebugPaneSize(size);
    if ((size > 25 && !this.props.debugPane) || (size === 25 && this.props.debugPane)) {
      this.props.toggleDebugPane();
    }
  }
  public componentDidUpdate() {
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
            className={this.props.logs ? 'active-tab' : ''}
            onClick={e => {
              if (this.props.debugPane) {
                e.stopPropagation();
              }
              this.props.showLogs(true);
            }}
          >
            Logs
          </li>
          <li
            className={this.props.logs ? '' : 'active-tab'}
            onClick={e => {
              if (this.props.debugPane) {
                e.stopPropagation();
              }
              this.props.showLogs(false);
            }}
          >
            Data Viewer
          </li>
        </ul>
        {this.props.debugPane ? <ChevronDown /> : <ChevronUp />}
      </div>
    );
    return (
      <SplitPane
        ref="debugPane"
        split="horizontal"
        primary="second"
        minSize={25}
        defaultSize={this.props.debugPane ? this.props.debugPaneSize : 25}
        onChange={this.handleChange}
        paneStyle={{ display: 'flex' }}
      >
        {container}
        <div className="debug-pane">
          {debugPaneHeader}
          {this.props.logs ? <ErrorPane /> : this.props.view ? <DataViewer /> : null}
        </div>
      </SplitPane>
    );
  }
}
