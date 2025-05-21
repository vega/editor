import * as React from 'react';
import {Maximize} from 'react-feather';
import {Portal} from 'react-portal';
import {useNavigate, useLocation} from 'react-router';
import {connect} from 'react-redux';
import * as vega from 'vega';
import {Config as VgConfig} from 'vega';
import {deepEqual} from 'vega-lite';
import vegaTooltip from 'vega-tooltip';
import {mapDispatchToProps, mapStateToProps} from './index.js';
import {KEYCODES, Mode} from '../../constants/index.js';
import addProjections from '../../utils/addProjections.js';
import {dispatchingLogger} from '../../utils/logger.js';
import {Popup} from '../popup/index.js';
import './index.css';
import {expressionInterpreter as vegaInterpreter} from 'vega-interpreter';

// Add additional projections
addProjections(vega.projection);

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & {
    navigate: (path: string) => void;
    location: {pathname: string};
  };

const defaultState = {fullscreen: false, width: 500, height: 300};

type State = Readonly<typeof defaultState>;

class Editor extends React.PureComponent<Props, State> {
  public static pathname: string;
  private chartRef = React.createRef<HTMLDivElement>();
  private fullscreenChartRef = React.createRef<HTMLDivElement>();

  constructor(props) {
    super(props);
    this.state = defaultState;
    this.handleKeydown = this.handleKeydown.bind(this);
    this.onOpenPortal = this.onOpenPortal.bind(this);
    this.onClosePortal = this.onClosePortal.bind(this);
    this.runAfter = this.runAfter.bind(this);
  }

  public onOpenPortal() {
    const {pathname} = Editor;
    if (pathname !== '/' && pathname !== '/edited' && !pathname.endsWith('/view')) {
      this.props.navigate(pathname + '/view');
    }
  }

  public onClosePortal() {
    let pathname = Editor.pathname;
    pathname = pathname
      .split('/')
      .filter((e) => e !== 'view')
      .join('/');
    if (pathname !== '/' && pathname !== '/edited') {
      this.props.navigate(pathname);
    }
  }

  public handleKeydown(e) {
    // Close portal on pressing escape key
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
        },
      );
    };

    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  public initView() {
    const {
      vegaSpec,
      vegaLiteSpec,
      normalizedVegaLiteSpec,
      config,
      baseURL,
      mode,
      setView,
      setRuntime,
      hoverEnable,
      expressionInterpreter,
    } = this.props;

    const parseOptions = expressionInterpreter ? {ast: true} : {};

    // In vl mode, we compile Vega-Lite spec along with config to Vega spec
    const runtime = vega.parse(vegaSpec, mode === Mode.VegaLite ? {} : (config as VgConfig), parseOptions);

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
      // Remove run after callback for the previous view
      // to disable logging from an evaluate that will run after we finalize it
      (this.props.view as any)._postrun = [];

      this.props.view.finalize();
    }
    const hover = typeof hoverEnable === 'boolean' ? hoverEnable : mode === Mode.Vega;
    const view = new vega.View(runtime, {
      hover,
      loader,
      expr: expressionInterpreter ? vegaInterpreter : undefined,
    });

    view.runAfter(this.runAfter, true);
    view.logger(dispatchingLogger);

    const debug = (window as any).VEGA_DEBUG;
    debug.view = view;
    debug.vegaSpec = vegaSpec;
    debug.config = config;

    if (mode === Mode.VegaLite) {
      debug.vegaLiteSpec = vegaLiteSpec;
      debug.normalizedVegaLiteSpec = normalizedVegaLiteSpec;
    } else {
      debug.vegaLiteSpec = debug.normalizedVegaLiteSpec = undefined;
    }
    setRuntime(runtime);
    setView(view);
  }

  private runAfter(df: any) {
    const clock = df._clock;

    // Mapping from ID to value
    const values: Record<string, unknown> = {};
    const toProcessContexts = new Set<any>([df._runtime]);
    const processedContexts = new Set<any>();
    while (toProcessContexts.size > 0) {
      const context = toProcessContexts.values().next().value;
      toProcessContexts.delete(context);
      processedContexts.add(context);
      for (const [id, operator] of Object.entries(context.nodes as Record<string, any>)) {
        if (operator.stamp === clock) {
          values[id] = operator.value;
        }
      }
      for (const subContext of (context.subcontext as undefined | any[]) ?? []) {
        if (!processedContexts.has(subContext)) {
          toProcessContexts.add(subContext);
        }
      }
    }
    this.props.recordPulse(clock, values);

    // Set it up to run again
    df.runAfter(this.runAfter, true, 10);
  }

  public async renderVega() {
    // Selecting chart for rendering vega
    const chart = this.state.fullscreen ? this.fullscreenChartRef.current : this.chartRef.current;
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

    await view.runAsync();

    if (tooltipEnable) {
      vegaTooltip(view);
    }
  }

  public triggerResize() {
    window.dispatchEvent(new Event('resize'));
  }

  public componentDidMount() {
    document.addEventListener('keydown', this.handleKeydown);
    this.initView();
    this.renderVega();
  }

  public componentDidUpdate(prevProps) {
    if (
      !deepEqual(prevProps.vegaSpec, this.props.vegaSpec) ||
      !deepEqual(prevProps.config, this.props.config) ||
      prevProps.mode !== this.props.mode ||
      prevProps.renderer !== this.props.renderer ||
      prevProps.tooltipEnable !== this.props.tooltipEnable ||
      prevProps.hoverEnable !== this.props.hoverEnable ||
      prevProps.expressionInterpreter !== this.props.expressionInterpreter
    ) {
      this.initView();
      this.renderVega();
    }
  }

  public componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeydown);
    if (this.props.view) {
      this.props.view.finalize();
    }
  }

  public renderResizeHandle() {
    const {responsiveWidth, responsiveHeight} = this.isResponsive();
    if (!responsiveWidth && !responsiveHeight) {
      return null;
    }
    return (
      <div
        className="resize-handle"
        onMouseDown={this.handleResizeMouseDown.bind(this)}
        style={{
          cursor: responsiveWidth && responsiveHeight ? 'nwse-resize' : responsiveWidth ? 'ew-resize' : 'ns-resize',
        }}
      />
    );
  }

  public render() {
    const {fullscreen} = this.state;
    const {view, renderer} = this.props;

    if (!view) {
      return null;
    }

    return (
      <div className="chart-wrapper">
        <div
          ref={this.chartRef}
          className="chart"
          style={{
            width: this.state.width,
            height: this.state.height,
          }}
        />
        {this.renderResizeHandle()}
        {fullscreen && (
          <Portal>
            <Popup content={<div>Fullscreen View</div>} onClose={this.onClosePortal}>
              <div
                ref={this.fullscreenChartRef}
                className="chart"
                style={{
                  width: this.state.width * 2,
                  height: this.state.height * 2,
                }}
              >
                {this.renderResizeHandle()}
              </div>
            </Popup>
          </Portal>
        )}
        <button className="fullscreen-button" onClick={this.onOpenPortal}>
          <Maximize />
        </button>
      </div>
    );
  }
}

// Create a wrapper component to provide the navigation hook
const EditorWithNavigation = (props: Omit<Props, 'navigate' | 'location'>) => {
  const navigate = useNavigate();
  const location = useLocation();
  return <Editor {...props} navigate={navigate} location={location} />;
};

export default connect(mapStateToProps, mapDispatchToProps)(EditorWithNavigation);
