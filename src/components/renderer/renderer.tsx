import * as React from 'react';
import { Edit3, Maximize } from 'react-feather';
import { Portal } from 'react-portal';
import { withRouter } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import * as vega from 'vega';
import { deepEqual } from 'vega-lite/build/src/util';
import vegaTooltip from 'vega-tooltip';
import { mapDispatchToProps, mapStateToProps } from '.';
import { KEYCODES } from '../../constants';
import addProjections from '../../utils/addProjections';
import './index.css';

// Add additional projections
addProjections(vega.projection);

type Props = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps> & { history: any };

const defaultState = { fullscreen: false };

type State = Readonly<typeof defaultState>;

class Editor extends React.PureComponent<Props, State> {
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
  public initView() {
    const runtime = vega.parse(this.props.vegaSpec, this.props.config);

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
    if (this.props.view) {
      this.props.view.finalize();
    }

    const view = new vega.View(runtime, {
      loader,
      logLevel: vega.Warn,
    }).hover();

    (window as any).VEGA_DEBUG.view = this.props.view;

    vegaTooltip(view);

    this.props.setView(view);
  }
  public renderVega() {
    // Selecting chart for rendering vega
    const chart = this.state.fullscreen ? (this.refs.fchart as any) : (this.refs.chart as any);
    chart.style.width = chart.getBoundingClientRect().width + 'px';
    // Parsing pathname from URL
    Editor.pathname = window.location.hash.split('#')[1];

    chart.style.width = 'auto';

    if (!this.props.view) {
      return;
    }

    this.props.view
      .renderer(this.props.renderer)
      .initialize(chart)
      .runAsync();
  }
  public componentDidMount() {
    this.initView();
    this.renderVega();
    // Add Event Listener to ctrl+f11 key
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
  }
  public componentDidUpdate(prevProps, prevState) {
    if (
      !deepEqual(prevProps.vegaSpec, this.props.vegaSpec) ||
      !deepEqual(prevProps.vegaLiteSpec, this.props.vegaLiteSpec) ||
      prevProps.baseURL !== this.props.baseURL ||
      !deepEqual(prevProps.config, this.props.config)
    ) {
      this.initView();
    }
    this.renderVega();
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
