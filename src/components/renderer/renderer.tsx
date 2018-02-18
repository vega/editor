import "./index.css";
import "vega-tooltip/build/vega-tooltip.css";
import React from "react";
import * as vega from "vega";
import * as vegaTooltip from "vega-tooltip";
import { MODES } from "../../constants";
type EditorProps = {
  vegaSpec?: object,
  vegaLiteSpec?: object,
  renderer?: string,
  mode?: string,
  tooltip?: boolean
};
export default class Editor extends React.Component<EditorProps, {}> {
  renderVega(props) {
    this.refs.chart.style.width =
      this.refs.chart.getBoundingClientRect().width + "px";
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
    this.refs.chart.style.width = "auto";
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
