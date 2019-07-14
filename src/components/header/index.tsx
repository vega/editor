import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import * as EditorActions from '../../actions/editor';
import { State } from '../../constants/default-state';
import Renderer from './renderer';

export function mapStateToProps(state: State, ownProps) {
  return {
    configEditorString: state.configEditorString,
    editorRef: state.editorRef,
    isAuthenticated: state.isAuthenticated,
    lastPosition: state.lastPosition,
    manualParse: state.manualParse,
    mode: state.mode,
    settings: state.settings,
    name: state.name,
    profilePicUrl: state.profilePicUrl,
    vegaLiteSpec: state.vegaLiteSpec,
    vegaSpec: state.vegaSpec,
    view: state.view,
  };
}

export function mapDispatchToProps(dispatch: Dispatch<EditorActions.Action>) {
  return bindActionCreators(
    {
      clearConfig: EditorActions.clearConfig,
      exportVega: EditorActions.exportVega,
      parseSpec: EditorActions.parseSpec,
      setConfigEditorString: EditorActions.setConfigEditorString,
      receiveCurrentUser: EditorActions.receiveCurrentUser,
      setConfig: EditorActions.setConfig,
      setScrollPosition: EditorActions.setScrollPosition,
      setSettingsState: EditorActions.setSettingsState,
      setThemeName: EditorActions.setThemeName,
      toggleAutoParse: EditorActions.toggleAutoParse,
      updateVegaSpec: EditorActions.updateVegaSpec,
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Renderer);
