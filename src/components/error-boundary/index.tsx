import { connect } from 'react-redux';

import * as EditorActions from '../../actions/editor';
import { State } from '../../constants/default-state';
import Renderer from './renderer';

function mapStateToProps(state: State, ownProps) {
  return {
    error: state.error,
  };
}

const mapDispatchToProps = dispatch => {
  return {
    logError: err => {
      dispatch(EditorActions.logError(err));
    },
    toggleDebugPane: () => {
      dispatch(EditorActions.toggleDebugPane());
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Renderer);
