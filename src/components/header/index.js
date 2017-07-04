import {connect} from 'react-redux';
import Renderer from './renderer';
import * as EditorActions from '../../actions/editor';

const mapStateToProps = function(state, ownProps) {
  return {
    mode: state.mode
  };
};

const mapDispatchToProps = function(dispatch) {
  return {
    setGistVegaSpec: (gist, spec) => {
      dispatch(EditorActions.setGistVegaSpec(gist, spec));
    },

    setGistVegaLiteSpec: (gist, spec) => {
      dispatch(EditorActions.setGistVegaLiteSpec(gist, spec));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Renderer);
