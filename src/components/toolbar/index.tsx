import { connect } from 'react-redux';

import * as EditorActions from '../../actions/editor';
import { State } from '../../constants/default-state';
import Renderer from './renderer';

export function mapStateToProps(state: State, ownProps) {
  return {
    error: state.error,
    mode: state.mode,
    renderer: state.renderer,
    warningsLogger: state.warningsLogger,
  };
}

export function mapDispatchToProps(dispatch) {
  return {
    setRenderer: val => {
      dispatch(EditorActions.setRenderer(val));
    },
    toggleDebugPane: () => {
      dispatch(EditorActions.toggleDebugPane());
    },
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Renderer);
