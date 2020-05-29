import {UnregisterCallback} from 'history';
import * as React from 'react';
import {Maximize} from 'react-feather';
import {Portal} from 'react-portal';
import {RouteComponentProps, withRouter} from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import * as vega from 'vega';
import {deepEqual} from 'vega-lite/build/src/util';
import vegaTooltip from 'vega-tooltip';
import {mapDispatchToProps, mapStateToProps} from '.';
import {KEYCODES, Mode} from '../../constants';
import addProjections from '../../utils/addProjections';
import './index.css';
import {dispatchingLogger} from '../../utils/logger';

// Add additional projections
addProjections(vega.projection);

type Props = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps> & RouteComponentProps;

const defaultState = {fullscreen: false, width: 500, height: 300};

type State = Readonly<typeof defaultState>;

class Editor extends React.PureComponent<Props, State> {
  public static pathname: string;
  public unlisten: UnregisterCallback;

  constructor(props) {
    super(props);
    this.state = defaultState;
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
      .filter((e) => e !== 'view')
      .join('/');
    if (pathname !== '/' && pathname !== '/edited') {
      this.props.history.push(pathname);
    }
  }
  // Close portal on pressing escape key
  public handleKeydown(e) {
    if (e.keyCode === KEYCODES.ESCAPE && this.state.fullscreen) {
      this.setState({fullscreen: false}, this.onClosePortal);
    }
  }

  // Determine if the Vega spec has responsive width/height.
  // Current criteria:
  // - Width(height) is defined as a signal
  // - The init property of the signal uses "containerSize".
  public isResponsive(): {
    responsiveWidth: boolean;
    responsiveHeight: boolean;
  } {
    const spec = this.props.vegaSpec;
    let responsiveWidth = false;
    let responsiveHeight = false;
    // Check for signals
    if (spec.signals) {
      for (const signal of spec.signals) {
        if (
          signal.name == 'width' &&
          (signal as vega.InitSignal).init &&
          (signal as vega.InitSignal).init.indexOf('containerSize') >= 0
        ) {
          responsiveWidth = true;
        }
        if (
          signal.name == 'height' &&
          (signal as vega.InitSignal).init &&
          (signal as vega.InitSignal).init.indexOf('containerSize') >= 0
        ) {
          responsiveHeight = true;
        }
      }
    }
    return {responsiveWidth, responsiveHeight};
  }

  public handleResizeMouseDown(eDown: React.MouseEvent) {
    const {responsiveWidth, responsiveHeight} = this.isResponsive();
    // Record initial mouse position and view size
    const x0 = eDown.pageX;
    const y0 = eDown.pageY;
    const width0 = this.state.width;
    const height0 = this.state.height;
    // Update size on window.mousemove
    const onMove = (eMove: MouseEvent) => {
      const x1 = eMove.pageX;
      const y1 = eMove.pageY;
      const factor = this.state.fullscreen ? 2 : 1;
      this.setState(
        {
          width: responsiveWidth ? Math.max(10, width0 + (x1 - x0) * factor) : this.state.width,
          height: responsiveHeight ? Math.max(10, height0 + (y1 - y0) * factor) : this.state.height,
        },
        () => {
          // Dispatch window.resize, that currently the only way to inform Vega about container size change.
          this.triggerResize();
        }
      );
    };
    // Remove listeners on window.mouseup
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    // Add listeners
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  // Initialize the view instance
  public initView() {
    const {vegaSpec, config, baseURL, mode, setView, hoverEnable} = this.props;

    let runtime: vega.Runtime;
    if (mode === Mode.VegaLite) {
      // In vl mode, we compile Vega-Lite spec along with config to Vega spec
      runtime = vega.parse(vegaSpec);
    } else {
      runtime = vega.parse(vegaSpec, config);
    }
    const loader = vega.loader();
    const originalLoad = loader.load.bind(loader);

    // Custom Loader
    loader.load = async (url, options) => {
      try {
        if (options) {
          return await originalLoad(url, {
            ...options,
            ...{baseURL: baseURL},
          });
        }
        return await originalLoad(url, {baseURL: baseURL});
      } catch {
        return await originalLoad(url, options);
      }
    };

    // Finalize previous view so that memory can be freed
    if (this.props.view) {
      this.props.view.finalize();
    }

    const hover = typeof hoverEnable === 'boolean' ? hoverEnable : mode === Mode.Vega;
    const view = new vega.View(runtime, {
      hover,
      loader,
    });

    (view as any).logger(dispatchingLogger);

    (window as any).VEGA_DEBUG.view = view;
    setView(view);
  }

  public renderVega() {
    // Selecting chart for rendering vega
    const chart = this.state.fullscreen ? (this.refs.fchart as any) : (this.refs.chart as any);
    if (!(this.isResponsive().responsiveWidth || this.isResponsive().responsiveHeight)) {
      chart.style.width = chart.getBoundingClientRect().width + 'px';
      chart.style.width = 'auto';
    }

    // Parsing pathname from URL
    Editor.pathname = window.location.hash.split('#')[1];

    const {view, renderer, tooltipEnable} = this.props;

    if (!view) {
      return;
    }

    view.renderer(renderer).initialize(chart);

    view.runAsync();

    if (tooltipEnable) {
      // Tooltip needs to be added after initializing the view with `chart`
      vegaTooltip(view);
    }
  }

  public triggerResize() {
    try {
      window.dispatchEvent(new Event('resize'));
    } catch (e) {
      console.error(e);
    }
  }

  public componentDidMount() {
    this.unlisten = this.props.history.listen((location) => {
      if (location && location.pathname.endsWith('view')) {
        this.setState({
          fullscreen: true,
        });
      } else {
        this.setState({
          fullscreen: false,
        });
      }
    });

    this.initView();
    this.renderVega();

    // Add Event Listener to ctrl+f11 key
    document.addEventListener('keydown', (e) => {
      // Keycode of f11 is 122
      if (e.keyCode === 122 && (e.ctrlKey || e.metaKey)) {
        this.setState((current) => {
          return {
            ...current,
            fullscreen: !current.fullscreen,
          };
        });
      }
    });

    document.addEventListener('keydown', this.handleKeydown);

    // Enter fullscreen mode if url ends with /view
    const params = Editor.pathname.split('/');
    if (params[params.length - 1] === 'view') {
      this.setState({fullscreen: true});
    }
  }

  public componentDidUpdate(prevProps) {
    if (
      !deepEqual(prevProps.vegaSpec, this.props.vegaSpec) ||
      !deepEqual(prevProps.vegaLiteSpec, this.props.vegaLiteSpec) ||
      prevProps.baseURL !== this.props.baseURL ||
      !deepEqual(prevProps.config, this.props.config) ||
      !deepEqual(prevProps.logLevel, this.props.logLevel) ||
      !deepEqual(prevProps.mode, this.props.mode) ||
      !deepEqual(prevProps.hoverEnable, this.props.hoverEnable) ||
      !deepEqual(prevProps.tooltipEnable, this.props.tooltipEnable)
    ) {
      this.initView();
    }
    this.renderVega();
  }

  public componentWillUnmount() {
    // Remove listener to event keydown
    document.removeEventListener('keydown', this.handleKeydown);
    this.unlisten();
  }

  // Render resize handle for responsive charts
  public renderResizeHandle() {
    const {responsiveWidth, responsiveHeight} = this.isResponsive();
    if (responsiveWidth || responsiveHeight) {
      // The handle is defined as a inline SVG
      return (
        <div className="chart-resize-handle" onMouseDown={this.handleResizeMouseDown.bind(this)}>
          <svg width="10" height="10">
            <path d="M-2,13L13,-2 M-2,16L16,-2 M-2,19L19,-2" />
          </svg>
        </div>
      );
    }
  }

  public render() {
    const {responsiveWidth, responsiveHeight} = this.isResponsive();
    // Determine chart element style based on responsiveness
    const chartStyle =
      responsiveWidth || responsiveHeight
        ? {
            width: responsiveWidth ? this.state.width + 'px' : null,
            height: responsiveHeight ? this.state.height + 'px' : null,
          }
        : {};
    return (
      <div>
        <div className="chart" style={{backgroundColor: this.props.backgroundColor}}>
          <div
            data-tip={`Click on "Continue Recording" to make the chart interactive`}
            data-place="right"
            className="chart-overlay"
          ></div>
          <div aria-label="visualization" ref="chart" style={chartStyle} />
          {this.renderResizeHandle()}
        </div>
        <div className="fullscreen-open">
          <Maximize
            data-tip="Fullscreen"
            onClick={() => {
              this.setState({fullscreen: true}, this.onOpenPortal);
            }}
          />
        </div>
        {this.state.fullscreen && (
          <Portal>
            <div className="fullscreen-chart">
              <div className="chart" style={{backgroundColor: this.props.backgroundColor}}>
                <div ref="fchart" style={chartStyle} />
                {this.renderResizeHandle()}
              </div>
              <button
                className="fullscreen-close"
                onClick={() => {
                  this.setState({fullscreen: false}, this.onClosePortal);
                }}
              >
                <span>Edit Visualization</span>
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
