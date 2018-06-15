import { connect } from 'react-redux';

import * as EditorActions from '../../actions/editor';
import { State } from '../../constants/default-state';
import Renderer from './renderer';

function mapStateToProps(state: State, ownProps) {
  return {
    dataSets: state.dataSets,
    error: state.error,
    errorPane: state.errorPane,
    warningsLogger: state.warningsLogger,
  };
}

const mapDispatchToProps = dispatch => {
  return {
    showErrorPane: () => {
      dispatch(EditorActions.showErrorPane());
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Renderer);
