/** @prettier */

import * as React from 'react';
import * as vegaTooltip from 'vega-tooltip';
import * as vega from 'vega';

import {MODES} from '../../constants';

import 'vega-tooltip/build/vega-tooltip.css';

import './index.css';

type Props = {
  vegaSpec?: object;
  vegaLiteSpec?: object;
  renderer?: string;
  mode?: string;
  tooltip?: boolean;
};
export default class Editor extends React.Component<Props> {
  renderVega(props) {
    (this.refs.chart as any).style.width = // $FixMe
      (this.refs.chart as any).getBoundingClientRect().width + 'px'; // $FixMe
    let runtime;
    let view;
    runtime = vega.parse(props.vegaSpec);
    view = new vega.View(runtime)
      .logLevel(vega.Warn)
      .initialize(this.refs.chart)
      .renderer(props.renderer);
    if (props.mode === MODES.Vega) {
      view.hover();
    }
    view.run();
    (this.refs.chart as any).style.width = 'auto'; // $FixMe
    if (this.props.tooltip) {
      if (props.mode === MODES.VegaLite) {
        vegaTooltip.vegaLite(view, props.vegaLiteSpec);
      } else {
        vegaTooltip.vega(view);
      }
    }
    window.VEGA_DEBUG.view = view;
  }
  componentDidMount() {
    this.renderVega(this.props);
  }
  componentDidUpdate() {
    this.renderVega(this.props);
  }
  render() {
    return (
      <div className="chart">
        <div ref="chart" />
        {this.props.tooltip ? (
          <div id="vis-tooltip" className="vg-tooltip" />
        ) : null}
      </div>
    );
  }
}
