import React from 'react';

import './index.css';
import * as vega from 'vega';
import * as vl from 'vega-lite';

const getVersion = (mode) => {
  return mode === 'vega' ? vega.version : vl.version;
}

export default class Toolbar extends React.Component {
  static propTypes = {
    error: React.PropTypes.string,
    renderer: React.PropTypes.string,
    autoParse: React.PropTypes.bool
  }

  renderWarningsAndErrors() {
    if (this.props.error) {
      return (
        <div className='error-field'>
          {this.props.error}
        </div>
      )
    }
  }

  manualParseSpec() {
    if(!this.props.autoParse) {
      return (
        <div className='autoParse' onClick={this.props.parseSpec}>
          {`Parse`}
        </div>
      )
    }
  }

  render () {
    return (
      <div className='toolbar'>
        {this.renderWarningsAndErrors()}
        <div className='status'>
          {
            `Mode: ${this.props.mode}  Version: ${getVersion(this.props.mode)}`
          }
        </div>
        <div className='autoParse' onClick={this.props.toggleAutoParse}>
          {
            this.props.autoParse ? `Parse: auto` : `Parse: manual`
          }
        </div>
        {this.manualParseSpec()}
        <div className='renderer-toggle' onClick={this.props.cycleRenderer}>
          {
            `Renderer: ${this.props.renderer}`
          }
        </div>
      </div>
    );
  };
};
