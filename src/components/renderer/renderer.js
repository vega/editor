import React from 'react';
import * as vega from 'vega';

import './index.css';
window.VEGA_DEBUG = window.VEGA_DEBUG || {};

export default class Editor extends React.Component {
  static propTypes = {
    vegaSpec: React.PropTypes.object
  }

  renderVega (props) {
    this.refs.chart.style.width = this.refs.chart.getBoundingClientRect().width + 'px';
    const runtime = vega.parse(props.vegaSpec);
    const view = new vega.View(runtime)
      .logLevel(vega.Warn)
      .initialize(this.refs.chart)
      .renderer(props.renderer)
      .hover()
      .run();

    this.refs.chart.style.width = 'auto';
    window.VEGA_DEBUG.view = view;
  }

  componentDidMount () {
    this.renderVega(this.props);
  }

  componentWillReceiveProps (nextProps) {
    this.renderVega(nextProps);
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
