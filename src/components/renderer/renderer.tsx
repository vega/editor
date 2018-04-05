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
  baseURL?: string;
};

export default class Editor extends React.Component<Props> {
  static view: vega.View;
  static chart: any;

  public initilizeView(props) {
    Editor.chart = this.refs.chart as any;
    Editor.chart.style.width = Editor.chart.getBoundingClientRect().width + 'px';

    const runtime = vega.parse(props.vegaSpec);

    const loader = vega.loader();
    const originalLoad = loader.load.bind(loader);
    // Custom Loader
    loader.load = async(url, options) => {
      try {
        return await originalLoad(url, {options, ...{baseURL: this.props.baseURL}});
      } catch {
        return await originalLoad(url, options);
      }
    };

    Editor.view = new vega.View(runtime, {
      loader: loader,
      logLevel: vega.Warn,
    })
    .initialize(Editor.chart);
  }
  public renderVega(props) {
    Editor.view.renderer(props.renderer);

    if (props.mode === Mode.Vega) {
      Editor.view.hover();
    }
    Editor.view.run();
    Editor.chart.style.width = 'auto';

    const options = {showAllFields: props.tooltip}
    if (props.mode === Mode.VegaLite) {
      if (props.vegaLiteSpec) {
        vegaTooltip.vegaLite(Editor.view, props.vegaLiteSpec, options);
      }
    } else {
      vegaTooltip.vega(Editor.view, options);
    }

    if (props.export) {
      const ext = props.renderer === 'canvas' ? 'png' : 'svg';
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
    (window as any).VEGA_DEBUG.view = Editor.view;
  }
  public componentDidMount() {
    this.initilizeView(this.props);
    this.renderVega(this.props);
  }
  public componentDidUpdate(prevProps) {
    if (prevProps.vegaSpec !== this.props.vegaSpec || prevProps.vegaLiteSpec !== this.props.vegaLiteSpec || prevProps.baseURL !== this.props.baseURL) this.initilizeView(this.props);
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
