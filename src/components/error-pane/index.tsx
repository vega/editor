import {connect} from 'react-redux';

import * as EditorActions from '../../actions/editor';
import {State} from '../../constants/default-state';
import Renderer from './renderer';

function mapStateToProps(state: State, ownProps) {
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
