import { connect } from 'react-redux';
import Renderer from './renderer';
import * as EditorActions from '../../actions/editor';

function mapStateToProps (state, ownProps) {
  return {
    vegaSpec: state.app.vegaSpec,
    renderer: state.app.renderer,
    mode: state.app.mode,
    errorPane: state.app.errorPane,
    warningsLogger: state.app.warningsLogger,
    error: state.app.error
  };
}

const mapDispatchToProps = function (dispatch) {
  return {
    logError: (err) => {
      dispatch(EditorActions.logError(err));
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Renderer);
