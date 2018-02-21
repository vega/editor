import 'vega-tooltip/build/vega-tooltip.css';
import './index.css';

import * as React from 'react';
import * as vega from 'vega';
import * as vegaTooltip from 'vega-tooltip';

import {Mode} from '../../constants';

type Props = {
  vegaSpec?: object;
  vegaLiteSpec?: object;
  renderer?: string;
  mode?: string;
  tooltip?: boolean;
};

export default class Editor extends React.Component<Props> {
  public renderVega(props) {
    const chart = this.refs.chart as any;
    chart.style.width = chart.getBoundingClientRect().width + 'px';

    const runtime = vega.parse(props.vegaSpec);

    const view = new vega.View(runtime)
      .logLevel(vega.Warn)
      .initialize(chart)
      .renderer(props.renderer);

    if (props.mode === Mode.Vega) {
      view.hover();
    }

    view.run();
    chart.style.width = 'auto';

    if (this.props.tooltip) {
      if (props.mode === Mode.VegaLite) {
        if (props.vegaLiteSpec) {
          vegaTooltip.vegaLite(view, props.vegaLiteSpec);
        }
      } else {
        vegaTooltip.vega(view);
      }
    }

    (window as any).VEGA_DEBUG.view = view;
  }
  public componentDidMount() {
    this.renderVega(this.props);
  }
  public componentDidUpdate() {
    this.renderVega(this.props);
  }
  public render() {
    return (
      <div className='chart'>
        <div ref='chart' />
        {this.props.tooltip ? (
          <div id='vis-tooltip' className='vg-tooltip' />
        ) : null}
      </div>
    );
  }
}
