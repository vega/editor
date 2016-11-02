import { connect } from 'react-redux';
import Renderer from './renderer';
import * as EditorActions from '../../actions/editor';

function mapStateToProps (state, ownProps) {
  return {
    debug: state.app.debug,
    renderer: state.app.renderer
  };
}


const mapDispatchToProps = function (dispatch) {
  return {
    toggleDebug: () => {
      dispatch(EditorActions.toggleDebug());
    },

    cycleRenderer: () => {
      dispatch(EditorActions.cycleRenderer());
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Renderer);
