import { connect } from 'react-redux';

import * as EditorActions from '../../../actions/editor';
import { State } from '../../../constants/default-state';
import Renderer from './renderer';

const mapStateToProps = (state: State, ownProps) => {
  return {
    format: state.format,
    gist: state.gist,
    manualParse: state.manualParse,
    mode: state.mode,
    parse: state.parse,
    selectedExample: state.selectedExample,
    value: state.editorString,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    formatSpec: val => {
      dispatch(EditorActions.formatSpec(val));
    },
    logError: err => {
      dispatch(EditorActions.logError(err));
    },
    parseSpec: val => {
      dispatch(EditorActions.parseSpec(val));
    },
    updateEditorString: val => {
      dispatch(EditorActions.updateEditorString(val));
    },
    updateVegaLiteSpec: val => {
      dispatch(EditorActions.updateVegaLiteSpec(val));
    },
    updateVegaSpec: val => {
      dispatch(EditorActions.updateVegaSpec(val));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Renderer);
