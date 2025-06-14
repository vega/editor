import Renderer from './renderer.js';

export default Renderer;

// Keeping these for reference during migration
/*
import {connect} from 'react-redux';
import {State} from '../../../constants/default-state.js';
import {bindActionCreators, Dispatch} from 'redux';
import Renderer from './renderer.js';
import * as EditorActions from '../../../actions/editor.js';

export function mapStateToProps(state: State) {
  return {
    editorString: state.editorString,
    isAuthenticated: state.isAuthenticated,
    mode: state.mode,
    handle: state.handle,
  };
}

export function mapDispatchToProps(dispatch: Dispatch<EditorActions.Action>) {
  return bindActionCreators(
    {
      receiveCurrentUser: EditorActions.receiveCurrentUser,
    },
    dispatch,
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(Renderer);
*/
