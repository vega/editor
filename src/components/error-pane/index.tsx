import { connect } from 'react-redux';

import { State } from '../../constants/default-state';
import Renderer from './renderer';

function mapStateToProps(state: State, ownProps) {
  return {
    error: state.error,
    errorPane: state.errorPane,
    warningsLogger: state.warningsLogger,
  };
}

export default connect(mapStateToProps)(Renderer);
