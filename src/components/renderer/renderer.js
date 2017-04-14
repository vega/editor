import React from 'react';
import * as vega from 'vega';

import './index.css';
window.VEGA_DEBUG = window.VEGA_DEBUG || {};

export default class Editor extends React.Component {
  static propTypes = {
    vegaSpec: React.PropTypes.object
  }

  renderVega (vegaSpec) {
    this.refs.chart.style.width = this.refs.chart.getBoundingClientRect().width + 'px';
    const runtime = vega.parse(vegaSpec);
    const view = new vega.View(runtime)
      .logLevel(vega.Warn)
      .initialize(this.refs.chart)
      .renderer(this.props.renderer)
      .hover()
      .run();

    this.refs.chart.style.width = 'auto';
    window.VEGA_DEBUG.view = view;
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
        <div className='chart'>
          <div ref='chart'>
          </div>
        </div>
      </div>
    );
  };
};
