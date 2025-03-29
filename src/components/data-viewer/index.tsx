import {connect} from 'react-redux';
import {State} from '../../constants/default-state.js';
import Renderer from './renderer.js';

export function mapStateToProps(state: State) {
  return {
    editorRef: state.editorRef,
    view: state.view,
  };
}

export default connect(mapStateToProps)(Renderer);
