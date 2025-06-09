import * as React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';
import * as EditorActions from '../../actions/editor.js';
import {State} from '../../constants/default-state.js';
import Renderer from './renderer.js';
import {withRouter} from 'react-router-dom';

export function mapStateToProps(state: State) {
  return {
    configEditorString: state.configEditorString,
    editorRef: state.editorRef,
    isAuthenticated: state.isAuthenticated,
    lastPosition: state.lastPosition,
    manualParse: state.manualParse,
    mode: state.mode,
    name: state.name,
    profilePicUrl: state.profilePicUrl,
    settings: state.settings,
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
      receiveCurrentUser: EditorActions.receiveCurrentUser,
      setConfig: EditorActions.setConfig,
      setConfigEditorString: EditorActions.setConfigEditorString,
      setScrollPosition: EditorActions.setScrollPosition,
      setSettingsState: EditorActions.setSettingsState,
      setThemeName: EditorActions.setThemeName,
      toggleAutoParse: EditorActions.toggleAutoParse,
      updateVegaSpec: EditorActions.updateVegaSpec,
    },
    dispatch,
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Renderer)) as React.ComponentType<{
  showExample: boolean;
}>;
