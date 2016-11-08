import React from 'react';
import * as vega from 'vega';

import './index.css';

export default class Editor extends React.Component {
  static propTypes = {
    vegaSpec: React.PropTypes.object
  }

  renderVega (vegaSpec) {
    const runtime = vega.parse(vegaSpec);
    new vega.View(runtime)
      .logLevel(vega.Warn)
      .initialize(this.refs.chart)
      .renderer(this.props.renderer)
      .hover()
      .run();
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
