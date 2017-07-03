import { connect } from 'react-redux';
import Renderer from './renderer';
import * as EditorActions from '../../actions/editor';

function mapStateToProps (state, ownProps) {
  return {
    error: state.app.error,
    warningsLogger: state.app.warningsLogger,
    errorPane: state.app.errorPane
  };
}

const mapDispatchToProps = function(dispatch) {
  return {
    showErrorPane: () => {
      dispatch(EditorActions.showErrorPane());
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Renderer);
