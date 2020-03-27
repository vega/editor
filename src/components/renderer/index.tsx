import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';
import * as EditorActions from '../../actions/editor';
import {State} from '../../constants/default-state';
import Renderer from './renderer';

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
    vegaSpec: state.vegaSpec,
    view: state.view,
    backgroundColor: state.backgroundColor,
  };
}

export function mapDispatchToProps(dispatch: Dispatch<EditorActions.Action>) {
  return bindActionCreators(
    {
      setView: EditorActions.setView,
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(Renderer);
