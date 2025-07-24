import * as React from 'react';
import {Maximize} from 'react-feather';
import {Portal} from 'react-portal';
import * as vega from 'vega';
import vegaTooltip from 'vega-tooltip';
import {deepEqual} from 'vega-lite';
import {KEYCODES, Mode} from '../../constants/index.js';
import addProjections from '../../utils/addProjections.js';
import {dispatchingLogger} from '../../utils/logger';
import {Popup} from '../popup/index.js';
import './index.css';
import {expressionInterpreter as vegaInterpreter} from 'vega-interpreter';
import {useCallback, useEffect, useRef, useState} from 'react';
import {useNavigate, useLocation} from 'react-router';

// Add additional projections
addProjections(vega.projection);

export interface RendererProps {
  baseURL: string;
  config: any;
  editorString: string;
  hoverEnable: boolean | 'auto';
  logLevel: number;
  mode: Mode;
  renderer: string;
  tooltipEnable: boolean;
  vegaLiteSpec: any;
  normalizedVegaLiteSpec: any;
  vegaSpec: any;
  view: any;
  backgroundColor: string;
  expressionInterpreter: boolean;
  setView: (view: any) => void;
  setRuntime: (runtime: any) => void;
  recordPulse: (clock: number, values: any) => void;
}

export default function Renderer(props: RendererProps) {
  const {
    vegaSpec,
    config,
    baseURL,
    mode,
    setView,
    setRuntime,
    hoverEnable,
    expressionInterpreter,
    view,
    renderer,
    tooltipEnable,
    backgroundColor,
    recordPulse,
    vegaLiteSpec,
    normalizedVegaLiteSpec,
  } = props;

  const defaultSize = {width: 500, height: 300, fullscreen: false};
  const [size, setSize] = useState(defaultSize);

  const chartRef = useRef<HTMLDivElement>(null);
  const portalChartRef = useRef<HTMLDivElement>(null);

  const prevPropsRef = useRef({
    vegaSpec: null,
    vegaLiteSpec: null,
    baseURL: null,
    config: null,
    logLevel: null,
    mode: null,
    hoverEnable: null,
    tooltipEnable: null,
    expressionInterpreter: null,
  });

  const isResponsive = useCallback(() => {
    if (!vegaSpec.signals) {
      return {responsiveWidth: false, responsiveHeight: false};
    }
    const widthSignal = vegaSpec.signals.find((s: any) => s.name === 'width');
    const heightSignal = vegaSpec.signals.find((s: any) => s.name === 'height');
    return {
      responsiveWidth:
        widthSignal && typeof widthSignal.init === 'string' && widthSignal.init.includes('containerSize'),
      responsiveHeight:
        heightSignal && typeof heightSignal.init === 'string' && heightSignal.init.includes('containerSize'),
    };
  }, [vegaSpec]);

  const {responsiveWidth, responsiveHeight} = isResponsive();
  const chartStyle =
    responsiveWidth || responsiveHeight
      ? {
          width: responsiveWidth ? size.width + 'px' : undefined,
          height: responsiveHeight ? size.height + 'px' : undefined,
        }
      : {};

  const handleResizeMouseDown = (eDown: React.MouseEvent) => {
    const x0 = eDown.pageX;
    const y0 = eDown.pageY;
    const {width: w0, height: h0} = size;
    const onMove = (e: MouseEvent) => {
      const factor = size.fullscreen ? 2 : 1;
      const dx = e.pageX - x0;
      const dy = e.pageY - y0;
      setSize((s) => ({
        ...s,
        width: responsiveWidth ? Math.max(10, w0 + dx * factor) : s.width,
        height: responsiveHeight ? Math.max(10, h0 + dy * factor) : s.height,
      }));
      window.dispatchEvent(new Event('resize'));
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const navigate = useNavigate();
  const location = useLocation();

  const openPortal = useCallback(() => {
    const pathname = location.pathname;
    if (pathname !== '/' && pathname !== '/edited' && !pathname.endsWith('/view')) {
      navigate(pathname + '/view', {replace: false});
    }
  }, [location.pathname, navigate]);

  const closePortal = useCallback(() => {
    const pathname = location.pathname
      .split('/')
      .filter((e) => e !== 'view')
      .join('/');
    if (pathname !== '/' && pathname !== '/edited') {
      navigate(pathname, {replace: false});
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.keyCode === KEYCODES.ESCAPE && size.fullscreen) {
        setSize((s) => ({...s, fullscreen: false}));
        closePortal();
      }
      if (e.keyCode === 122 && (e.ctrlKey || e.metaKey)) {
        if (size.fullscreen) {
          setSize((s) => ({...s, fullscreen: false}));
          closePortal();
        } else {
          setSize((s) => ({...s, fullscreen: true}));
          openPortal();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [size.fullscreen, openPortal, closePortal]);

  useEffect(() => {
    const params = location.pathname.split('/');
    if (params[params.length - 1] === 'view') {
      setSize((s) => ({...s, fullscreen: true}));
    } else {
      setSize((s) => ({...s, fullscreen: false}));
    }
  }, [location.pathname]);

  const runAfter = useCallback(
    (df: any) => {
      const clock = df._clock;
      const values: Record<string, unknown> = {};
      const toProcess = new Set([df._runtime]);
      const processed = new Set();
      while (toProcess.size) {
        const ctx = toProcess.values().next().value;
        if (!ctx || !ctx.nodes) continue;
        toProcess.delete(ctx);
        processed.add(ctx);
        Object.entries(ctx.nodes).forEach(([id, op]) => {
          if ((op as any).stamp === clock) values[id] = (op as any).value;
        });
        ctx.subcontext?.forEach((sub: any) => {
          if (!processed.has(sub)) toProcess.add(sub);
        });
      }
      recordPulse(clock, values);
      df.runAfter(runAfter, true, 10);
    },
    [recordPulse],
  );

  const initView = useCallback(async () => {
    const parseOptions = expressionInterpreter ? {ast: true} : {};
    const runtime = vega.parse(vegaSpec, mode === Mode.VegaLite ? {} : config, parseOptions);
    const loader = vega.loader();
    const origLoad = loader.load.bind(loader);
    loader.load = async (url, options) => {
      try {
        return options ? await origLoad(url, {...options, baseURL}) : await origLoad(url, {baseURL});
      } catch {
        return origLoad(url, options);
      }
    };
    if (view) {
      (view as any)._postrun = [];
      view.finalize();
    }
    const hover = typeof hoverEnable === 'boolean' ? hoverEnable : mode === Mode.Vega;
    const newView = new vega.View(runtime, {
      hover,
      loader,
      expr: expressionInterpreter ? vegaInterpreter : undefined,
    });
    newView.runAfter(runAfter, true);
    newView.logger(dispatchingLogger);
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

    await newView.runAsync();
    setRuntime(runtime);
    setView(newView);
  }, [
    vegaSpec,
    config,
    mode,
    expressionInterpreter,
    hoverEnable,
    baseURL,
    runAfter,
    setRuntime,
    setView,
    view,
    vegaLiteSpec,
    normalizedVegaLiteSpec,
  ]);

  const renderVega = useCallback(async () => {
    const chart = size.fullscreen ? portalChartRef.current : chartRef.current;
    if (!responsiveWidth && !responsiveHeight) {
      chart.style.width = chart.getBoundingClientRect().width + 'px';
      chart.style.width = 'auto';
    }
    if (!view) return;
    view.renderer(renderer).initialize(chart);
    await view.runAsync();
    if (tooltipEnable) vegaTooltip(view);
  }, [size.fullscreen, responsiveWidth, responsiveHeight, portalChartRef, chartRef, view, renderer, tooltipEnable]);

  useEffect(() => {
    const prevProps = prevPropsRef.current;
    const currentProps = {
      vegaSpec,
      vegaLiteSpec,
      baseURL,
      config,
      logLevel: props.logLevel,
      mode,
      hoverEnable,
      tooltipEnable,
      expressionInterpreter,
    };
    const hasChanged =
      !deepEqual(prevProps.vegaSpec, currentProps.vegaSpec) ||
      !deepEqual(prevProps.vegaLiteSpec, currentProps.vegaLiteSpec) ||
      prevProps.baseURL !== currentProps.baseURL ||
      !deepEqual(prevProps.config, currentProps.config) ||
      !deepEqual(prevProps.logLevel, currentProps.logLevel) ||
      !deepEqual(prevProps.mode, currentProps.mode) ||
      !deepEqual(prevProps.hoverEnable, currentProps.hoverEnable) ||
      !deepEqual(prevProps.tooltipEnable, currentProps.tooltipEnable) ||
      prevProps.expressionInterpreter !== currentProps.expressionInterpreter;
    if (hasChanged) {
      initView();
    }
    prevPropsRef.current = currentProps;
  }, [
    vegaSpec,
    vegaLiteSpec,
    baseURL,
    config,
    props.logLevel,
    mode,
    hoverEnable,
    tooltipEnable,
    expressionInterpreter,
    initView,
  ]);

  useEffect(() => {
    if (view) {
      renderVega();
    }
  }, [view, renderer, tooltipEnable, size.fullscreen, renderVega]);

  return (
    <>
      <div className="chart" style={{backgroundColor}}>
        <Popup content={`Click on "Continue Recording" to make the chart interactive`} placement="right" maxWidth={200}>
          <div className="chart-overlay" />
        </Popup>
        <div aria-label="visualization" ref={chartRef} style={chartStyle} />
        {(responsiveWidth || responsiveHeight) && (
          <div className="chart-resize-handle" onMouseDown={handleResizeMouseDown}>
            <svg width="10" height="10">
              <path d="M-2,13L13,-2 M-2,16L16,-2 M-2,19L19,-2" />
            </svg>
          </div>
        )}
      </div>
      <div className="fullscreen-open">
        <Popup content="Fullscreen" placement="left">
          <Maximize
            onClick={() => {
              setSize((s) => ({...s, fullscreen: true}));
              openPortal();
            }}
          />
        </Popup>
      </div>
      {size.fullscreen && (
        <Portal>
          <div className="fullscreen-chart">
            <div className="chart" style={{backgroundColor}}>
              <div ref={portalChartRef} style={chartStyle} />
              {(responsiveWidth || responsiveHeight) && (
                <div className="chart-resize-handle" onMouseDown={handleResizeMouseDown}>
                  <svg width="10" height="10">
                    <path d="M-2,13L13,-2 M-2,16L16,-2 M-2,19L19,-2" />
                  </svg>
                </div>
              )}
            </div>
            <button
              className="fullscreen-close"
              onClick={() => {
                setSize((s) => ({...s, fullscreen: false}));
                closePortal();
              }}
            >
              <span>Edit Visualization</span>
            </button>
          </div>
        </Portal>
      )}
    </>
  );
}
