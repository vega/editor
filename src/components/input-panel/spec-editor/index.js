import { connect } from 'react-redux';
import Renderer from './renderer';
import * as EditorActions from '../../../actions/editor';

const mapStateToProps = function (state, ownProps) {
  return {
    value: state.app.editorString,
    mode: state.app.mode,
    selectedExample: state.app.selectedExample,
    gist: state.app.gist,
    compiledVegaSpec: state.app.compiledVegaSpec,
    autoParse: state.app.autoParse,
    parse: state.app.parse
  };
};

const mapDispatchToProps = function (dispatch) {
  return {
    updateVegaSpec: (val) => {
      dispatch(EditorActions.updateVegaSpec(val));
    },

    updateVegaLiteSpec: (val) => {
      dispatch(EditorActions.updateVegaLiteSpec(val));
    },

    parseSpec: (val) => {
      dispatch(EditorActions.parseSpec(val));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Renderer);
