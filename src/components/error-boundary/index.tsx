import {connect} from 'react-redux';

import * as EditorActions from '../../actions/editor';
import Renderer from './renderer';
import {State} from '../../constants/default-state';

function mapStateToProps(state: State, ownProps) {
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
