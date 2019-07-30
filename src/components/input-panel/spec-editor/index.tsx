import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import * as EditorActions from '../../../actions/editor';
import { State } from '../../../constants/default-state';
import Renderer from './renderer';

export function mapStateToProps(state: State, ownProps) {
  return {
    configEditorString: state.configEditorString,
    gist: state.gist,
    manualParse: state.manualParse,
    mode: state.mode,
    parse: state.parse,
    selectedExample: state.selectedExample,
    sidepaneItem: state.sidePaneItem,
    value: state.editorString,
  };
}

export function mapDispatchToProps(dispatch: Dispatch<EditorActions.Action>) {
  return bindActionCreators(
    {
      logError: EditorActions.logError,
      parseSpec: EditorActions.parseSpec,
      setConfig: EditorActions.setConfig,
      setEditorReference: EditorActions.setEditorReference,
      updateEditorString: EditorActions.updateEditorString,
      updateVegaLiteSpec: EditorActions.updateVegaLiteSpec,
      updateVegaSpec: EditorActions.updateVegaSpec,
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Renderer);
