import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import * as EditorActions from '../../actions/editor';
import { State } from '../../constants/default-state';
import Renderer from './renderer';

export function mapStateToProps(state: State, ownProps) {
  return {
    debugPane: state.debugPane,
    debugPaneSize: state.debugPaneSize,
    error: state.error,
    logs: state.logs,
    navItem: state.navItem,
    view: state.view,
  };
}

export function mapDispatchToProps(dispatch: Dispatch<EditorActions.Action>) {
  return bindActionCreators(
    {
      setDebugPaneSize: EditorActions.setDebugPaneSize,
      showLogs: EditorActions.showLogs,
      toggleDebugPane: EditorActions.toggleDebugPane,
      toggleNavbar: EditorActions.toggleNavbar,
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Renderer);
