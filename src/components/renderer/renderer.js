/* global vg, vl */

import React from 'react';
// import vl from 'vega-lite';
// import vg from 'vega';

import './index.css';

export default class Editor extends React.Component {
  static propTypes = {
    vegaSpec: React.PropTypes.object
  }

  renderVega (vegaSpec) {
    vg.parse.spec(vegaSpec, (chart) => {
      const vis = chart({ el: this.refs.chart });
      vis.update();
    });
  }

  componentDidMount () {
    this.renderVega(this.props.vegaSpec);
  }

  componentWillReceiveProps (nextProps) {
    this.renderVega(nextProps.vegaSpec);
    // visual.update(nextProps.vegaSpec);
  }

  render () {
    return (
      <div className='chart-container'>
        <div className='chart' ref='chart'>
        </div>
        <div className='toolbar'>
          <div className='debug-toggle' onClick={this.props.toggleDebug}>
            {
              this.props.debug ? 'Hide debug tools' : 'Show debug tools'
            }
          </div>
          <div className='renderer-toggle'>
            {
              'Renderer: SVG'
            }
          </div>
        </div>
      </div>
    );
  };
};
