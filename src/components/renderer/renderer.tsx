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
  export?: boolean;
};

export default class Editor extends React.Component<Props> {
  static view: vega.View;

  public renderVega(props) {
    const chart = this.refs.chart as any;
    chart.style.width = chart.getBoundingClientRect().width + 'px';

    const runtime = vega.parse(props.vegaSpec);

    Editor.view = new vega.View(runtime)
      .logLevel(vega.Warn)
      .initialize(chart)
      .renderer(props.renderer);

    if (props.mode === Mode.Vega) {
      Editor.view.hover();
    }

    Editor.view.run();
    chart.style.width = 'auto';

    if (this.props.tooltip) {
      if (props.mode === Mode.VegaLite) {
        if (props.vegaLiteSpec) {
          vegaTooltip.vegaLite(Editor.view, props.vegaLiteSpec);
        }
      } else {
        vegaTooltip.vega(Editor.view);
      }
    }

    (window as any).VEGA_DEBUG.view = Editor.view;
  }
  public exportVega() {
    if (this.props.export) {
      const ext = this.props.renderer === 'canvas' ? 'png' : 'svg';
      const url = Editor.view.toImageURL(ext);
      url.then(url => {
        var link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('target', '_blank');
        if (ext === 'png') link.setAttribute('download', 'export.'+ ext);
        link.dispatchEvent(new MouseEvent('click'));
      }).catch(err => {
        throw new Error('Error in exporting: '+ err);
      });
    }
  }
  public componentDidMount() {
    this.renderVega(this.props);
  }
  public componentDidUpdate(prevProps) {
    prevProps.export === this.props.export ? this.renderVega(this.props) : this.exportVega();
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
