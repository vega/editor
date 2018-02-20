import './index.css';
import 'vega-tooltip/build/vega-tooltip.css';

import * as React from 'react';
import * as vega from 'vega';
import * as vegaTooltip from 'vega-tooltip';

import { MODES } from '../../constants';

type Props = {
  vegaSpec?: object;
  vegaLiteSpec?: object;
  renderer?: string;
  mode?: string;
  tooltip?: boolean;
};

export default class Editor extends React.Component<Props> {
  renderVega(props) {
    const chart = this.refs.chart as any;
    chart.style.width = chart.getBoundingClientRect().width + 'px';

    const runtime = vega.parse(props.vegaSpec);

    const view = new vega.View(runtime)
      .logLevel(vega.Warn)
      .initialize(chart)
      .renderer(props.renderer);

    if (props.mode === MODES.Vega) {
      view.hover();
    }

    view.run();
    chart.style.width = 'auto';

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
