import { connect } from 'react-redux';

import * as EditorActions from '../../actions/editor';
import { State } from '../../constants/default-state';
import Renderer from './renderer';

function mapStateToProps(state: State, ownProps) {
  return {
    editorString: state.editorString,
    view: state.view,
  };
}

export default connect(mapStateToProps)(Renderer);
