import { connect } from 'react-redux';
import Renderer from './renderer';
import * as EditorActions from '../../../actions/editor';

const mapStateToProps = function (state, ownProps) {
  return {
    value: state.app.editorString
  };
};

const mapDispatchToProps = function (dispatch) {
  return {
    onChange: (val) => {
      dispatch(EditorActions.updateVegaSpec(val));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Renderer);
