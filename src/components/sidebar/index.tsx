import * as React from 'react';
import {State} from '../../constants/default-state.js';
import {useAppContext} from '../../context/app-context.js';
import {effectiveRenderer, useWebGPU} from '../../utils/webgpu.js';
import Renderer from './renderer.js';

export default function Sidebar() {
  const {state, setState} = useAppContext();
  const webgpu = useWebGPU();
  const props = {
    hoverEnable: state.hoverEnable,
    logLevel: state.logLevel,
    renderer: effectiveRenderer(state.renderer, webgpu),
    webgpuAvailable: webgpu,
    tooltipEnable: state.tooltipEnable,
    backgroundColor: state.backgroundColor,
    expressionInterpreter: state.expressionInterpreter,
  };

  return (
    <Renderer
      {...props}
      setHover={(hover) => setState((s) => ({...s, hoverEnable: hover}))}
      setLogLevel={(level) => setState((s) => ({...s, logLevel: level}))}
      setRenderer={(renderer) => setState((s) => ({...s, renderer: renderer as State['renderer']}))}
      setSettingsState={(stateParam) => setState((s) => ({...s, settings: stateParam}))}
      setTooltip={(enabled) => setState((s) => ({...s, tooltipEnable: enabled}))}
      setBackgroundColor={(color) => setState((s) => ({...s, backgroundColor: color}))}
      setExpressionInterpreter={(enabled) => setState((s) => ({...s, expressionInterpreter: enabled}))}
    />
  );
}
