import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';
import * as EditorActions from '../../actions/editor.js';
import {State} from '../../constants/default-state.js';
import Renderer from './renderer.js';

export function mapStateToProps(state: State) {
  return {
    error: state.error,
  };
}

export function mapDispatchToProps(dispatch: Dispatch<EditorActions.Action>) {
  return bindActionCreators(
    {
      logError: EditorActions.logError,
      toggleDebugPane: EditorActions.toggleDebugPane,
    },
    dispatch,
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(Renderer);
