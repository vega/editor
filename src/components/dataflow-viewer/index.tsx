import {connect} from 'react-redux';
import {State} from '../../constants/default-state';
import Renderer from './renderer';

export function mapStateToProps(state: State) {
  return {
    editorRef: state.editorRef,
    runtime: state.runtime,
  };
}

export default connect(mapStateToProps)(Renderer);
