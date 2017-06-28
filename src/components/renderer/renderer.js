import React from 'react';
import PropTypes from 'prop-types';
import * as vega from 'vega';
import 'vega-tooltip/build/vega-tooltip.css';
import './index.css';
import Vega from '../../constants'
import * as vegaTooltip from 'vega-tooltip';

export default class Editor extends React.Component {
  static propTypes = {
    vegaSpec: PropTypes.object,
    renderer: PropTypes.string,
    mode: PropTypes.string
  }

  renderVega (props) {
    this.refs.chart.style.width = this.refs.chart.getBoundingClientRect().width + 'px';
    const runtime = vega.parse(props.vegaSpec);
    const view = new vega.View(runtime)
      .logLevel(vega.Warn)
      .initialize(this.refs.chart)
      .renderer(props.renderer)
    
    if (props.mode === Vega) {
      view.hover()
    }

    view.run();

    this.refs.chart.style.width = 'auto';
    vegaTooltip.vega(view);
    window.VEGA_DEBUG.view = view;
  }

  componentDidMount () {
    this.renderVega(this.props);
  }

  componentWillReceiveProps (nextProps) {
    this.renderVega(nextProps);
  }

  render () {
    return (
      <div className='chart-container'>
        <div className='chart'>
          <div ref='chart'>
          </div>
          <div id="vis-tooltip" className="vg-tooltip">
          </div>
        </div>
      </div>
    );
  };
};
