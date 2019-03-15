import './index.css';

import * as React from 'react';
import SplitPane from 'react-split-pane';

import { LAYOUT, NAVBAR, View } from '../../constants';
import DataViewer from '../data-viewer';
import ErrorBoundary from '../error-boundary';
import ErrorPane from '../error-pane';
import Renderer from '../renderer';
import SignalViewer from '../signal-viewer';
import Toolbar from '../toolbar';
import DebugPaneHeader from './debug-pane-header';

interface Props {
  debugPane?: boolean;
  debugPaneSize?: number;
  error: Error;
  logs?: boolean;
  view?: View;
  navItem?: string;

  setDebugPaneSize: (val: any) => void;
  showLogs: (val: any) => void;
  toggleDebugPane: () => void;
}

export default class VizPane extends React.Component<Props> {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.getComponent = this.getComponent.bind(this);
  }
  public componentDidMount() {
    if (this.props.logs) {
      this.props.showLogs(true);
    }
  }
  public getComponent() {
    if (this.props.view) {
      switch (this.props.navItem) {
        case NAVBAR.DataViewer:
          return <DataViewer />;
        case NAVBAR.SignalViewer:
          return <SignalViewer />;
        default:
          return null;
      }
    } else {
      return null;
    }
  }
  public handleChange(size: number) {
    this.props.setDebugPaneSize(size);
    if ((size > LAYOUT.MinPaneSize && !this.props.debugPane) || (size === LAYOUT.MinPaneSize && this.props.debugPane)) {
      this.props.toggleDebugPane();
    }
  }
  public componentDidUpdate() {
    if (this.props.debugPaneSize === LAYOUT.MinPaneSize) {
      this.props.setDebugPaneSize(LAYOUT.DebugPaneSize);
    }
    if (this.props.error) {
      this.props.showLogs(true);
    }
  }
  public render() {
    const debugPane = this.refs.debugPane as any;
    if (debugPane) {
      debugPane.pane2.style.height = this.props.debugPane
        ? (this.props.debugPaneSize || window.innerHeight * 0.4) + 'px'
        : LAYOUT.MinPaneSize + 'px';
    }
    const container = (
      <div className="chart-container">
        <ErrorBoundary>
          <Renderer />
        </ErrorBoundary>
        <Toolbar />
      </div>
    );
    return (
      <SplitPane
        ref="debugPane"
        split="horizontal"
        primary="second"
        minSize={LAYOUT.MinPaneSize}
        defaultSize={this.props.debugPane ? this.props.debugPaneSize : LAYOUT.MinPaneSize}
        onChange={this.handleChange}
        paneStyle={{ display: 'flex' }}
        onDragFinished={() => {
          if (this.props.debugPaneSize === LAYOUT.MinPaneSize) {
            this.props.setDebugPaneSize(LAYOUT.DebugPaneSize);
            // Popping up the the debug panel for the first time will set its
            // height to LAYOUT.DebugPaneSize. This can change depending on the UI.
          }
        }}
      >
        {container}
        <div className="debug-pane">
          <DebugPaneHeader />
          {this.props.logs ? <ErrorPane /> : this.getComponent()}
        </div>
      </SplitPane>
    );
  }
}
