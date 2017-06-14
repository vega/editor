import { connect } from 'react-redux';
import Renderer from './renderer';
import * as EditorActions from '../../actions/editor';

function mapStateToProps (state, ownProps) {
  return {
    renderer: state.app.renderer,
    error: state.app.error,
    mode: state.app.mode
  };
}


const mapDispatchToProps = function (dispatch) {
  return {
    cycleRenderer: () => {
      dispatch(EditorActions.cycleRenderer());
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Renderer);
