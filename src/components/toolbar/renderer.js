import React from 'react';

import './index.css';
//const vega = require('vega');
//import * as vega from 'vega';

export default class Toolbar extends React.Component {
  static propTypes = {
    error: React.PropTypes.string,
    debug: React.PropTypes.bool,
    renderer: React.PropTypes.string
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

  render () {
    return (
      <div className='toolbar'>
        {this.renderWarningsAndErrors()}
        {/*<div className='debug-toggle' onClick={this.props.toggleDebug}>
          {
            this.props.debug ? 'Hide debug tools' : 'Show debug tools'
          }
        </div>*/}
        <div className='status'>
          {
            `Mode: ${this.props.mode}`

          }
        </div>
        <div className='renderer-toggle' onClick={this.props.cycleRenderer}>
          {
            `Renderer: ${this.props.renderer}`
          }
        </div>
      </div>
    );
  };
};
