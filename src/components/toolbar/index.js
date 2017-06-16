import { connect } from 'react-redux';
import Renderer from './renderer';
import * as EditorActions from '../../actions/editor';

function mapStateToProps (state, ownProps) {
  return {
    renderer: state.app.renderer,
    error: state.app.error,
    mode: state.app.mode,
    autoParse: state.app.autoParse
  };
}


const mapDispatchToProps = function (dispatch) {
  return {
    toggleAutoParse: () => {
      dispatch(EditorActions.toggleAutoParse());
    },

    cycleRenderer: () => {
      dispatch(EditorActions.cycleRenderer());
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Renderer);
