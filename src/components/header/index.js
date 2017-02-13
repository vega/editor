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
    updateVegaSpec: (example, val) => {
      dispatch(EditorActions.setVegaExample(example, val));
    },
    updateVegaLiteSpec: (example, val) => {
      dispatch(EditorActions.setVegaLiteExample(example, val));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Renderer);
