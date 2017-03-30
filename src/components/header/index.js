import { connect } from 'react-redux';
import Renderer from './renderer';
import * as EditorActions from '../../actions/editor';

const mapStateToProps = function (state, ownProps) {
  return {
    mode: state.app.mode
  };
};

const mapDispatchToProps = function (dispatch) {
  return {
    updateVegaSpec: (val) => {
      dispatch(EditorActions.updateVegaSpec(val));
    },

    updateVegaLiteSpec: (val) => {
      dispatch(EditorActions.updateVegaLiteSpec(val));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Renderer);
