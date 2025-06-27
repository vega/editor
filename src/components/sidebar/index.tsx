import * as React from 'react';
import {Renderers} from 'vega';
import {useAppDispatch, useAppSelector} from '../../hooks.js';
import * as EditorActions from '../../actions/editor.js';
import Renderer from './renderer.js';

export default function Sidebar() {
  const dispatch = useAppDispatch();
  const props = useAppSelector((state) => ({
    hoverEnable: state.hoverEnable,
    logLevel: state.logLevel,
    renderer: state.renderer,
    tooltipEnable: state.tooltipEnable,
    backgroundColor: state.backgroundColor,
    expressionInterpreter: state.expressionInterpreter,
  }));

  return (
    <Renderer
      {...props}
      setHover={(hover) => dispatch(EditorActions.setHover(hover))}
      setLogLevel={(level) => dispatch(EditorActions.setLogLevel(level))}
      setRenderer={(renderer) => dispatch(EditorActions.setRenderer(renderer as Renderers))}
      setSettingsState={(stateParam) => dispatch(EditorActions.setSettingsState(stateParam))}
      setTooltip={(enabled) => dispatch(EditorActions.setTooltip(enabled))}
      setBackgroundColor={(color) => dispatch(EditorActions.setBackgroundColor(color))}
      setExpressionInterpreter={(enabled) => dispatch(EditorActions.setExpressionInterpreter(enabled))}
    />
  );
}
