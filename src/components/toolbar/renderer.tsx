import './index.css';

import * as React from 'react';
import * as vega from 'vega';
import * as vl from 'vega-lite';
import { Mode, NAMES } from '../../constants/consts';

const getVersion = (mode: Mode) => {
  return mode === Mode.Vega ? vega.version : vl.version;
};

interface Props {
  mode;
  warningsLogger;
  error?: string;
  renderer?: string;

  setRenderer: (val: any) => void;
  toggleDebugPane: () => void;
}

export default class Toolbar extends React.Component<Props> {
  public showErrorAndWarnings() {
    if (this.props.error) {
      return (
        <div className="error-indicator" onClick={e => this.props.toggleDebugPane()}>
          Error
        </div>
      );
    } else if (this.props.warningsLogger.warns.length > 0) {
      return (
        <div className="warning-indicator" onClick={e => this.props.toggleDebugPane()}>
          Warning
        </div>
      );
    }
  }
  public render() {
    return (
      <div className="toolbar">
        {this.showErrorAndWarnings()}
        <div className="status">{`${NAMES[this.props.mode]} version ${getVersion(this.props.mode)}`}</div>
        <div
          className="renderer-toggle"
          onClick={() => {
            // Cycle renderer
            const nextRenderer = this.props.renderer === 'svg' ? 'canvas' : 'svg';
            this.props.setRenderer(nextRenderer);
          }}
        >
          {`Renderer: ${this.props.renderer === 'canvas' ? 'Canvas' : 'SVG'}`}
        </div>
      </div>
    );
  }
}
