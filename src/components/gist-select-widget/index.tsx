import {connect} from 'react-redux';
import {State} from '../../constants/default-state';
import {bindActionCreators, Dispatch} from 'redux';
import * as EditorActions from '../../actions/editor';
import Renderer from './renderer';

export function mapStateToProps(state: State) {
  return {
    isAuthenticated: state.isAuthenticated,
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
