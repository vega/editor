import {connect} from 'react-redux';
import Renderer from './renderer';
import * as EditorActions from '../../../actions/editor';

const mapStateToProps = function(state, ownProps) {
  return {
    value: state.editorString,
    mode: state.mode,
    selectedExample: state.selectedExample,
    gist: state.gist,
    autoParse: state.autoParse,
    parse: state.parse
  };
};

const mapDispatchToProps = function(dispatch) {
  return {
    updateVegaSpec: (val) => {
      dispatch(EditorActions.updateVegaSpec(val));
    },

    updateVegaLiteSpec: (val) => {
      dispatch(EditorActions.updateVegaLiteSpec(val));
    },

    parseSpec: (val) => {
      dispatch(EditorActions.parseSpec(val));
    },

    updateEditorString: (val) => {
      dispatch(EditorActions.updateEditorString(val));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Renderer);
