import { connect } from 'react-redux';

import * as EditorActions from '../../actions/editor';
import Renderer from './renderer';

function mapStateToProps(state, ownProps) {
  return {
    error: state.error,
  };
}
const mapDispatchToProps = function(dispatch) {
  return {
    logError: (err) => {
      dispatch(EditorActions.logError(err));
    },
    showErrorPane: () => {
      dispatch(EditorActions.showErrorPane());
    },
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(Renderer);
