import {connect} from 'react-redux';
import {State} from '../../../constants/default-state';
import {bindActionCreators, Dispatch} from 'redux';
import Renderer from './renderer';
import * as EditorActions from '../../../actions/editor';

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
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(Renderer);
