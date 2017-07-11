import React from 'react';
import PropTypes from 'prop-types';
import * as vega from 'vega';
import 'vega-tooltip/build/vega-tooltip.css';
import './index.css';
import {MODES} from '../../constants'
import * as vegaTooltip from 'vega-tooltip';
import Error from '../error';
import ErrorPane from '../error-pane';
import Toolbar from '../toolbar';
import SplitPane from 'react-split-pane';

export default class Editor extends React.Component {
  static propTypes = {
    vegaSpec: PropTypes.object,
    renderer: PropTypes.string,
    mode: PropTypes.string
  }

  renderVega(props) {
    this.refs.chart.style.width = this.refs.chart.getBoundingClientRect().width + 'px';
    let runtime;
    let view;
    try {
      runtime = vega.parse(props.vegaSpec);
      view = new vega.View(runtime)
      .logLevel(vega.Warn)
      .initialize(this.refs.chart)
      .renderer(props.renderer)

      if (props.mode === MODES.Vega) {
        view.hover()
      }
      view.run();
    } catch (err) {
      this.props.logError(err.toString());
      throw err;
    }
    this.refs.chart.style.width = 'auto';
    if (this.props.tooltip) {
      vegaTooltip.vega(view);
    }
    window.VEGA_DEBUG.view = view;
  }

  componentDidMount() {
    this.renderVega(this.props);
  }

  componentDidUpdate() {
    this.renderVega(this.props);
  }

  renderChart() {
    return (
      <div className='chart-container'>
        <Error />
        <div className='chart'>
          <div ref='chart'>
          </div>
          {this.props.tooltip ? <div id='vis-tooltip' className='vg-tooltip'></div> : null}
        </div>
        <Toolbar />
      </div>
    );
  }

  render() {
    if (this.props.errorPane) {
      return ( 
        <SplitPane split='horizontal' defaultSize={window.innerHeight * 0.6}
          paneStyle={{display: 'flex'}}>
          {this.renderChart()}
          <ErrorPane />
        </SplitPane>
      );
    } else {
      return (
        this.renderChart()
      );
    }
  }
}
