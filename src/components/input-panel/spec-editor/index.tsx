import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import * as EditorActions from '../../../actions/editor';
import { State } from '../../../constants/default-state';
import Renderer from './renderer';

export function mapStateToProps(state: State, ownProps) {
  return {
    format: state.format,
    gist: state.gist,
    manualParse: state.manualParse,
    mode: state.mode,
    parse: state.parse,
    selectedExample: state.selectedExample,
    value: state.editorString,
  };
}

export function mapDispatchToProps(dispatch: Dispatch<EditorActions.Action>) {
  return bindActionCreators(
    {
      formatSpec: EditorActions.formatSpec,
      logError: EditorActions.logError,
      parseSpec: EditorActions.parseSpec,
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
