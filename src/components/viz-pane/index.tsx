import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';
import * as EditorActions from '../../actions/editor';
import {State} from '../../constants/default-state';
import Renderer from './renderer';

export function mapStateToProps(state: State) {
  return {
    compiledEditorRef: state.compiledEditorRef,
    debugPane: state.debugPane,
    debugPaneSize: state.debugPaneSize,
    decorations: state.decorations,
    editorFocus: state.editorFocus,
    editorRef: state.editorRef,
    error: state.error,
    errors: state.errors,
    logs: state.logs,
    navItem: state.navItem,
    settings: state.settings,
    view: state.view,
  };
}

export function mapDispatchToProps(dispatch: Dispatch<EditorActions.Action>) {
  return bindActionCreators(
    {
      setDebugPaneSize: EditorActions.setDebugPaneSize,
      setDecorations: EditorActions.setDecorations,
      showLogs: EditorActions.showLogs,
      toggleDebugPane: EditorActions.toggleDebugPane,
      toggleNavbar: EditorActions.toggleNavbar,
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(Renderer);
