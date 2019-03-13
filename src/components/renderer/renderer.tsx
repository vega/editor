import * as React from 'react';
import { Edit3, Maximize } from 'react-feather';
import { Portal } from 'react-portal';
import { withRouter } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import * as vega from 'vega';
import vegaTooltip from 'vega-tooltip';
import { Mode, View } from '../../constants';
import addProjections from '../../utils/addProjections';
import './index.css';

// Add additional projections
addProjections(vega.projection);

interface Props {
  vegaSpec?: object;
  vegaLiteSpec?: object;
  renderer?: string;
  mode?: Mode;
  baseURL?: string;
  history?: any;
  editorString?: string;
  location?: any;

  setView: (val: any) => void;
}

const defaultState = { fullscreen: false };

type State = Readonly<typeof defaultState>;

const KEYCODES = {
  ESCAPE: 27,
};

class Editor extends React.Component<Props, State> {
  public static view: View;
  public static pathname: string;
  public readonly state: State = defaultState;

  constructor(props) {
    super(props);
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

    // finalize previous view so that memory can be freed
    if (Editor.view) {
      Editor.view.finalize();
    }

    Editor.view = new vega.View(runtime, {
      loader,
      logLevel: vega.Warn,
    }).hover();
  }
  public renderVega(props) {
    // Selecting chart for rendering vega
    const chart = this.state.fullscreen ? (this.refs.fchart as any) : (this.refs.chart as any);
    chart.style.width = chart.getBoundingClientRect().width + 'px';
    // Parsing pathname from URL
    Editor.pathname = window.location.hash.split('#')[1];

    Editor.view
      .renderer(props.renderer)
      .initialize(chart)
      .run();

    chart.style.width = 'auto';

    vegaTooltip(Editor.view);

    (window as any).VEGA_DEBUG.view = Editor.view;
  }
  public componentDidMount() {
    this.initView(this.props);
    this.renderVega(this.props);
    // Add Event Listener to cntrl+f11 key
    document.addEventListener('keydown', e => {
      // Keycode of f11 is 122
      if (e.keyCode === 122 && (e.ctrlKey || e.metaKey)) {
        this.setState(current => {
          return {
            ...current,
            fullscreen: !current.fullscreen,
          };
        });
      }
    });
    // Add listener to event keydown
    document.addEventListener('keydown', this.handleKeydown);
    // Enter fullscreen mode if url ends with /view
    const params = Editor.pathname.split('/');
    if (params[params.length - 1] === 'view') {
      this.setState({ fullscreen: true });
    }
    this.props.setView(Editor.view);
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
    if (prevProps.editorString !== this.props.editorString) {
      this.props.setView(Editor.view);
    }
  }
  public componentWillUnmount() {
    // Remove listener to event keydown
    document.removeEventListener('keydown', this.handleKeydown);
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
