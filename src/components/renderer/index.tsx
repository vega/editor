import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';
import * as EditorActions from '../../actions/editor.js';
import {State} from '../../constants/default-state.js';
import {recordPulse} from '../../features/dataflow/pulsesSlice.js';
import {setRuntime} from '../../features/dataflow/runtimeSlice.js';
import Renderer from './renderer.js';

export function mapStateToProps(state: State) {
  return {
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
}

export function mapDispatchToProps(dispatch: Dispatch<EditorActions.Action>) {
  return bindActionCreators(
    {
      setView: EditorActions.setView,
      setRuntime: setRuntime,
      recordPulse: recordPulse,
    },
    dispatch,
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(Renderer);
