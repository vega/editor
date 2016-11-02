
import React from 'react';

import './index.css';

export default class Toolbar extends React.Component {
  static propTypes = {
    debug: React.PropTypes.bool,
    renderer: React.PropTypes.string
  }

  render () {
    return (
      <div className='toolbar'>
        <div className='debug-toggle' onClick={this.props.toggleDebug}>
          {
            this.props.debug ? 'Hide debug tools' : 'Show debug tools'
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
