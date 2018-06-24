import './index.css';

import * as React from 'react';
import SplitPane from 'react-split-pane';

import ErrorBoundary from '../error-boundary';
import ErrorPane from '../error-pane';
import Renderer from '../renderer';
import Toolbar from '../toolbar';

interface Props {
  errorPane?: boolean;
}

export default class VizPane extends React.Component<Props> {
  public render() {
    const container = (
      <div className="chart-container">
        <ErrorBoundary>
          <Renderer />
        </ErrorBoundary>
        <Toolbar />
      </div>
    );
    if (this.props.errorPane) {
      return (
        <SplitPane split="horizontal" defaultSize={window.innerHeight * 0.6} paneStyle={{ display: 'flex' }}>
          {container}
          <ErrorPane />
        </SplitPane>
      );
    } else {
      return container;
    }
  }
}
