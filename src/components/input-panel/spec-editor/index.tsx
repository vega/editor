import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';
import * as EditorActions from '../../../actions/editor';
import {State} from '../../../constants/default-state';
import Renderer from './renderer';

export function mapStateToProps(state: State) {
  return {
    compiledVegaPaneSize: state.compiledVegaPaneSize,
    compiledVegaSpec: state.compiledVegaSpec,
    configEditorString: state.configEditorString,
    editorString: state.editorString,
    gist: state.gist,
    manualParse: state.manualParse,
    mode: state.mode,
    parse: state.parse,
    selectedExample: state.selectedExample,
    sidePaneItem: state.sidePaneItem,
    themeName: state.themeName,
    value: state.editorString
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
      setEditorReference: EditorActions.setEditorReference,
      updateEditorString: EditorActions.updateEditorString,
      updateVegaLiteSpec: EditorActions.updateVegaLiteSpec,
      updateVegaSpec: EditorActions.updateVegaSpec
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Renderer);
