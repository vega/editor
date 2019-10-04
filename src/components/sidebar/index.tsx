import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';
import * as EditorActions from '../../actions/editor';
import Renderer from './renderer';

export function mapStateToProps(state) {
  return {
    hoverEnable: state.hoverEnable,
    logLevel: state.logLevel,
    renderer: state.renderer,
    tooltipEnable: state.tooltipEnable,
    backgroundColor: state.backgroundColor
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
      setBackgroundColor: EditorActions.setBackgroundColor
    },
    dispatch
  );
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Renderer);
