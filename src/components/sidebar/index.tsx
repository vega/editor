import * as React from 'react';
import {Renderers} from 'vega';
import {useAppContext} from '../../context/app-context.js';
import Renderer from './renderer.js';

export default function Sidebar() {
  const {state, setState} = useAppContext();
  const props = {
    hoverEnable: state.hoverEnable,
    logLevel: state.logLevel,
    renderer: state.renderer,
    tooltipEnable: state.tooltipEnable,
    backgroundColor: state.backgroundColor,
    expressionInterpreter: state.expressionInterpreter,
  };

  return (
    <Renderer
      {...props}
      setHover={(hover) => setState((s) => ({...s, hoverEnable: hover}))}
      setLogLevel={(level) => setState((s) => ({...s, logLevel: level}))}
      setRenderer={(renderer) => setState((s) => ({...s, renderer: renderer as Renderers}))}
      setSettingsState={(stateParam) => setState((s) => ({...s, settings: stateParam}))}
      setTooltip={(enabled) => setState((s) => ({...s, tooltipEnable: enabled}))}
      setBackgroundColor={(color) => setState((s) => ({...s, backgroundColor: color}))}
      setExpressionInterpreter={(enabled) => setState((s) => ({...s, expressionInterpreter: enabled}))}
    />
  );
}
