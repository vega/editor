import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';
import * as EditorActions from '../../actions/editor.js';
import Renderer from './renderer.js';
import {State} from '../../constants/default-state.js';

export function mapStateToProps(state: State) {
  return {
    hoverEnable: state.hoverEnable,
    logLevel: state.logLevel,
    renderer: state.renderer,
    tooltipEnable: state.tooltipEnable,
    backgroundColor: state.backgroundColor,
    expressionInterpreter: state.expressionInterpreter,
  };
}

export function mapDispatchToProps(dispatch: Dispatch<EditorActions.Action>) {
  return bindActionCreators(
    {
      setHover: EditorActions.setHover,
      setLogLevel: EditorActions.setLogLevel,
      setRenderer: EditorActions.setRenderer,
      setSettingsState: EditorActions.setSettingsState,
      setTooltip: EditorActions.setTooltip,
      setBackgroundColor: EditorActions.setBackgroundColor,
      setExpressionInterpreter: EditorActions.setExpressionInterpreter,
    },
    dispatch,
  );
}
export default connect(mapStateToProps, mapDispatchToProps)(Renderer);
