import {connect} from 'react-redux';
import Renderer from './renderer';
import * as EditorActions from '../../../actions/editor';
import {MODES} from '../../../constants';

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
    },

    updateVegaSpecInVegaLite: (spec) => {
      dispatch(EditorActions.changeMode(MODES.Vega));
      dispatch(EditorActions.updateVegaSpec(spec));
    },

    updateVegaLiteSpecInVega: (spec) => {
      dispatch(EditorActions.changeMode(MODES.VegaLite));
      dispatch(EditorActions.updateVegaLiteSpec(spec));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Renderer);
