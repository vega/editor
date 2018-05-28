import { connect } from 'react-redux';

import * as EditorActions from '../../../actions/editor';
import { State } from '../../../constants/default-state';
import Renderer from './renderer';

const mapStateToProps = (state: State, ownProps) => {
  return {
    autoParse: state.autoParse,
    gist: state.gist,
    mode: state.mode,
    parse: state.parse,
    selectedExample: state.selectedExample,
    value: state.editorString,
  };
};

const mapDispatchToProps = dispatch => {
  return {
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
