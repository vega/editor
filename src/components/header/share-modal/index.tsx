import {connect} from 'react-redux';
import {State} from '../../../constants/default-state';
import Renderer from './renderer';

export function mapStateToProps(state: State) {
  return {
    editorString: state.editorString,
    mode: state.mode,
    view: state.view,
  };
}

export default connect(mapStateToProps)(Renderer);
