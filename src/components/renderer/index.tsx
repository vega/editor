import * as React from 'react';
import * as EditorActions from '../../actions/editor.js';
import {useAppSelector, useAppDispatch} from '../../hooks.js';
import {recordPulse} from '../../features/dataflow/pulsesSlice.js';
import {setRuntime} from '../../features/dataflow/runtimeSlice.js';
import Renderer from './renderer.js';

const RendererContainer: React.FC = () => {
  const dispatch = useAppDispatch();

  const props = useAppSelector((state) => ({
    baseURL: state.baseURL,
    config: state.config,
    editorString: state.editorString,
    hoverEnable: state.hoverEnable,
    logLevel: state.logLevel,
    mode: state.mode,
    renderer: state.renderer,
    tooltipEnable: state.tooltipEnable,
    vegaLiteSpec: state.vegaLiteSpec,
    normalizedVegaLiteSpec: state.normalizedVegaLiteSpec,
    vegaSpec: state.vegaSpec,
    view: state.view,
    backgroundColor: state.backgroundColor,
    expressionInterpreter: state.expressionInterpreter,
  }));

  return (
    <Renderer
      {...props}
      setView={(newView) => dispatch(EditorActions.setView(newView))}
      setRuntime={(runtime) => dispatch(setRuntime(runtime))}
      recordPulse={(clock, values) => dispatch(recordPulse({clock, values}))}
    />
  );
};

export default RendererContainer;
