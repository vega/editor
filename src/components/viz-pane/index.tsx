import { connect } from 'react-redux';

import * as EditorActions from '../../actions/editor';
import { State } from '../../constants/default-state';
import Renderer from './renderer';

function mapStateToProps(state: State, ownProps) {
  return {
    debugPane: state.debugPane,
  };
}

const mapDispatchToProps = dispatch => {
  return {
    toggleDebugPane: () => {
      dispatch(EditorActions.toggleDebugPane());
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Renderer);
