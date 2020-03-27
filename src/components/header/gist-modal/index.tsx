import {connect} from 'react-redux';
import {bindActionCreators, Dispatch} from 'redux';
import * as EditorActions from '../../../actions/editor';
import {State} from '../../../constants/default-state';
import Renderer from './renderer';

export function mapStateToProps(state: State) {
  return {
    handle: state.handle,
    isAuthenticated: state.isAuthenticated,
    mode: state.mode,
    private: state.private,
  };
}

export function mapDispatchToProps(dispatch: Dispatch<EditorActions.Action>) {
  return bindActionCreators(
    {
      receiveCurrentUser: EditorActions.receiveCurrentUser,
      toggleGistPrivacy: EditorActions.toggleGistPrivacy,
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(Renderer);
