import { connect } from 'react-redux';

import * as EditorActions from '../../actions/editor';
import Renderer from './renderer';

function mapStateToProps(state, ownProps) {
  return {
    error: state.error,
    warningsLogger: state.warningsLogger,
    errorPane: state.errorPane,
  };
}
const mapDispatchToProps = function(dispatch) {
  return {
    showErrorPane: () => {
      dispatch(EditorActions.showErrorPane());
    },
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(Renderer);
