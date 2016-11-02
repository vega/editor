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
      const vis = chart({ el: this.refs.chart, renderer: this.props.renderer });
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
      </div>
    );
  };
};
