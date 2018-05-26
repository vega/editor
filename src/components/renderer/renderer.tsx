import './index.css';

import * as React from 'react';
import { Edit3, Maximize } from 'react-feather';
import { Portal } from 'react-portal';
import { withRouter } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import * as vega from 'vega';
import vegaTooltip from 'vega-tooltip';
import { Mode } from '../../constants';
import addProjections from '../../utils/addProjections';

// Add additional projections
addProjections(vega.projection);

interface Props {
  vegaSpec?: object;
  vegaLiteSpec?: object;
  renderer?: string;
  mode?: Mode;
  export?: boolean;
  baseURL?: string;
  history?: any;

  exportVega: (val: any) => void;
  setDataSets: (val: any) => void;
}

interface State {
  fullscreen: boolean;
}

const KEYCODES = {
  ESCAPE: 27,
};

class Editor extends React.Component<Props, State> {
  public static view: vega.View;
  public static pathname: string;

  constructor(props) {
    super(props);
    this.state = {
      fullscreen: false,
    };
    this.handleKeydown = this.handleKeydown.bind(this);
    this.onOpenPortal = this.onOpenPortal.bind(this);
    this.onClosePortal = this.onClosePortal.bind(this);
  }
  // Callback to opening portal
  public onOpenPortal() {
    const pathname = Editor.pathname;
    if (pathname !== '/' && pathname !== '/edited') {
      this.props.history.push(pathname + '/view');
    }
  }
  // Callback to closing portal
  public onClosePortal() {
    let pathname = Editor.pathname;
    pathname = pathname
      .split('/')
      .filter(e => e !== 'view')
      .join('/');
    if (pathname !== '/' && pathname !== '/edited') {
      this.props.history.push(pathname);
    }
  }
  // Close portal on pressing escape key
  public handleKeydown(e) {
    if (e.keyCode === KEYCODES.ESCAPE && this.state.fullscreen) {
      this.setState({ fullscreen: false }, this.onClosePortal);
    }
  }
  // Initialize the view instance
  public initView(props) {
    const runtime = vega.parse(props.vegaSpec);

    const loader = vega.loader();
    const originalLoad = loader.load.bind(loader);

    // Custom Loader
    loader.load = async (url, options) => {
      try {
        if (options) {
          return await originalLoad(url, { ...options, ...{ baseURL: this.props.baseURL } });
        }
        return await originalLoad(url, { baseURL: this.props.baseURL });
      } catch {
        return await originalLoad(url, options);
      }
    };

    // Initialize view instance
    Editor.view = new vega.View(runtime, {
      loader,
      logLevel: vega.Warn,
    });
  }
  public renderVega(props) {
    // Selecting chart for rendering vega
    const chart = this.state.fullscreen ? (this.refs.fchart as any) : (this.refs.chart as any);
    chart.style.width = chart.getBoundingClientRect().width + 'px';
    // Parsing pathname from URL
    Editor.pathname = window.location.hash.split('#')[1];

    Editor.view
      .initialize(chart)
      .renderer(props.renderer)
      .hover()
      .runAsync()
      .then(async view => {
        // Get all datasets using view
        const dataSets = await Editor.view.getState({ data: vega.truthy, signals: vega.falsy, recurse: true }).data;
        // Storing datasets in state
        this.props.setDataSets(dataSets);
      });

    chart.style.width = 'auto';

    vegaTooltip(Editor.view);

    // Export visualization as SVG/PNG
    if (props.export) {
      const ext = props.renderer === 'canvas' ? 'png' : 'svg';
      const url = Editor.view.toImageURL(ext);
      url
        .then(href => {
          if (ext === 'png') {
            const link = document.createElement('a');
            link.setAttribute('href', href);
            link.setAttribute('target', '_blank');
            link.setAttribute('download', 'visualization.' + ext);
            link.dispatchEvent(new MouseEvent('click'));
          } else {
            const tab = window.open();
            tab.document.write('<title>SVG</title><img src="' + href + '"/>');
          }
        })
        .catch(err => {
          throw new Error('Error in exporting: ' + err);
        });
    }

    (window as any).VEGA_DEBUG.view = Editor.view;
  }
  public componentDidMount() {
    this.initView(this.props);
    this.renderVega(this.props);
    // Add listener to event keydown
    document.addEventListener('keydown', this.handleKeydown);
    // Enter fullscreen mode if url ends with /view
    const params = Editor.pathname.split('/');
    if (params[params.length - 1] === 'view') {
      this.setState({ fullscreen: true });
    }
  }
  public componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.vegaSpec !== this.props.vegaSpec ||
      prevProps.vegaLiteSpec !== this.props.vegaLiteSpec ||
      prevProps.baseURL !== this.props.baseURL
    ) {
      this.initView(this.props);
    }
    this.renderVega(this.props);
  }
  public componentWillUnmount() {
    // Remove listener to event keydown
    document.removeEventListener('keydown', this.handleKeydown);
  }
  public componentWillReceiveProps(nextProps) {
    if (nextProps.export) {
      this.props.exportVega(false);
    }
  }
  public render() {
    return (
      <div>
        <div className="chart">
          <div ref="chart" />
        </div>
        <Maximize
          data-tip="Fullscreen"
          className="fullscreen-open"
          onClick={() => {
            this.setState({ fullscreen: true }, this.onOpenPortal);
          }}
        />
        {this.state.fullscreen && (
          <Portal>
            <div className="chart fullscreen-chart">
              <div ref="fchart" />
              <button
                className="fullscreen-close"
                onClick={() => {
                  this.setState({ fullscreen: false }, this.onClosePortal);
                }}
              >
                <Edit3 size={16} />
                <span>{'Edit'}</span>
              </button>
            </div>
          </Portal>
        )}
        <ReactTooltip place="left" type="dark" effect="solid" />
      </div>
    );
  }
}

export default withRouter(Editor);
