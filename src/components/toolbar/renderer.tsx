/** @prettier */

import * as React from 'react';
import * as vl from 'vega-lite';
import * as vega from 'vega';

import './index.css';

const getVersion = (mode) => {
  return mode === 'vega' ? vega.version : vl.version;
};
type Props = {
  cycleRenderer;
  mode;
  showTooltip;
  toggleAutoParse;
  warningsLogger;
  error?: string;
  renderer?: string;
  autoParse?: boolean;
  tooltip?: boolean;

  showErrorPane: Function;
};
export default class Toolbar extends React.Component<Props> {
  showErrorAndWarnings() {
    if (this.props.error) {
      return (
        <div
          className="error-indicator"
          onClick={(e) => this.props.showErrorPane()}
        >
          Error
        </div>
      );
    } else if (this.props.warningsLogger.warns.length > 0) {
      return (
        <div
          className="warning-indicator"
          onClick={(e) => this.props.showErrorPane()}
        >
          Warning
        </div>
      );
    }
  }
  render() {
    return (
      <div className="toolbar">
        {this.showErrorAndWarnings()}
        <div className="status">
          {`${this.props.mode} version ${getVersion(this.props.mode)}`}
        </div>
        <div className="autoParse" onClick={this.props.toggleAutoParse}>
          {this.props.autoParse ? 'Parse: auto' : 'Parse: manual'}
        </div>
        <div className="tooltip-toggle" onClick={this.props.showTooltip}>
          {this.props.tooltip ? 'Tooltips' : 'No Tooltips'}
        </div>
        <div className="renderer-toggle" onClick={this.props.cycleRenderer}>
          {`Renderer: ${this.props.renderer}`}
        </div>
      </div>
    );
  }
}
