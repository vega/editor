import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import * as EditorActions from '../../../actions/editor';
import { State } from '../../../constants/default-state';
import Renderer from './renderer';

export function mapStateToProps(state: State, ownProps) {
  return {
    editorString: state.editorString,
    mode: state.mode,
    view: state.view,
  };
}

export default connect(mapStateToProps)(Renderer);
