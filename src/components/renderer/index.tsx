import * as React from 'react';
import {useAppContext} from '../../context/app-context';
import {useDataflowActions} from '../../features/dataflow/DataflowContext';
import Renderer from './renderer';

const RendererContainer: React.FC = () => {
  const {state, setState} = useAppContext();
  const {setRuntime, recordPulse} = useDataflowActions();

  const props = {
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
  };

  return (
    <Renderer
      {...props}
      setView={(newView) => setState((s) => ({...s, view: newView}))}
      setRuntime={(runtime) => {
        setState((s) => ({...s, runtime}));
        setRuntime(runtime);
      }}
      recordPulse={recordPulse}
    />
  );
};

export default RendererContainer;
