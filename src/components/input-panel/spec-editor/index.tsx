import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';
import * as EditorActions from '../../../actions/editor';
import {State} from '../../../constants/default-state';
import Renderer from './renderer';

export function mapStateToProps(state: State) {
  return {
    compiledEditorRef: state.compiledEditorRef,
    compiledVegaPaneSize: state.compiledVegaPaneSize,
    compiledVegaSpec: state.compiledVegaSpec,
    configEditorString: state.configEditorString,
    decorations: state.decorations,
    editorFocus: state.editorFocus,
    editorRef: state.editorRef,
    editorString: state.editorString,
    gist: state.gist,
    manualParse: state.manualParse,
    mode: state.mode,
    parse: state.parse,
    selectedExample: state.selectedExample,
    sidePaneItem: state.sidePaneItem,
    themeName: state.themeName,
    value: state.editorString,
    view: state.view,
  };
}

export function mapDispatchToProps(dispatch: Dispatch<EditorActions.Action>) {
  return bindActionCreators(
    {
      clearConfig: EditorActions.clearConfig,
      extractConfigSpec: EditorActions.extractConfigSpec,
      logError: EditorActions.logError,
      mergeConfigSpec: EditorActions.mergeConfigSpec,
      parseSpec: EditorActions.parseSpec,
      setConfig: EditorActions.setConfig,
      setDecorations: EditorActions.setDecorations,
      setEditorFocus: EditorActions.setEditorFocus,
      setEditorReference: EditorActions.setEditorReference,
      updateEditorString: EditorActions.updateEditorString,
      updateVegaLiteSpec: EditorActions.updateVegaLiteSpec,
      updateVegaSpec: EditorActions.updateVegaSpec,
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(Renderer);
