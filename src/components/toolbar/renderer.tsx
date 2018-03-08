import './index.css';

import * as React from 'react';
import * as vega from 'vega';
import * as vl from 'vega-lite';
import {Mode, NAMES} from '../../constants/consts';

const getVersion = (mode: Mode) => {
  return mode === Mode.Vega ? vega.version : vl.version;
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
  export?: boolean;

  showErrorPane: Function;
  exportVega: Function;
};

export default class Toolbar extends React.Component<Props> {
  public showErrorAndWarnings() {
    if (this.props.error) {
      return (
        <div className='error-indicator' onClick={(e) => this.props.showErrorPane()}>
          Error
        </div>
      );
    } else if (this.props.warningsLogger.warns.length > 0) {
      return (
        <div className='warning-indicator' onClick={(e) => this.props.showErrorPane()}>
          Warning
        </div>
      );
    }
  }
  public componentWillReceiveProps(nextProps) {
    if (nextProps.export) {
      this.props.exportVega(false);
    }
  }
  public render() {
    return (
      <div className='toolbar'>
        {this.showErrorAndWarnings()}
        <div className='status'>
          {`${NAMES[this.props.mode]} version ${getVersion(this.props.mode)}`}
        </div>
        <div className='autoParse' onClick={this.props.toggleAutoParse}>
          {this.props.autoParse ? 'Parse: auto' : 'Parse: manual'}
        </div>
        <div className='tooltip-toggle' onClick={this.props.showTooltip}>
          {this.props.tooltip ? 'Tooltips' : 'No Tooltips'}
        </div>
        <div className='renderer-toggle' onClick={this.props.cycleRenderer}>
          {`Renderer: ${this.props.renderer === 'canvas' ? 'Canvas' : 'SVG'}`}
        </div>
        <div className='vega-export' onClick={() => this.props.exportVega(true)}>
          {this.props.renderer === 'canvas' ? 'Export PNG' : 'Export SVG'}
        </div>
      </div>
    );
  }
}
