import { connect } from 'react-redux';

import * as EditorActions from '../../actions/editor';
import { State } from '../../constants/default-state';
import Renderer from './renderer';

function mapStateToProps(state: State, ownProps) {
  return {
    debugPane: state.debugPane,
    debugPaneSize: state.debugPaneSize,
    error: state.error,
    logs: state.logs,
    navItem: state.navItem,
    view: state.view,
  };
}

const mapDispatchToProps = dispatch => {
  return {
    setDebugPaneSize: val => {
      dispatch(EditorActions.setDebugPaneSize(val));
    },
    showLogs: val => {
      dispatch(EditorActions.showLogs(val));
    },
    toggleDebugPane: () => {
      dispatch(EditorActions.toggleDebugPane());
    },
    toggleNavbar: val => {
      dispatch(EditorActions.toggleNavbar(val));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Renderer);
