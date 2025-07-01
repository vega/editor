import * as React from 'react';
import {Maximize} from 'react-feather';
import {Portal} from 'react-portal';
import * as vega from 'vega';
import vegaTooltip from 'vega-tooltip';
import {KEYCODES, Mode} from '../../constants/index.js';
import addProjections from '../../utils/addProjections.js';
import {dispatchingLogger} from '../../utils/logger';
import {Popup} from '../popup/index.js';
import './index.css';
import {expressionInterpreter as vegaInterpreter} from 'vega-interpreter';
import {useCallback, useEffect, useRef, useState} from 'react';

// Add additional projections
addProjections(vega.projection);

const defaultSize = {fullscreen: false, width: 500, height: 300};

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
  } = props;

  const [size, setSize] = useState(defaultSize);
  const chartRef = useRef(null);
  const portalChartRef = useRef(null);

  const isResponsive = useCallback(() => {
    if (!vegaSpec.signals) {
      return {responsiveWidth: false, responsiveHeight: false};
    }
    const widthSignal = vegaSpec.signals.find((s) => s.name === 'width');
    const heightSignal = vegaSpec.signals.find((s) => s.name === 'height');
    return {
      responsiveWidth:
        widthSignal && typeof widthSignal.init === 'string' && widthSignal.init.includes('containerSize'),
      responsiveHeight:
        heightSignal && typeof heightSignal.init === 'string' && heightSignal.init.includes('containerSize'),
    };
  }, [vegaSpec]);

  const triggerResize = () => {
    window.dispatchEvent(new Event('resize'));
  };

  const runAfter = useCallback(
    (df) => {
      const clock = df._clock;
      const values = {};
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
        ctx.subcontext?.forEach((sub) => {
          if (!processed.has(sub)) toProcess.add(sub);
        });
      }
      recordPulse(clock, values);
      df.runAfter(runAfter, true, 10);
    },
    [recordPulse],
  );

  const initView = useCallback(() => {
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
    const newView = new vega.View(runtime, {hover, loader, expr: expressionInterpreter ? vegaInterpreter : undefined});
    newView.runAfter(runAfter, true);
    // newView.logger(dispatchingLogger); // TODO: Fix logger interface
    setRuntime(runtime);
    setView(newView);
  }, [vegaSpec, config, mode, expressionInterpreter, hoverEnable, baseURL, runAfter, setRuntime, setView, view]);

  const renderVega = useCallback(async () => {
    const chart = size.fullscreen ? portalChartRef.current : chartRef.current;
    const {responsiveWidth, responsiveHeight} = isResponsive();
    if (!responsiveWidth && !responsiveHeight) {
      chart.style.width = chart.getBoundingClientRect().width + 'px';
      chart.style.width = 'auto';
    }

    if (!view) return;
    view.renderer(renderer).initialize(chart);
    await view.runAsync();
    if (tooltipEnable) vegaTooltip(view);
  }, [size.fullscreen, isResponsive, portalChartRef, chartRef, view, renderer, tooltipEnable]);

  useEffect(() => {
    initView();
  }, [vegaSpec, config, mode, expressionInterpreter, hoverEnable, baseURL]);

  useEffect(() => {
    if (view) {
      renderVega();
    }
  }, [view, renderer, tooltipEnable, size.fullscreen]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.keyCode === KEYCODES.ESCAPE && size.fullscreen) {
        setSize((s) => ({...s, fullscreen: false}));
      }
      if (e.keyCode === 122 && (e.ctrlKey || e.metaKey)) {
        setSize((s) => ({...s, fullscreen: !s.fullscreen}));
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [size.fullscreen]);

  const handleResizeMouseDown = (eDown) => {
    const {responsiveWidth, responsiveHeight} = isResponsive();
    const x0 = eDown.pageX,
      y0 = eDown.pageY;
    const {width: w0, height: h0, fullscreen} = size;
    const onMove = (e) => {
      const factor = fullscreen ? 2 : 1;
      const dx = e.pageX - x0;
      const dy = e.pageY - y0;
      setSize((s) => ({
        ...s,
        width: responsiveWidth ? Math.max(10, w0 + dx * factor) : s.width,
        height: responsiveHeight ? Math.max(10, h0 + dy * factor) : s.height,
      }));
      triggerResize();
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const {responsiveWidth, responsiveHeight} = isResponsive();
  const chartStyle =
    responsiveWidth || responsiveHeight
      ? {
          width: responsiveWidth ? size.width + 'px' : undefined,
          height: responsiveHeight ? size.height + 'px' : undefined,
        }
      : {};

  const openPortal = () => {
    setSize((s) => ({...s, fullscreen: true}));
  };

  const closePortal = () => {
    setSize((s) => ({...s, fullscreen: false}));
  };

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
          <Maximize onClick={openPortal} />
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
            <button className="fullscreen-close" onClick={closePortal}>
              <span>Edit Visualization</span>
            </button>
          </div>
        </Portal>
      )}
    </>
  );
}
