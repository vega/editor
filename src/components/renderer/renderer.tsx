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

// Add additional projections
addProjections(vega.projection);

type Props = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps> & RouteComponentProps;

const defaultState = {fullscreen: false, width: 500, height: 300};

type State = Readonly<typeof defaultState>;

class Editor extends React.PureComponent<Props, State> {
  public static pathname: string;
  public readonly state: State = defaultState;
  public unlisten: UnregisterCallback;

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
      this.setState({fullscreen: false}, this.onClosePortal);
    }
  }

  public isResponsive(): [boolean, boolean] {
    const spec = this.props.vegaSpec;
    let w = false;
    let h = false;
    if (spec.signals && spec.signals instanceof Array) {
      for (const signal of spec.signals) {
        if (signal.name == 'width' && (signal as vega.InitSignal).init == 'containerSize()[0]') {
          w = true;
        }
        if (signal.name == 'height' && (signal as vega.InitSignal).init == 'containerSize()[1]') {
          h = true;
        }
      }
    }
    return [w, h];
  }

  public handleResizeMouseDown(e: React.MouseEvent) {
    const x0 = e.pageX;
    const y0 = e.pageY;
    const width0 = this.state.width;
    const height0 = this.state.height;
    const [resizeWidth, resizeHeight] = this.isResponsive();
    const onMove = (eMove: MouseEvent) => {
      const x1 = eMove.pageX;
      const y1 = eMove.pageY;
      const factor = this.state.fullscreen ? 2 : 1;
      this.setState(
        {
          width: resizeWidth ? Math.max(10, width0 + (x1 - x0) * factor) : this.state.width,
          height: resizeHeight ? Math.max(10, height0 + (y1 - y0) * factor) : this.state.height
        },
        () => {
          // Dispatch window.resize, that currently the only way to inform Vega about container size change.
          this.triggerResize();
        }
      );
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  // Initialize the view instance
  public initView() {
    let runtime: vega.Runtime;
    if (this.props.mode === Mode.VegaLite) {
      // In vl mode, we compile Vega-Lite spec along with config to Vega spec
      runtime = vega.parse(this.props.vegaSpec);
    } else {
      runtime = vega.parse(this.props.vegaSpec, this.props.config);
    }
    const loader = vega.loader();
    const originalLoad = loader.load.bind(loader);

    // Custom Loader
    loader.load = async (url, options) => {
      try {
        if (options) {
          return await originalLoad(url, {
            ...options,
            ...{baseURL: this.props.baseURL}
          });
        }
        return await originalLoad(url, {baseURL: this.props.baseURL});
      } catch {
        return await originalLoad(url, options);
      }
    };

    // Finalize previous view so that memory can be freed
    if (this.props.view) {
      this.props.view.finalize();
    }

    const hover = typeof this.props.hoverEnable === 'boolean' ? this.props.hoverEnable : this.props.mode === Mode.Vega;
    const view = new vega.View(runtime, {
      hover,
      loader,
      logLevel: vega[this.props.logLevel]
    }).hover();

    (window as any).VEGA_DEBUG.view = view;

    if (this.props.tooltipEnable) {
      vegaTooltip(view);
    }

    this.props.setView(view);
  }

  public renderVega() {
    // Selecting chart for rendering vega
    const chart = this.state.fullscreen ? (this.refs.fchart as any) : (this.refs.chart as any);
    if (!(this.isResponsive()[0] || this.isResponsive()[1])) {
      chart.style.width = chart.getBoundingClientRect().width + 'px';
      chart.style.width = 'auto';
    }

    // Parsing pathname from URL
    Editor.pathname = window.location.hash.split('#')[1];

    if (!this.props.view) {
      return;
    }

    this.props.view
      .renderer(this.props.renderer)
      .initialize(chart)
      .runAsync();

    // Trigger the resize event if the chart is responsive. This seem to be necessary.
    if (this.isResponsive()[0] || this.isResponsive()[1]) {
      this.triggerResize();
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
    this.unlisten = this.props.history.listen(location => {
      if (location && location.pathname.endsWith('view')) {
        this.setState({
          fullscreen: true
        });
      } else {
        this.setState({
          fullscreen: false
        });
      }
    });

    this.initView();
    this.renderVega();
    // Add Event Listener to ctrl+f11 key
    document.addEventListener('keydown', e => {
      // Keycode of f11 is 122
      if (e.keyCode === 122 && (e.ctrlKey || e.metaKey)) {
        this.setState(current => {
          return {
            ...current,
            fullscreen: !current.fullscreen
          };
        });
      }
    });
    // Add listener to event keydown
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

  public renderResizeHandle() {
    const [resizeWidth, resizeHeight] = this.isResponsive();
    if (resizeWidth || resizeHeight) {
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
    const [resizeWidth, resizeHeight] = this.isResponsive();
    const chartStyle =
      resizeWidth || resizeHeight
        ? {
            width: resizeWidth ? this.state.width + 'px' : null,
            height: resizeHeight ? this.state.height + 'px' : null
          }
        : {};
    return (
      <div>
        <div className="chart" style={{backgroundColor: this.props.backgroundColor}}>
          <div ref="chart" style={chartStyle} />
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
