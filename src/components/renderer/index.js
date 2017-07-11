import {connect} from 'react-redux';
import Renderer from './renderer';
import * as EditorActions from '../../actions/editor';

function mapStateToProps(state, ownProps) {
  return {
    vegaSpec: state.vegaSpec,
    renderer: state.renderer,
    mode: state.mode,
    errorPane: state.errorPane,
    warningsLogger: state.warningsLogger,
    error: state.error,
    tooltip: state.tooltip
  };
}

const mapDispatchToProps = function(dispatch) {
  return {
    logError: (err) => {
      dispatch(EditorActions.logError(err));
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Renderer);
