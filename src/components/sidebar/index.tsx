import * as React from 'react';
import {useAppDispatch, useAppSelector} from '../../hooks.js';
import * as EditorActions from '../../actions/editor.js';
import Renderer from './renderer.js';

export default function Sidebar() {
  const dispatch = useAppDispatch();
  const stateProps = useAppSelector((state) => ({
    hoverEnable: state.hoverEnable,
    logLevel: state.logLevel,
    renderer: state.renderer,
    tooltipEnable: state.tooltipEnable,
    backgroundColor: state.backgroundColor,
    expressionInterpreter: state.expressionInterpreter,
  }));

  const actions = {
    setHover: (hover) => dispatch(EditorActions.setHover(hover)),
    setLogLevel: (level) => dispatch(EditorActions.setLogLevel(level)),
    setRenderer: (renderer) => dispatch(EditorActions.setRenderer(renderer)),
    setSettingsState: (stateParam) => dispatch(EditorActions.setSettingsState(stateParam)),
    setTooltip: (enabled) => dispatch(EditorActions.setTooltip(enabled)),
    setBackgroundColor: (color) => dispatch(EditorActions.setBackgroundColor(color)),
    setExpressionInterpreter: (enabled) => dispatch(EditorActions.setExpressionInterpreter(enabled)),
  };

  return <Renderer {...stateProps} {...actions} />;
}
