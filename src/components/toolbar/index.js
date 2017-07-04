import { connect } from 'react-redux';
import Renderer from './renderer';
import * as EditorActions from '../../actions/editor';

function mapStateToProps(state, ownProps) {
  return {
    renderer: state.renderer,
    error: state.error,
    mode: state.mode,
    autoParse: state.autoParse,
    warningsLogger: state.warningsLogger
  };
}


const mapDispatchToProps = function(dispatch) {
  return {
    toggleAutoParse: () => {
      dispatch(EditorActions.toggleAutoParse());
    },

    cycleRenderer: () => {
      dispatch(EditorActions.cycleRenderer());
    },

    showErrorPane: () => {
      dispatch(EditorActions.showErrorPane());
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Renderer);
